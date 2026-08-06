import { describe, expect, it } from 'vitest';

import { buildNarrowingHint, buildNoResultsMessage, buildUnknownBrandMessage } from './messages';

describe('buildNoResultsMessage', () => {
  it('names the size and offers WhatsApp, in English', () => {
    const msg = buildNoResultsMessage(false, { w: 225, s: 45, d: 17 });

    expect(msg).toContain('225/45R17');
    expect(msg).toContain('https://wa.me/14073644016');
    expect(msg).toContain('Chat on WhatsApp');
  });

  it('does the same in Spanish', () => {
    const msg = buildNoResultsMessage(true, { w: 225, s: 45, d: 17 });

    expect(msg).toContain('225/45R17');
    expect(msg).toContain('Escribir por WhatsApp');
  });

  it('omits the size when only part of one was given', () => {
    expect(buildNoResultsMessage(false, { d: 17 })).not.toMatch(/\d+\/\d+R\d+/);
  });
});

describe('buildNarrowingHint', () => {
  it('names what is left, in English', () => {
    const hint = buildNarrowingHint(false, ['rim', 'price']);

    expect(hint).toContain('rim size');
    expect(hint).toContain('price');
    expect(hint).toContain(' or ');
  });

  it('names what is left, in Spanish', () => {
    const hint = buildNarrowingHint(true, ['rim', 'price']);

    expect(hint).toContain('aro');
    expect(hint).toContain('precio');
    expect(hint).toContain(' o ');
  });

  it('never names a dimension the search already used', () => {
    // AC5: after a brand-only search the hint offers the rest, not brand again.
    const hint = buildNarrowingHint(false, ['rim', 'condition', 'price']);

    expect(hint).not.toContain('brand');
  });

  it('is empty when nothing is left to narrow', () => {
    // AC6: the hint disappears rather than degrading into an empty sentence.
    expect(buildNarrowingHint(false, [])).toBe('');
    expect(buildNarrowingHint(true, [])).toBe('');
  });

  it('reads naturally with a single option', () => {
    expect(buildNarrowingHint(false, ['price'])).toContain('narrow by price');
  });
});

describe('buildUnknownBrandMessage', () => {
  it('says the brand is not carried, in both languages', () => {
    expect(buildUnknownBrandMessage(false, ['Nokian'])).toContain("don't carry Nokian");
    expect(buildUnknownBrandMessage(true, ['Nokian'])).toContain('No trabajamos Nokian');
  });

  it('is distinguishable from the out-of-stock message', () => {
    // AC8. The two answer different questions: one is "not in our catalog", the
    // other "none right now". A customer waits on one and moves on from the
    // other, so the wording must not be interchangeable.
    const unknown = buildUnknownBrandMessage(false, ['Nokian']);
    const empty = buildNoResultsMessage(false, { brands: 'Nokian' });

    expect(unknown).not.toBe(empty);
    expect(unknown).toContain('catalog');
    expect(empty).toContain('online inventory');
  });

  it('still offers WhatsApp', () => {
    expect(buildUnknownBrandMessage(false, ['Nokian'])).toContain('https://wa.me/14073644016');
  });

  it('lists several brands readably', () => {
    expect(buildUnknownBrandMessage(false, ['Nokian', 'Vredestein'])).toContain(
      'Nokian or Vredestein'
    );
  });
});
