import type { NextRequest } from 'next/server';

import { describe, expect, it, vi } from 'vitest';

const logs = vi.hoisted(() => [] as unknown[][]);
vi.mock('@/utils/logger', () => ({
  logger: {
    log: (...a: unknown[]) => logs.push(a),
    error: (...a: unknown[]) => logs.push(a),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

import { GET } from './route';

const req = (headers: Record<string, string> = {}) =>
  ({
    url: 'https://www.mrgomatires.com/api/visitor-city',
    method: 'GET',
    headers: new Headers(headers),
  }) as unknown as NextRequest;

const geo = (lat: string, lng: string) => ({
  'x-vercel-ip-latitude': lat,
  'x-vercel-ip-longitude': lng,
});

describe('GET /api/visitor-city', () => {
  it('answers Miami with the nearest store for a Hialeah position', async () => {
    const res = await GET(req(geo('25.8576', '-80.2781')));
    expect(await res.json()).toEqual({ city: 'Miami', nearestStoreId: expect.any(String) });
    expect(res.headers.get('Cache-Control')).toBe('private, no-store');
  });

  it('answers Orlando for Kissimmee and no city for Tampa', async () => {
    expect((await (await GET(req(geo('28.2919', '-81.4076')))).json()).city).toBe('Orlando');
    expect(await (await GET(req(geo('27.9506', '-82.4572')))).json()).toEqual({
      city: null,
      nearestStoreId: null,
    });
  });

  it('answers no city without headers or with garbage (AC13)', async () => {
    expect((await (await GET(req())).json()).city).toBeNull();
    expect((await (await GET(req(geo('abc', '-80')))).json()).city).toBeNull();
    expect((await (await GET(req(geo('123', '-80')))).json()).city).toBeNull();
  });

  it('never returns or logs the coordinates (AC9)', async () => {
    logs.length = 0;
    const res = await GET(req(geo('25.8576', '-80.2781')));
    const text = JSON.stringify(await res.json()) + JSON.stringify(logs);
    expect(text).not.toMatch(/25\.85|80\.27/);
  });
});
