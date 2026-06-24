import { describe, expect, it } from 'vitest';

import { cleanInput } from './cleanInput';

describe('cleanInput', () => {
  it('strips every non-digit character', () => {
    expect(cleanInput('225/40 R18')).toBe('2254018');
    expect(cleanInput('1a2b3')).toBe('123');
    expect(cleanInput('abc')).toBe('');
    expect(cleanInput('')).toBe('');
  });
});
