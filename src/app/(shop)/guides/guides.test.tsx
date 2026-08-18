import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { guides } from '@/app/(shop)/guides/guidesConfig';

import GuidesPage from './page';

/**
 * `/guides` used to be one flat level: eleven `<h2>`s, of which three were
 * section names and seven were the cards sitting inside those sections. A
 * screen-reader user jumping by heading got eleven siblings instead of three
 * groups of guides.
 *
 * The home page had it right all along — its guide cards are `<h3>` — so this is
 * the two grids agreeing rather than a new convention.
 */
describe('the guides list has a shape', () => {
  it('has exactly one h1', () => {
    render(<GuidesPage />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  /**
   * **Four, not three.** Three section names plus the call-to-action further
   * down the page, which is a peer of the sections and does not move. Counting
   * three is the mistake the audit's wording invites.
   */
  it('keeps four h2s — the three sections and the call to action', () => {
    render(<GuidesPage />);
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(4);
  });

  it('puts every guide card a level below its section', () => {
    render(<GuidesPage />);
    const cards = screen.getAllByRole('heading', { level: 3 });
    expect(cards).toHaveLength(guides.length);
    expect(guides.length).toBe(7);
  });

  // The page's own heading, and the reason this feature exists.
  it('reads its own heading as a phrase, not a run-on', () => {
    render(<GuidesPage />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent?.replace(/\s+/g, ' ').trim()).toBe('Tire Guides & Tips');
    expect(h1.querySelector('br')).toBeNull();
  });
});
