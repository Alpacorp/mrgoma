import type { NextRequest } from 'next/server';

import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Importing this route naively throws `Environment variable SERVER_URL is not
 * set`: it reaches the repository, which reaches `db.ts`, which reads env at
 * module scope, and nothing loads `.env` under Vitest. Mocking the modules
 * beneath the route keeps the database chain out of the import graph entirely —
 * the same approach `api/brands/route.test.ts` uses.
 *
 * A `vi.fn` that rejects is re-reported by Vitest as an unhandled error even
 * when the route catches it, hence the swappable plain functions in `h`.
 */
const h = vi.hoisted(() => ({
  toolInput: null as Record<string, unknown> | null,
  text: 'What size are you looking for?',
  totalCount: 12,
  brands: ['Michelin', 'Pirelli', 'Goodyear'],
}));

vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn }));
vi.mock('@/repositories/tiresRepository', () => ({ fetchBrands: () => h.brands }));
vi.mock('@/app/(shop)/tires/utils/fetchTiresServer', () => ({
  fetchTiresServer: vi.fn(async () => ({ totalCount: h.totalCount })),
}));
vi.mock('@/utils/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn(), log: vi.fn() },
}));
vi.mock('@anthropic-ai/sdk', () => ({
  default: class {
    messages = {
      create: async () => ({
        content: h.toolInput
          ? [{ type: 'tool_use', input: { confirmationMessage: 'Searching…', ...h.toolInput } }]
          : [{ type: 'text', text: h.text }],
      }),
    };
  },
}));

import { fetchTiresServer } from '@/app/(shop)/tires/utils/fetchTiresServer';
import { PUBLIC_EXAMPLE_QUERIES } from '@/app/ui/components/AiChat/exampleQueries';

import { POST } from './route';

let ipCounter = 0;

/** A fresh IP per request so the rate limiter doesn't bleed across tests. */
const req = (body: unknown, ip = `10.0.0.${++ipCounter % 250}`) =>
  ({
    json: async () => body,
    headers: new Headers({ 'x-forwarded-for': ip }),
  }) as unknown as NextRequest;

const ask = (text: string) => req({ messages: [{ role: 'user', content: text }] });

beforeEach(() => {
  h.toolInput = null;
  h.text = 'What size are you looking for?';
  h.totalCount = 12;
  h.brands = ['Michelin', 'Pirelli', 'Goodyear'];
  vi.mocked(fetchTiresServer).mockClear();
});

describe('partial filters are complete searches', () => {
  it('searches on a brand alone, without asking for a size', async () => {
    h.toolInput = { brands: 'Michelin' };

    const body = await (await POST(ask('Michelin'))).json();

    expect(body.type).toBe('filters');
    expect(body.filters.brands).toBe('Michelin');
  });

  it('searches on a rim alone', async () => {
    h.toolInput = { d: 17 };

    const body = await (await POST(ask('aro 17'))).json();

    expect(body.type).toBe('filters');
    expect(body.filters.d).toBe(17);
  });

  it('searches on a condition and a price alone', async () => {
    h.toolInput = { condition: 'used', maxPrice: 80 };

    const body = await (await POST(ask('used tires under $80'))).json();

    expect(body.type).toBe('filters');
  });

  it('still asks when the customer gave nothing to search on', async () => {
    // AC4 — the unblocking must not turn into guessing.
    h.toolInput = null;

    const body = await (await POST(ask('I need tires'))).json();

    expect(body.type).toBe('message');
    expect(body.message).toContain('size');
  });
});

describe('the narrowing hint', () => {
  it('offers what is left and never what was used', async () => {
    h.toolInput = { brands: 'Michelin' };

    const body = await (await POST(ask('Michelin'))).json();

    expect(body.message).toContain('I can also narrow by');
    expect(body.message).not.toMatch(/narrow by[^.]*\bbrand\b/);
  });

  it('disappears when every dimension is in play', async () => {
    h.toolInput = {
      w: 225,
      s: 45,
      d: 17,
      brands: 'Michelin',
      condition: 'used',
      minPrice: 40,
      minTreadDepth: 5,
      stores: 'Hialeah',
    };

    const body = await (await POST(ask('everything'))).json();

    expect(body.message).toBe('Searching…');
  });
});

describe('ordering', () => {
  it('passes an ordering through to the listing', async () => {
    h.toolInput = { condition: 'used', sort: 'price-asc' };

    const body = await (await POST(ask('cheapest used tires'))).json();

    expect(body.filters.sort).toBe('price-asc');
  });

  it('is not counted as a way of narrowing', async () => {
    h.toolInput = { sort: 'price-desc' };

    const body = await (await POST(ask('most expensive first'))).json();

    expect(body.dimensions).toBe('');
  });
});

