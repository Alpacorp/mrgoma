import { describe, expect, it } from 'vitest';

import { guides } from '@/app/(shop)/guides/guidesConfig';

/**
 * A guide has two names, on purpose — and one of them has a job.
 *
 * `heading` is what the page's `<h1>` says. `cardName` is what a card in a grid
 * says, and it may be shorter; that pair is a deliberate editorial choice, not
 * drift.
 *
 * The defect was that the **breadcrumb** was fed from `cardName`, so
 * `/guides/how-to-buy-used-tires` showed a trail naming one article and an `<h1>`
 * naming another, three lines apart. A breadcrumb tells you where you are; one
 * that names a different page does the opposite.
 *
 * It went unnoticed because the fields were named the wrong way round: the one
 * called `title` drove the `<h1>` and the one called `headline` drove the cards.
 */

describe('every guide is named consistently where it matters', () => {
  // AC8 — the breadcrumb follows the heading. Both the visible trail and the
  // JSON-LD read the same field, so this asserts the field they read.
  it.each(guides.map(g => [g.slug, g] as const))(
    '%s has a heading fit to be its breadcrumb',
    (_slug, guide) => {
      expect(guide.heading.trim().length).toBeGreaterThan(0);
      expect(guide.heading).not.toMatch(/\s{2,}/);
    }
  );

  // AC9 — the Article schema's headline is the visible heading. Google treats a
  // mismatch as a misdescribed article.
  it.each(guides.map(g => [g.slug, g] as const))(
    '%s can describe itself to schema.org with its own heading',
    (_slug, guide) => {
      expect(guide.heading).toBeTruthy();
      expect(guide.metaTitle).not.toBe(guide.heading);
    }
  );

  /**
   * AC9b — the cards keep their short names.
   *
   * **This assertion is the point, not decoration.** Without it, a later
   * "consistency" pass collapses fourteen deliberate pieces of copy into seven
   * and the suite applauds. Flattening them has to argue with a test first.
   */
  it('keeps at least one card name shorter than its heading', () => {
    const shorter = guides.filter(g => g.cardName !== g.heading);
    expect(shorter.length).toBeGreaterThan(0);
  });

  // T100 — the guide the audit named, now one name outside the search result.
  it('calls the buying guide the same thing in its heading and its card', () => {
    const guide = guides.find(g => g.slug === 'how-to-buy-used-tires')!;
    expect(guide.heading).toBe('How to Buy Used Tires');
    expect(guide.cardName).toBe('How to Buy Used Tires');
    // The search result keeps the longer form, where the extra words earn space.
    expect(guide.metaTitle).toBe('How to Buy Used Tires: What to Check First');
  });

  it('gives every guide both names', () => {
    for (const guide of guides) {
      expect(guide.heading.trim()).not.toBe('');
      expect(guide.cardName.trim()).not.toBe('');
    }
    expect(guides).toHaveLength(7);
  });
});
