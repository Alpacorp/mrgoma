import type { NextRequest } from 'next/server';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/utils/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn(), log: vi.fn() },
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

  it('rejects a disallowed origin with 403', async () => {
    vi.stubEnv('N8N_WEBHOOK_URL', 'http://webhook');
    const res = await POST(makeReq({}, { origin: 'http://evil.example' }));
    expect(res.status).toBe(403);
  });

  it('silently accepts (200) when the honeypot is filled', async () => {
    vi.stubEnv('N8N_WEBHOOK_URL', 'http://webhook');
    const res = await POST(makeReq({ hp: 'bot', size: '225/40/18', name: 'J', email: 'a@b.co' }));
    expect(res.status).toBe(200);
  });

  it('rate-limits after too many requests from one IP', async () => {
    vi.stubEnv('N8N_WEBHOOK_URL', 'http://webhook');
    const headers = { 'x-forwarded-for': '9.9.9.9' };
    let res!: Response;
    for (let i = 0; i < 6; i++) res = await POST(makeReq({}, headers));
    expect(res.status).toBe(429);
  });

  it('returns 502 when the upstream webhook fails', async () => {
    vi.stubEnv('N8N_WEBHOOK_URL', 'http://webhook');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'oops',
        json: async () => ({}),
      })
    );
    const res = await POST(makeReq({ size: '225/40/18', name: 'J', email: 'a@b.co' }));
    expect(res.status).toBe(502);
  });
});
