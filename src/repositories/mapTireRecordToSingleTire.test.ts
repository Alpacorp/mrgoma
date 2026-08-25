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
  it('carries the stock code as its own field, not only inside the name', () => {
    const t = mapTireRecordToSingleTire(baseRecord);
    expect(t.code).toBe('ABC');
    // It stays in the display name too — nothing about that changed.
    expect(t.name).toContain('(ABC)');
  });

  it('omits the code rather than emitting an empty one', () => {
    expect(mapTireRecordToSingleTire({ ...baseRecord, Code: '' }).code).toBeUndefined();
  });

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

  it('includes the extra spec fields', () => {
    const t = mapTireRecordToSingleTire(baseRecord);
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

/**
 * The city comes from the warehouse, and the warehouse name itself must not
 * travel with it. `pickTireListFields` already keeps `VaultName` off the public
 * list API and the Merchant whitelist keeps it out of the feed; the detail page
 * is the surface where it could still have leaked.
 */
describe('the city a tire is in', () => {
  const base = { TireId: '1', Code: 'X', Patched: '0', ProductTypeId: 2 } as never;

  it('derives Orlando from an Orlando warehouse', () => {
    expect(
      mapTireRecordToSingleTire({ ...(base as object), VaultName: 'Clifton' } as never).city
    ).toBe('Orlando');
    expect(
      mapTireRecordToSingleTire({ ...(base as object), VaultName: 'Semoran' } as never).city
    ).toBe('Orlando');
  });

  it('derives Miami from a Miami warehouse', () => {
    expect(
      mapTireRecordToSingleTire({ ...(base as object), VaultName: 'Hialeah' } as never).city
    ).toBe('Miami');
  });

  it('never exposes the warehouse name itself', () => {
    const mapped = mapTireRecordToSingleTire({
      ...(base as object),
      VaultName: 'Clifton',
    } as never);
    expect(JSON.stringify(mapped)).not.toContain('Clifton');
    expect('VaultName' in mapped).toBe(false);
  });
});

/**
 * The `Description` column holds internal purchase notes, not descriptions:
 * `$71 advance`, `45.95`, `62 Advance`, `175 TR`. Until 2026-08-24 the mapper
 * copied it into the object serialized to the browser, so it sat in the page
 * source of 985 listings — and the Merchant feed published it outright.
 *
 * Nothing in the UI ever read it: `ProductDescription` renders the *generated*
 * text. So this asserts the note leaves no trace at all.
 */
describe('the internal purchase note never leaves the database', () => {
  it('is absent from the mapped tire, whatever the column holds', () => {
    const mapped = mapTireRecordToSingleTire({
      ...(baseRecord as object),
      Description: '$71 advance',
    } as never);

    expect(JSON.stringify(mapped)).not.toContain('advance');
    expect(JSON.stringify(mapped)).not.toContain('71');
    expect('description' in mapped).toBe(false);
  });
});
