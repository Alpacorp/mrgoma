'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import Image from 'next/image';

import type { CartItem } from '@/app/context/CartContext';
import { cartLine } from '@/app/utils/cartLine';
import { GENERIC_TIRE_IMAGE } from '@/app/utils/genericTireImage';

/**
 * A tire's details beside the cart drawer, on hover or keyboard focus (feature
 * 047, owner review): photo, tread, remaining life, patch, DOT, condition and
 * city, to compare tires without leaving the cart.
 *
 * Built after `modern-web-guidance`'s hovercard guide:
 * - **Supplemental only.** Every fact is also on the line itself (the facts
 *   line), so touch screens — no hover — lose nothing, and the card is
 *   `aria-hidden`: a screen reader already reads the line, and would read it
 *   twice.
 * - **Top layer.** A `popover="manual"` element, so the drawer's
 *   `overflow-y: auto` and its slide-in transform cannot clip or offset it.
 *   (`popover="hint"` + `interestfor` would do the triggering declaratively,
 *   but Safari and Firefox lack both; this is the same behaviour in a few
 *   lines, without a polyfill in the bundle.)
 * - **Interest delays** like `interest-delay`: 300 ms to show, 100 ms to hide,
 *   so moving the pointer across the list does not flash cards; once open it
 *   follows the pointer to the next tire at once, gliding there (`translate`,
 *   compositor-only) while the details cross-fade. Never moves focus (WCAG
 *   3.2.1). Closes on Escape, scroll and loss of interest, keeping its content
 *   while it fades out.
 * - Shown only with a fine pointer that can hover, and only when the space
 *   left of the drawer fits the card; otherwise the line is enough.
 * - A small pointer on its right edge aims at the tire (owner review), and
 *   hovering the card itself keeps it open.
 */

const CARD_WIDTH = 288; // 18rem
const GAP = 12;
const SHOW_DELAY = 300;
// Long enough to cross the gap (and the pointer) from the tire to the card.
const HIDE_DELAY = 150;
/** Where the pointer aims on a line: level with its title. */
const ARROW_AIM = 22;

/** What the card shows and where; `open: false` keeps the last tire while it fades out. */
type Card = { item: CartItem; y: number; left: number; arrow: number; open: boolean };

const canHover = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches;

export function useCartTireHovercard() {
  const [card, setCard] = useState<Card | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const isOpen = useRef(false);

  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  const hide = useCallback((delay = HIDE_DELAY) => {
    clear();
    timer.current = setTimeout(() => {
      isOpen.current = false;
      setCard(c => (c ? { ...c, open: false } : c));
    }, delay);
  }, []);

  const show = useCallback((item: CartItem, line: HTMLElement) => {
    clear();
    if (!canHover()) return;
    const place = () => {
      const panel = line.closest('[data-cart-panel]') ?? line;
      const left = panel.getBoundingClientRect().left - CARD_WIDTH - GAP;
      if (left < 8) return; // no room beside the drawer: the line says it all
      const lineTop = line.getBoundingClientRect().top;
      const y = Math.max(8, Math.min(lineTop, window.innerHeight - 340));
      // The pointer stays level with the tire even when the card is pushed up.
      const arrow = Math.max(16, Math.min(lineTop - y + ARROW_AIM, 300));
      isOpen.current = true;
      setCard({ item, y, left, arrow, open: true });
    };
    // Already open on another tire: move to this one at once, as
    // `interest-delay-start: 0` does while a hint is showing.
    if (isOpen.current) place();
    else timer.current = setTimeout(place, SHOW_DELAY);
  }, []);

  // Open and close the popover with the state; Escape and scroll close it.
  const open = Boolean(card?.open);
  useEffect(() => {
    const el = cardRef.current;
    if (!el || typeof el.showPopover !== 'function') return;
    if (open && !el.matches(':popover-open')) el.showPopover();
    if (!open && el.matches(':popover-open')) el.hidePopover();
    if (!open) return;
    const close = () => hide(0);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('keydown', onKey);
    document.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('scroll', close, true);
    };
  }, [open, hide]);

  useEffect(() => clear, []);

  /** Props for a cart line: hover with a mouse, or focus inside it. */
  const bind = (item: CartItem) => ({
    onPointerEnter: (e: React.PointerEvent<HTMLElement>) => {
      if (e.pointerType === 'mouse') show(item, e.currentTarget);
    },
    onPointerLeave: () => hide(),
    onFocus: (e: React.FocusEvent<HTMLElement>) => show(item, e.currentTarget),
    onBlur: (e: React.FocusEvent<HTMLElement>) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) hide();
    },
  });

  const element = (
    <div
      ref={cardRef}
      popover="manual"
      aria-hidden="true"
      data-testid="cart-tire-card"
      data-state={open ? 'open' : 'closed'}
      // Hovering the card keeps it open; leaving it closes it. A click on it must
      // not reach the cart's backdrop, which would close the drawer.
      onPointerEnter={() => clear()}
      onPointerLeave={() => hide()}
      onClick={e => e.stopPropagation()}
      className="cart-tire-card m-0 w-72 overflow-visible rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-800 shadow-xl"
      style={
        card
          ? ({
              position: 'fixed',
              inset: 'auto',
              top: 0,
              left: card.left,
              '--card-y': `${card.y}px`,
              '--arrow-y': `${card.arrow}px`,
            } as React.CSSProperties)
          : {}
      }
    >
      {/* Keyed by tire, so the details cross-fade when the card moves to another. */}
      {card ? <CardBody key={card.item.id} item={card.item} /> : null}
    </div>
  );

  return { bind, card: element };
}

const CardBody = ({ item }: { item: CartItem }) => {
  const line = cartLine(item);
  const rows: Array<[string, string]> = [
    ['Tread', typeof item.tread === 'number' ? `${item.tread}/32″` : '—'],
    ['Remaining life', item.life ?? '—'],
    ['Patched', item.patched === true ? 'Yes' : item.patched === false ? 'No' : '—'],
    ['DOT', item.dot ?? '—'],
    ['Stock #', item.code ?? '—'],
    ['Condition', item.condition ?? '—'],
    ['Location', item.city ?? '—'],
  ];
  return (
    <div className="cart-tire-card__body">
      <div className="flex gap-3">
        <Image
          src={item.image || GENERIC_TIRE_IMAGE}
          alt=""
          width={96}
          height={96}
          // The card mounts hidden: lazy loading would wait for a scroll that never comes.
          loading="eager"
          className="h-24 w-24 shrink-0 rounded-lg border border-gray-200 object-cover"
        />
        <div className="min-w-0">
          <p className="font-semibold text-gray-900">{line.title}</p>
          {line.size ? <p className="text-gray-600">{line.size}</p> : null}
          <p className="mt-1 font-semibold text-gray-900">${item.price.toFixed(2)}</p>
        </div>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1">
        {rows.map(([k, v]) => (
          <React.Fragment key={k}>
            <dt className="text-gray-500">{k}</dt>
            <dd
              className={`font-medium ${k === 'Patched' && v === 'Yes' ? 'text-amber-800' : 'text-gray-900'}`}
            >
              {v}
            </dd>
          </React.Fragment>
        ))}
      </dl>
    </div>
  );
};
