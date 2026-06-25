'use client';

import { useEffect } from 'react';

import { event } from '@/app/utils/gtag';

/**
 * Global, declarative interaction tracking.
 *
 * Mount once (in the root layout). It listens for clicks anywhere in the
 * document and, when the clicked element (or an ancestor) carries a
 * `data-track` attribute, reports a Google Analytics event.
 *
 * Mark any actionable like:
 *   <button data-track="add_to_cart" data-track-label="Goodyear 205/55R16">…</button>
 *   <a data-track="open_whatsapp" data-track-category="contact">…</a>
 *
 * Conventions:
 *   - data-track            → GA event action (required)
 *   - data-track-category   → event_category (optional)
 *   - data-track-label      → event_label (optional)
 *   - data-track-value      → numeric value (optional)
 *   - any other data-track-* → forwarded as extra params (e.g. data-track-tire-id="123")
 *
 * `event()` is a no-op until GA has loaded (i.e. after cookie consent), so this
 * never throws and never sends anything without consent.
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

      event({
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
