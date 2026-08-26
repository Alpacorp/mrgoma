'use client';

import { useEffect } from 'react';

import { trackEvent } from '@/app/utils/analytics';

/**
 * Global, declarative interaction tracking.
 *
 * Mount once (in the root layout). It listens for clicks anywhere in the
 * document and, when the clicked element (or an ancestor) carries a
 * `data-track` attribute, reports the event to **both** GA4 and Vercel Web
 * Analytics via `trackEvent`.
 *
 * This is the single choke point for tracked clicks: marking an element reaches
 * both platforms, and there is no way to wire up only one of them by mistake.
 *
 * Mark any actionable like:
 *   <button type="button" data-track="add_to_cart" data-track-label="Goodyear 205/55R16">…</button>
 *   <a data-track="open_whatsapp" data-track-category="contact">…</a>
 *
 * Conventions:
 *   - data-track            → event name (required)
 *   - data-track-category   → GA `event_category` / Vercel `category` (optional)
 *   - data-track-label      → GA `event_label` / Vercel `label` (optional)
 *   - data-track-value      → numeric value (optional)
 *   - any other data-track-* → forwarded as extra params (e.g. data-track-tire-id="123")
 *
 * Never put personal data in these attributes — the values are sent verbatim to
 * two third parties.
 *
 * `trackEvent` never throws: GA stays silent until the cookie banner is accepted
 * and its script loads, while Vercel (cookie-free) records from the first visit.
 * A click is therefore reported to whichever platforms are live at that moment.
 */
const camelToSnake = (s: string) => s.replace(/[A-Z]/g, m => `_${m.toLowerCase()}`);

const InteractionTracker = () => {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      const el = target?.closest<HTMLElement>('[data-track]');
      if (!el) return;

      // data-track-* attributes are exposed on dataset as camelCase: data-track
      // → track, data-track-category → trackCategory, data-track-tire-id → trackTireId.
      const action = el.dataset.track;
      if (!action) return;

      const category = el.dataset.trackCategory;
      const label = el.dataset.trackLabel;
      const rawValue = el.dataset.trackValue;

      // Forward any remaining data-track-* attributes as extra event params.
      const reserved = new Set(['track', 'trackCategory', 'trackLabel', 'trackValue']);
      const params: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(el.dataset)) {
        if (reserved.has(key) || !key.startsWith('track')) continue;
        const paramName = camelToSnake(key.slice('track'.length)).replace(/^_/, '');
        params[paramName] = val;
      }

      trackEvent({
        action,
        category,
        label,
        value: rawValue !== undefined ? Number(rawValue) : undefined,
        params: Object.keys(params).length ? params : undefined,
      });
    };

    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, []);

  return null;
};

export default InteractionTracker;
