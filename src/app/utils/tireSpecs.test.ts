import { describe, expect, it } from 'vitest';

import { PATCHED_EXPLANATION, patchedNote, treadDepthLabel } from './tireSpecs';

/**
 * The card showed `TREAD 8.0`. Tread is measured in thirty-seconds of an inch,
 * so a bare number is unreadable to the buyer it exists to reassure: a new tire
 * is about 10/32" and the legal minimum is 2/32", which makes 8/32" mean
 * something and 8.0 mean nothing.
 */
describe('treadDepthLabel', () => {
  it('gives the number its unit', () => {
    expect(treadDepthLabel('8.0')).toBe('8/32"');
    expect(treadDepthLabel(10)).toBe('10/32"');
  });

  it('keeps a half step, which is a real reading', () => {
    expect(treadDepthLabel('7.5')).toBe('7.5/32"');
  });

  it('does not double a unit that is already there', () => {
    expect(treadDepthLabel('8/32"')).toBe('8/32"');
  });

  it('shows a dash rather than a unit attached to nothing', () => {
    for (const empty of ['', '-', 'N/A', undefined, null]) {
      expect(treadDepthLabel(empty)).toBe('—');
    }
  });

  it('passes through anything it cannot read, rather than inventing a number', () => {
    expect(treadDepthLabel('unknown')).toBe('unknown');
  });
});

/**
 * "Patched: Yes" on its own reads as a warning, at exactly the moment a buyer of
 * used tires hesitates. The answer to a scary-sounding truth is context.
 */
describe('patchedNote', () => {
  it('explains a patched tire', () => {
    expect(patchedNote('Yes')).toBe(PATCHED_EXPLANATION);
    expect(patchedNote('yes')).toBe(PATCHED_EXPLANATION);
  });

  it('says nothing when there is nothing to explain', () => {
    for (const no of ['No', 'no', '', undefined, null]) {
      expect(patchedNote(no)).toBeUndefined();
    }
  });

  it('names the standard, not just "it is fine"', () => {
    expect(PATCHED_EXPLANATION).toMatch(/DOT/);
  });
});
