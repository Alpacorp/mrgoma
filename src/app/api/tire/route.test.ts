import type { NextRequest } from 'next/server';

import { type Mock, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the repository so the route never loads the DB connection module.
vi.mock('@/repositories/tiresRepository', () => ({ fetchTireById: vi.fn() }));

import { fetchTireById } from '@/repositories/tiresRepository';

import { GET } from './route';

const mockFetch = fetchTireById as unknown as Mock;
const req = (url: string) => ({ url }) as unknown as NextRequest;

beforeEach(() => mockFetch.mockReset());

describe('GET /api/tire', () => {
  it('returns 400 when productId is missing', async () => {
    const res = await GET(req('http://x/api/tire'));
    expect(res.status).toBe(400);
  });

  it('returns 404 when the tire is not found', async () => {
    mockFetch.mockResolvedValue(null);
    const res = await GET(req('http://x/api/tire?productId=99'));
    expect(res.status).toBe(404);
  });

  it('maps the DB record to a SingleTire payload on success', async () => {
    mockFetch.mockResolvedValue({
      TireId: '42',
      Code: 'ABC',
      Brand: 'Michelin',
      RealSize: '225/40/18',
      Price: 99,
      ProductTypeId: 1,
      Condition: 'New',
      Patched: '0',
    });
    const res = await GET(req('http://x/api/tire?productId=42'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe('42');
    expect(body.brand).toBe('Michelin');
    expect(body.condition).toBe('New');
  });
});
