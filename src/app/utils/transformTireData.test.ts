import { describe, expect, it } from 'vitest';

import type { TiresData } from '@/app/interfaces/tires';

import { createPaginatedResponse, transformTireData } from './transformTireData';

const raw = {
  TireId: '42',
  Code: 'ABC',
  Brand: 'Michelin',
  Model2: 'Pilot',
  RealSize: '225/40/18',
  Price: 99,
  ProductTypeId: 1, // New
  Patched: '0',
  RemainingLife: '80%',
  Tread: '8',
  KindSaleId: 1,
  BrandId: 7,
} as unknown as TiresData;

describe('transformTireData', () => {
  it('maps a DB record to the UI shape', () => {
    const t = transformTireData(raw);
    expect(t.id).toBe('42');
    expect(t.brand).toBe('Michelin');
    expect(t.price).toBe('99');
    expect(t.condition).toBe('New');
    expect(t.brandId).toBe(7);
    expect(t.name).toContain('Michelin');
  });

  it('treats ProductTypeId !== 1 as Used and Patched "0" as No', () => {
    const t = transformTireData({ ...raw, ProductTypeId: 2 } as unknown as TiresData);
    expect(t.condition).toBe('Used');
    expect(t.features.find(f => f.name === 'Patched')?.value).toBe('No');
  });

  it('falls back to defaults when fields are missing', () => {
    const t = transformTireData({ TireId: '1', Code: 'X' } as unknown as TiresData);
    expect(t.imageSrc).toContain('generic-tire-image');
    expect(t.brand).toBe('Unknown');
    expect(t.price).toBe('-');
  });
});

describe('createPaginatedResponse', () => {
  it('computes totalPages and wraps the transformed tires', () => {
    const res = createPaginatedResponse([raw], 1, 10, 25);
    expect(res.totalPages).toBe(3);
    expect(res.page).toBe(1);
    expect(res.tires).toHaveLength(1);
    expect(res.tires[0].id).toBe('42');
  });

  it('includes an error message when provided', () => {
    const res = createPaginatedResponse([], 1, 10, 0, 'boom');
    expect(res.error).toBe('boom');
  });
});
