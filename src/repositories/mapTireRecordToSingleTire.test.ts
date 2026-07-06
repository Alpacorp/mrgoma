import { describe, expect, it } from 'vitest';

import type { DocumentRecord } from '@/repositories/tiresRepository';

import { mapTireRecordToSingleTire } from './mapTireRecordToSingleTire';

const baseRecord: DocumentRecord = {
  TireId: '42',
  Code: 'ABC',
  Brand: 'Michelin',
  Model2: 'Primacy',
  RealSize: '225/40/18',
  Price: 99,
  ProductTypeId: 1,
  Condition: 'New',
  Patched: '0',
  RemainingLife: '80%',
  Tread: '7/32',
  DOT: '2419',
  loadIndex: '92',
  speedIndex: 'V',
  Description: 'A great tire',
  Image1: 'https://cdn/img1.webp',
  Image2: 'https://cdn/img2.webp',
};

describe('mapTireRecordToSingleTire', () => {
  it('maps core fields to the SingleTire shape', () => {
    const t = mapTireRecordToSingleTire(baseRecord);
    expect(t.id).toBe('42');
    expect(t.name).toBe('(ABC) | Michelin | 225/40/18');
    expect(t.brand).toBe('Michelin');
    expect(t.condition).toBe('New'); // ProductTypeId === 1
    expect(t.price).toBe('99');
    expect(t.patched).toBe('No'); // '0' -> 'No'
    expect(t.remainingLife).toBe('80%');
    expect(t.treadDepth).toBe('7/32');
  });

  it('includes description and the extra spec fields', () => {
    const t = mapTireRecordToSingleTire(baseRecord);
    expect(t.description).toBe('A great tire');
    expect(t.size).toBe('225/40/18');
    expect(t.loadIndex).toBe('92');
    expect(t.speedIndex).toBe('V');
    expect(t.dot).toBe('2419');
  });

  it('builds the images array from available image URLs', () => {
    const t = mapTireRecordToSingleTire(baseRecord);
    expect(t.images).toHaveLength(2);
    expect(t.images[0].src).toBe('https://cdn/img1.webp');
    expect(t.images[0].alt).toBe('Michelin Primacy 225/40/18');
  });

  it('falls back to the generic image when none are present', () => {
    const t = mapTireRecordToSingleTire({ ...baseRecord, Image1: undefined, Image2: undefined });
    expect(t.images).toHaveLength(1);
    expect(t.images[0].src).toBe('/assets/images/generic-tire-image.webp');
  });

  it('marks Used tires and carries DB status through for availability', () => {
    const t = mapTireRecordToSingleTire({ ...baseRecord, ProductTypeId: 2, Condition: 'sold' });
    expect(t.condition).toBe('Used'); // ProductTypeId !== 1
    expect(t.status).toBe('sold'); // used by the UI to show "Not available"
  });

  it('exposes details as a one-entry array of grouped items', () => {
    const t = mapTireRecordToSingleTire(baseRecord);
    expect(Array.isArray(t.details)).toBe(true);
    expect(t.details[0].name).toBe('More Details');
    expect(t.details[0].items).toContain('Load Index: 92');
    expect(t.details[0].items).toContain('Speed Index: V');
  });
});
