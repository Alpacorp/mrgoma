import { describe, expect, it } from 'vitest';

import { buildTireSlug, extractIdFromSlug, slugify } from './tireSlug';

describe('slugify', () => {
  it('lowercases and replaces non-alphanumerics with single hyphens', () => {
    expect(slugify('Pirelli P-Zero')).toBe('pirelli-p-zero');
    expect(slugify('225/40/18')).toBe('225-40-18');
  });

  it('trims leading and trailing hyphens', () => {
    expect(slugify('  Hello!  ')).toBe('hello');
    expect(slugify('***')).toBe('');
  });
});

describe('buildTireSlug', () => {
  it('joins id, brand and size', () => {
    expect(buildTireSlug('591388', 'SureDrive', '225/40/18')).toBe('591388-suredrive-225-40-18');
  });

  it('omits empty brand/size segments but always keeps the id', () => {
    expect(buildTireSlug('123', '', '')).toBe('123');
    expect(buildTireSlug('123', 'Michelin', '')).toBe('123-michelin');
  });
});

describe('extractIdFromSlug', () => {
  it('returns the first (numeric id) segment', () => {
    expect(extractIdFromSlug('591388-suredrive-225-40-18')).toBe('591388');
    expect(extractIdFromSlug('123')).toBe('123');
  });
});
