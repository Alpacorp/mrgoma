'use client';

import { useEffect } from 'react';

import { trackEvent } from '@/app/utils/analytics';
import { EVENTS } from '@/app/utils/analyticsEvents';
import { searchParams as toSearchParams } from '@/app/utils/ecommerce';

/** The last size reported in this tab: a reload or coming back is not a new search. */
let lastSize: string | null = null;

/** Test hook. */
export function resetSearchEvent(): void {
  lastSize = null;
}

type Readable = { get(name: string): string | null };

/**
 * GA4 `search` where every tire size search lands: `/tires` with the size in
 * the URL (feature 046, D5) — from the home search by size or by text, or a
 * size facet of the catalog. Sent here once, rather than at each button, so
 * the home click and its arrival are not two searches.
 *
 * Only a change of **size** is a new search (spec FR6): a brand or condition
 * chosen in the filters with a size already set is a `filter_apply`, so they
 * ride along as parameters but never trigger the event.
 *
 * Not `data-track` on purpose: this is the outcome of a navigation, not a click.
 */
export function useSearchEvent(params: Readable): void {
  const w = params.get('w');
  const s = params.get('s');
  const d = params.get('d');
  const brands = params.get('brands');
  const condition = params.get('condition');
  const size = [w, s, d].map(v => (v ?? '').trim()).join('/');

  useEffect(() => {
    const payload = toSearchParams({ w, s, d, brands, condition });
    if (!payload || size === lastSize) return;
    lastSize = size;
    trackEvent({ action: EVENTS.SEARCH, category: 'search', params: payload });
    // Keyed on the size alone (FR6); brand and condition are read with it.
  }, [size]);
}
