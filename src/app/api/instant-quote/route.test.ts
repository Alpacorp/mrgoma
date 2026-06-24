import type { NextRequest } from 'next/server';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/utils/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

import { POST } from './route';

const makeReq = (body: unknown, headers: Record<string, string> = {}) =>
  ({
    headers: new Headers(headers),
    json: async () => body,
    nextUrl: { toString: () => 'http://x/api/instant-quote' },
  }) as unknown as NextRequest;

beforeEach(() => vi.unstubAllEnvs());
afterEach(() => vi.unstubAllGlobals());

describe('POST /api/instant-quote', () => {
  it('returns 500 when the webhook is not configured', async () => {
    vi.stubEnv('N8N_WEBHOOK_URL', '');
    const res = await POST(makeReq({ size: '225/40/18', name: 'J', email: 'a@b.co' }));
    expect(res.status).toBe(500);
  });

  it('returns 400 when required fields are missing', async () => {
    vi.stubEnv('N8N_WEBHOOK_URL', 'http://webhook');
    const res = await POST(makeReq({}));
    expect(res.status).toBe(400);
  });

  it('forwards a valid lead to the webhook', async () => {
    vi.stubEnv('N8N_WEBHOOK_URL', 'http://webhook');
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    vi.stubGlobal('fetch', fetchMock);

    const res = await POST(makeReq({ size: '225/40/18', name: 'John', email: 'john@a.co' }));

    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe('http://webhook');
  });
});
