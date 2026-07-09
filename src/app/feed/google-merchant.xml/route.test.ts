import type { NextRequest } from 'next/server';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GET } from '@/app/feed/google-merchant.xml/route';

// `unstable_cache` needs Next's request context; make it a passthrough so the
// route runs in vitest. Mock the repository so no DB/env chain is imported.
// vitest hoists these vi.mock/vi.hoisted calls above the imports above.
const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }));
vi.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn }));
vi.mock('@/repositories/tiresRepository', () => ({ fetchSellableTiresForFeed: fetchMock }));

const TOKEN = 'test-token';
const makeReq = (url: string) => ({ method: 'GET', url }) as unknown as NextRequest;

const sampleRecord = {
  TireId: '591388',
  Brand: 'Michelin',
  RealSize: '225/40/18',
  Price: 80,
  ProductTypeId: 2,
  RemainingLife: '80%',
  Patched: '0',
  Image1: 'https://www.usedtires.online/img/1.jpg',
};

beforeEach(() => {
  process.env.MERCHANT_FEED_TOKEN = TOKEN;
  fetchMock.mockReset();
  fetchMock.mockResolvedValue([sampleRecord]);
});

describe('GET /feed/google-merchant.xml', () => {
  it('returns 403 without a key', async () => {
    const res = await GET(makeReq('https://site.test/feed/google-merchant.xml'));
    expect(res.status).toBe(403);
  });

  it('returns 403 with a wrong key', async () => {
    const res = await GET(makeReq('https://site.test/feed/google-merchant.xml?key=nope'));
    expect(res.status).toBe(403);
  });

  it('returns 200 XML with the correct key', async () => {
    const res = await GET(makeReq(`https://site.test/feed/google-merchant.xml?key=${TOKEN}`));
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('application/xml');
    expect(res.headers.get('Cache-Control')).toContain('s-maxage=43200');
    const body = await res.text();
    expect(body).toContain('xmlns:g="http://base.google.com/ns/1.0"');
    expect(body).toContain('<g:id>591388</g:id>');
  });

  it('returns 503 when the token env is not configured', async () => {
    delete process.env.MERCHANT_FEED_TOKEN;
    const res = await GET(makeReq(`https://site.test/feed/google-merchant.xml?key=${TOKEN}`));
    expect(res.status).toBe(503);
  });

  it('returns a generic 500 (no leak) when the fetch fails', async () => {
    fetchMock.mockRejectedValue(new Error('DB connection string secret=abc failed'));
    const res = await GET(makeReq(`https://site.test/feed/google-merchant.xml?key=${TOKEN}`));
    expect(res.status).toBe(500);
    const body = await res.text();
    expect(body).toBe('Internal Server Error');
    expect(body).not.toContain('secret');
  });
});
