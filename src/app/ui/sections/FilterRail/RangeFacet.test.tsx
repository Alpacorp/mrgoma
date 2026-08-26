import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PRICE_BUCKETS, bucketOfRange } from '@/app/utils/facetBuckets';
import { setRange } from '@/app/utils/filterHref';

import RangeFacet, { type RangeOption } from './RangeFacet';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
beforeEach(() => push.mockClear());

const COUNTS: Record<string, number> = { p1: 417, p2: 1342, p3: 1021, p4: 934, p5: 413 };

/** Exactly how the rail builds them, so the test exercises the real derivation. */
function optionsFor(min: number | undefined, max: number | undefined): RangeOption[] {
  const applied = bucketOfRange(min, max, PRICE_BUCKETS);
  return PRICE_BUCKETS.map(b => ({
    id: b.id,
    label: b.label,
    count: COUNTS[b.id],
    href: `/tires${setRange('', 'minPrice', 'maxPrice', b.min, b.max)}`,
    applied: applied?.id === b.id,
    min: b.min,
    max: b.max,
  }));
}

const renderFacet = (min?: number, max?: number, search = '') =>
  render(
    <RangeFacet
      title="Price"
      options={optionsFor(min, max)}
      bounds={[70, 2002]}
      value={[min, max]}
      minParam="minPrice"
      maxParam="maxPrice"
      basePath="/tires"
      search={search}
      unit="currency"
    />
  );

describe('RangeFacet', () => {
  it('shows every band with its count', () => {
    renderFacet();
    expect(screen.getByRole('link', { name: /\$100 – \$149/ })).toBeInTheDocument();
    expect(screen.getByText('1,342')).toBeInTheDocument();
  });

  it('links each band to a URL that sets both bounds at once', () => {
    renderFacet();
    const link = screen.getByRole('link', { name: /\$100 – \$149/ });
    const href = link.getAttribute('href')!;
    expect(href).toContain('minPrice=100');
    expect(href).toContain('maxPrice=149');
  });

  it('leaves an open-ended band open rather than writing a bound that is not there', () => {
    renderFacet();
    expect(screen.getByRole('link', { name: /Under \$100/ }).getAttribute('href')).toBe(
      '/tires?maxPrice=99'
    );
    expect(screen.getByRole('link', { name: /\$300 & up/ }).getAttribute('href')).toBe(
      '/tires?minPrice=300'
    );
  });
});

/**
 * **The agreement that made offering two controls acceptable.**
 *
 * There is one piece of state — `minPrice` / `maxPrice` — and the band that
 * reads as applied is derived from it. These assert the round trip in both
 * directions: a band must set the slider, and the slider must light the band.
 * If either ever failed, the page would be showing two answers to one question.
 */
describe('the band and the slider are one filter', () => {
  it('a chosen band shows on the slider', () => {
    renderFacet(100, 149);
    expect(screen.getByText('$100')).toBeInTheDocument();
    expect(screen.getByText('$149')).toBeInTheDocument();
  });

  it('a span matching a band lights that band up', () => {
    renderFacet(100, 149);
    expect(screen.getByRole('link', { name: /\$100 – \$149/ })).toHaveAttribute(
      'aria-current',
      'true'
    );
  });

  it('and no other band', () => {
    renderFacet(100, 149);
    const current = screen
      .getAllByRole('link')
      .filter(link => link.getAttribute('aria-current') === 'true');
    expect(current).toHaveLength(1);
  });

  it('a hand-set span lights no band, because it is not one', () => {
    renderFacet(140, 185);
    expect(
      screen.getAllByRole('link').filter(l => l.getAttribute('aria-current') === 'true')
    ).toHaveLength(0);
    expect(screen.getByText('$140')).toBeInTheDocument();
    expect(screen.getByText('$185')).toBeInTheDocument();
  });

  it('nothing applied falls back to the catalogue span, not to zero', () => {
    renderFacet();
    expect(screen.getByText('$70')).toBeInTheDocument();
    expect(screen.getByText('$2002')).toBeInTheDocument();
  });
});

describe('moving the slider', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const nudge = (thumb: HTMLElement, times = 1) => {
    for (let i = 0; i < times; i++) fireEvent.keyDown(thumb, { key: 'ArrowRight' });
  };

  it('navigates once the buyer stops, not on every step', () => {
    renderFacet(undefined, undefined, '?brands=PIRELLI');
    const [minThumb] = screen.getAllByRole('slider');

    nudge(minThumb, 3);
    expect(push).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(push).toHaveBeenCalledTimes(1);
  });

  it('keeps the other filters when it does navigate', () => {
    renderFacet(undefined, undefined, '?brands=PIRELLI&view=table');
    nudge(screen.getAllByRole('slider')[0]);
    act(() => {
      vi.advanceTimersByTime(500);
    });

    const url = push.mock.calls[0]?.[0] as string;
    expect(url).toContain('brands=PIRELLI');
    expect(url).toContain('view=table');
  });

  /**
   * A span covering the whole catalogue is not a filter. Writing today's
   * extremes into the URL would produce a link that silently stops matching the
   * catalogue as stock changes.
   */
  it('writes nothing for a span that covers everything', () => {
    renderFacet(100, 149, '');
    const [minThumb] = screen.getAllByRole('slider');
    fireEvent.keyDown(minThumb, { key: 'Home' });
    act(() => {
      vi.advanceTimersByTime(500);
    });

    const url = push.mock.calls[0]?.[0] as string;
    expect(url).not.toContain('minPrice');
  });
});

/**
 * The slider was a pair of bare `<div>`s: no role, no tabIndex, no key handling.
 * It could not be operated without a pointer — WCAG 2.1.1, Level A — on `/tires`,
 * `/dashboard` and the home page alike.
 */
describe('the slider can be used without a pointer', () => {
  it('exposes both thumbs as sliders with their current value', () => {
    renderFacet(100, 149);
    const [minThumb, maxThumb] = screen.getAllByRole('slider');

    expect(minThumb).toHaveAttribute('aria-valuenow', '100');
    expect(maxThumb).toHaveAttribute('aria-valuenow', '149');
    expect(minThumb).toHaveAttribute('aria-label', expect.stringContaining('Minimum'));
    expect(maxThumb).toHaveAttribute('aria-label', expect.stringContaining('Maximum'));
  });

  it('is reachable by keyboard', () => {
    renderFacet(100, 149);
    for (const thumb of screen.getAllByRole('slider')) {
      expect(thumb).toHaveAttribute('tabindex', '0');
    }
  });

  it('moves with the arrow keys', () => {
    renderFacet(100, 149);
    const [minThumb] = screen.getAllByRole('slider');
    fireEvent.keyDown(minThumb, { key: 'ArrowRight' });
    expect(minThumb).toHaveAttribute('aria-valuenow', '101');
    fireEvent.keyDown(minThumb, { key: 'ArrowLeft' });
    expect(minThumb).toHaveAttribute('aria-valuenow', '100');
  });

  it('never lets the two thumbs cross', () => {
    renderFacet(100, 102);
    const [minThumb] = screen.getAllByRole('slider');
    for (let i = 0; i < 10; i++) fireEvent.keyDown(minThumb, { key: 'ArrowRight' });
    expect(Number(minThumb.getAttribute('aria-valuenow'))).toBeLessThan(102);
  });

  it('announces the value the way the buyer reads it', () => {
    renderFacet(100, 149);
    expect(screen.getAllByRole('slider')[0]).toHaveAttribute('aria-valuetext', '$100');
  });
});
