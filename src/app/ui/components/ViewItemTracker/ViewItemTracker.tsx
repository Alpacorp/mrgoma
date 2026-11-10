'use client';

import { useEffect, useRef } from 'react';

import { trackEcommerce } from '@/app/utils/analytics';
import { EVENTS } from '@/app/utils/analyticsEvents';
import { cartPayload, type TireLike } from '@/app/utils/ecommerce';

/**
 * Reports `view_item` for the tire on a detail page (feature 040).
 *
 * A client island that renders nothing, so the detail page stays a Server
 * Component and its LCP is untouched. It runs after hydration — before GA has
 * loaded on a landing page — which is why the send goes through the queue in
 * `gtag.ts` rather than being dropped.
 *
 * Once per tire: the ref absorbs React's development double effect, and moving
 * to another tire's page without a reload changes `tire.id` and reports again.
 */
const ViewItemTracker = ({ tire }: { tire: TireLike }) => {
  const reported = useRef<string | null>(null);
  const id = String(tire.id);

  useEffect(() => {
    if (reported.current === id) return;
    reported.current = id;
    void trackEcommerce(EVENTS.VIEW_ITEM, cartPayload([tire]));
    // Keyed on the id on purpose: a new object for the same tire is the same view.
  }, [id]);

  return null;
};

export default ViewItemTracker;
