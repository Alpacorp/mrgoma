import type { NextRequest } from 'next/server';

import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * The staff assistant. Its prompt never carried the public one's blocking
 * script — it has always been told to "extract the relevant filter criteria and
 * use the tool" — so these tests exist to keep that true rather than to change
 * it. A seller looking up "Michelin rim 17" with a customer on the phone should
 * not be asked for a size either.
 */
const h = vi.hoisted(() => ({
  toolInput: null as Record<string, unknown> | null,
  session: { user: { name: 'seller' } } as unknown,
  // What we actually sent Claude: the tool schema and the system prompt.
  sent: null as Record<string, unknown> | null,
}));

vi.mock('@/app/utils/authOptions', () => ({ auth: async () => h.session }));
vi.mock('@/utils/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn(), log: vi.fn() },
}));
vi.mock('@anthropic-ai/sdk', () => ({
  default: class {
    messages = {
      create: async (payload: Record<string, unknown>) => ((h.sent = payload), {
        content: h.toolInput
          ? [{ type: 'tool_use', input: { confirmationMessage: 'Filtering…', ...h.toolInput } }]
          : [{ type: 'text', text: 'Which size?' }],
      }),
    };
  },
}));

import { POST } from './route';

let ipCounter = 0;

const req = (body: unknown) =>
  ({
    json: async () => body,
    headers: new Headers({ 'x-forwarded-for': `10.1.0.${++ipCounter % 250}` }),
  }) as unknown as NextRequest;

const ask = (text: string) => req({ messages: [{ role: 'user', content: text }] });

beforeEach(() => {
  h.toolInput = null;
  h.session = { user: { name: 'seller' } };
});

describe('the staff assistant searches on partial filters too', () => {
  it('accepts a brand on its own', async () => {
    h.toolInput = { brands: 'Michelin' };

    const body = await (await POST(ask('Michelin'))).json();

    expect(body.type).toBe('filters');
    expect(body.filters.brands).toBe('Michelin');
  });

  it('accepts a rim on its own', async () => {
    h.toolInput = { d: 17 };

    const body = await (await POST(ask('rim 17'))).json();

    expect(body.type).toBe('filters');
  });
});

describe('ordering', () => {
  it('passes an ordering through', async () => {
    h.toolInput = { brands: 'Pirelli', sort: 'price-desc' };

    const body = await (await POST(ask('Pirelli, most expensive first'))).json();

    expect(body.filters.sort).toBe('price-desc');
  });
});

describe('what the events will carry', () => {
  it('reports the dimensions used, including the internal filters', async () => {
    h.toolInput = { brands: 'Michelin', code: '12345' };

    const body = await (await POST(ask('Michelin code 12345'))).json();

    expect(body.dimensions).toBe('brand,code');
  });

  it('names dimensions, never the values', async () => {
    h.toolInput = { brands: 'Michelin', stores: 'Hialeah' };

    const body = await (await POST(ask('Michelin in Hialeah'))).json();

    expect(body.dimensions).not.toContain('Michelin');
    expect(body.dimensions).not.toContain('Hialeah');
  });
});

describe('access', () => {
  it('still refuses an unauthenticated caller', async () => {
    h.session = null;

    const res = await POST(ask('Michelin'));

    expect(res.status).toBe(401);
  });
});

/**
 * A shelf code is the one filter value the assistant cannot reason about.
 *
 * It can recognise `Michelin` and `Hialeah` as things that plausibly exist. It
 * has no way to know that `+703C+` is a real shelf and `+703Z+` is not — and a
 * guessed code returns an empty table, which a seller reads as missing stock
 * rather than a bad guess. So the prompt has to forbid inventing one, and the
 * schema has to make a code inseparable from its store.
 */
describe('the shelf filter', () => {
  const tool = () => {
    const tools = h.sent?.tools as { name: string; input_schema: Record<string, never> }[];
    return tools.find(t => t.name === 'apply_filters')!;
  };

  // AC10
  it('offers locations as store-and-code pairs, never bare codes', async () => {
    await POST(ask('anything'));

    const locations = (tool().input_schema as unknown as { properties: Record<string, never> })
      .properties.locations as unknown as {
      type: string;
      items: { properties: Record<string, unknown>; required: string[] };
    };

    expect(locations.type).toBe('array');
    expect(Object.keys(locations.items.properties).sort()).toEqual(['code', 'store']);
    expect(locations.items.required.sort()).toEqual(['code', 'store']);
  });

  it('tells the assistant never to invent a code, and that one needs a store', async () => {
    await POST(ask('anything'));

    const system = String(h.sent?.system);
    expect(system).toMatch(/NEVER invent a shelf code/i);
    expect(system).toMatch(/without a store is not a filter/i);
  });

  it('passes a pair straight through when the assistant produces one', async () => {
    h.toolInput = { locations: [{ store: 'Hialeah', code: '+703C+' }] };

    const body = await (await POST(ask('shelf +703C+ in Hialeah'))).json();

    expect(body.filters.locations).toEqual([{ store: 'Hialeah', code: '+703C+' }]);
  });
});
