import { describe, expect, it } from 'vitest';

import { formatTireSize } from './formatTireSize';

describe('formatTireSize', () => {
  it('returns the input unchanged for 3 or fewer digits', () => {
    expect(formatTireSize('225')).toBe('225');
    expect(formatTireSize('22')).toBe('22');
  });

  it('formats width/sidewall for 4-5 digits', () => {
    expect(formatTireSize('2254')).toBe('225/4');
    expect(formatTireSize('22540')).toBe('225/40');
  });

  it('formats width/sidewall/diameter for 6-7 digits', () => {
    expect(formatTireSize('225401')).toBe('225/40/1');
    expect(formatTireSize('2254018')).toBe('225/40/18');
  });
});
