'use client';

import { useEffect } from 'react';

import { trackEcommerce } from '@/app/utils/analytics';
import { EVENTS } from '@/app/utils/analyticsEvents';
import { listPayload, type GaList, type TireLike } from '@/app/utils/ecommerce';

/**
 * The last result reported in this tab. Module-level on purpose: a re-render,
 * a remount, or coming back to the same listing shows the same result and must
 * not be counted twice (046, D1, FR10). A reload starts afresh — a new view.
 */
let lastKey: string | null = null;

/** Test hook: forget the last result. */
export function resetViewItemList(): void {
  lastKey = null;
}

/**
 * Report `view_item_list` when a listing shows a new result (046, D1): the
 * list plus the ordered tire ids identify it, so another page, filter or sort
 * is new, and the same tires in the same order are not.
 */
export function useViewItemList(list: GaList | undefined, tires: TireLike[], offset = 0): void {
  const key =
    list && tires.length > 0 ? `${list.id}|${offset}|${tires.map(t => t.id).join(',')}` : null;

  useEffect(() => {
    if (!list || !key || key === lastKey) return;
    lastKey = key;
    void trackEcommerce(EVENTS.VIEW_ITEM_LIST, listPayload(list, tires, offset));
    // `key` captures list, offset and the tires' identity and order.
  }, [key]);
}