describe('a brand we do not carry', () => {
  it('is named as such, not reported as out of stock', async () => {
    h.toolInput = { brands: 'Nokian' };

    const body = await (await POST(ask('Nokian'))).json();

    expect(body.type).toBe('no_results');
    expect(body.message).toContain("don't carry Nokian");
  });

  it('costs no inventory query', async () => {
    h.toolInput = { brands: 'Nokian' };

    await POST(ask('Nokian'));

    expect(fetchTiresServer).not.toHaveBeenCalled();
  });

  it('does not fire for a brand we do carry', async () => {
    h.toolInput = { brands: 'michelin' };

    const body = await (await POST(ask('michelin'))).json();

    expect(body.type).toBe('filters');
  });
});

describe('an empty result set', () => {
  it('is reported as no_results, with the dimensions used', async () => {
    h.toolInput = { d: 17, condition: 'new' };
    h.totalCount = 0;

    const body = await (await POST(ask('new tires rim 17'))).json();

    expect(body.type).toBe('no_results');
    expect(body.dimensions).toBe('rim,condition');
    expect(body.message).toContain('WhatsApp');
  });

  it('carries no filters, so nothing navigates to an empty listing', async () => {
    h.toolInput = { d: 17 };
    h.totalCount = 0;

    const body = await (await POST(ask('rim 17'))).json();

    expect(body.filters).toBeUndefined();
  });
});

describe('the dimensions reported', () => {
  it('names what was filtered, never what the customer typed', async () => {
    h.toolInput = { brands: 'Michelin', stores: 'Hialeah' };

    const body = await (await POST(ask('Michelin in Hialeah'))).json();

    expect(body.dimensions).toBe('brand,store');
    expect(body.dimensions).not.toContain('Michelin');
    expect(body.dimensions).not.toContain('Hialeah');
  });
});

describe('the prompts the chat advertises', () => {
  // AC16. Three of the seven suggestions the interface offers a new visitor were
  // partial filters the assistant refused to honour. Driving the cases from the
  // array means a prompt added later without support fails here.
  const CASES: Record<string, Record<string, unknown> | null> = {
    '205/55/16 nuevas Michelin': { w: 205, s: 55, d: 16, condition: 'new', brands: 'Michelin' },
    'used Michelin aro 17': { d: 17, condition: 'used', brands: 'Michelin' },
    'usadas menos de $50': { condition: 'used', maxPrice: 50 },
    '¿qué diferencia hay entre nueva y usada?': null,
    '195/65/15 with more than 50% life': { w: 195, s: 65, d: 15, minRemainingLife: 50 },
    Pirelli: { brands: 'Pirelli' },
    'used tires under $80': { condition: 'used', maxPrice: 80 },
  };

  it('covers every prompt the component offers', () => {
    expect(Object.keys(CASES).sort()).toEqual([...PUBLIC_EXAMPLE_QUERIES].sort());
  });

  for (const [prompt, toolInput] of Object.entries(CASES)) {
    it(`honours "${prompt}"`, async () => {
      h.toolInput = toolInput;
      h.text = 'A new tire has full tread; a used one is inspected and warrantied.';

      const body = await (await POST(ask(prompt))).json();

      expect(body.type).toBe(toolInput ? 'filters' : 'message');
    });
  }
});

describe('protecting an anonymous, paid endpoint', () => {
  it('rejects a conversation longer than the cap before calling the model', async () => {
    const messages = Array.from({ length: 41 }, () => ({ role: 'user', content: 'hi' }));

    const res = await POST(req({ messages }));

    expect(res.status).toBe(400);
  });

  it('rejects a single over-long message', async () => {
    const messages = [{ role: 'user', content: 'x'.repeat(2001) }];

    const res = await POST(req({ messages }));

    expect(res.status).toBe(400);
  });

  it('lets a normal conversation through', async () => {
    const messages = Array.from({ length: 12 }, () => ({ role: 'user', content: 'Michelin' }));

    const res = await POST(req({ messages }));

    expect(res.status).toBe(200);
  });

  it('rate-limits a flood from one address', async () => {
    const flood = '203.0.113.9';
    let last = 200;

    for (let i = 0; i < 21; i++) {
      last = (await POST(req({ messages: [{ role: 'user', content: 'hi' }] }, flood))).status;
    }

    expect(last).toBe(429);
  });
});
