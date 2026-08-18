import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { locationsConfig } from '@/app/(shop)/locations/locationsConfig';

import LocationDetail from './LocationDetail';

/**
 * The store heading used to be the name of a suburb — `Cutler Bay`, `Hialeah` —
 * spending the largest element on the page on neither the business nor what it
 * sells.
 *
 * The interesting assertion here is not that it changed. It is that it changed
 * **without** the `<br />` that `ServiceDetail` uses for the same effect, and
 * which is why thirteen pages report headings like
 * `Wheel AlignmentMiami & Orlando, FL`. Two lines on screen, one readable string
 * to anything that reads text rather than pixels.
 */

const store = locationsConfig[0];

describe('the store heading', () => {
  // AC6 — still exactly one, and still the page's own.
  it('is a single level-one heading', () => {
    render(<LocationDetail location={store} />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  // AC5
  it('says the business and what it sells, not just the area', () => {
    render(<LocationDetail location={store} />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toContain('MrGoma Tires');
    expect(heading.textContent).toContain(store.name);
    expect(heading.textContent).toMatch(/Used & New Tires/);
    expect(heading.textContent?.trim()).not.toBe(store.name);
  });

  /**
   * AC10, and the reason this test exists at all.
   *
   * A `<br />` renders the same two lines and reads as one run-on word:
   * `MrGoma Tires Cutler BayUsed & New Tires`. Nothing on screen shows the
   * difference — only a crawler, a screen reader, or someone copying the text.
   */
  it('keeps a real space between the two lines, not a bare line break', () => {
    render(<LocationDetail location={store} />);
    const heading = screen.getByRole('heading', { level: 1 });

    expect(heading.textContent).toContain(`${store.name} Used & New Tires`);
    expect(heading.querySelector('br')).toBeNull();
    // Normalised, it is one sentence with single spaces throughout.
    expect(heading.textContent?.replace(/\s+/g, ' ').trim()).toBe(
      `MrGoma Tires ${store.name} Used & New Tires`
    );
  });

  // AC10 — the visual design is not what this feature changes.
  it('leaves the heading wrapper styled exactly as before', () => {
    render(<LocationDetail location={store} />);
    const cls = screen.getByRole('heading', { level: 1 }).className;
    for (const token of ['text-4xl', 'sm:text-5xl', 'lg:text-6xl', 'font-black']) {
      expect(cls).toContain(token);
    }
  });
});
