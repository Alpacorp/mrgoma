'use client';

import { useEffect } from 'react';

import Link from 'next/link';

import { trackEcommerce } from '@/app/utils/analytics';
import { EVENTS } from '@/app/utils/analyticsEvents';
import type { ChatSetCard } from '@/app/utils/chatSets';
import { LISTS, selectPayload, type ListPayload, type TireLike } from '@/app/utils/ecommerce';

type Props = {
  sets: ChatSetCard[];
  /** The conversation's language (the chat's one exception to English-only UI). */
  spanish?: boolean;
  /** Called when a set is opened, so the chat can close before the page changes. */
  onOpen?: () => void;
};

/** A card's tires as analytics sees them — 040's item shape (046). */
const setTires = (s: ChatSetCard): TireLike[] =>
  s.units.map(u => ({
    id: u.id,
    name: `${s.brand} ${s.model}`,
    price: u.price,
    brand: s.brand,
    model: s.model,
    size: s.size,
    condition: s.condition,
  }));

/** The cards last reported in this tab: a re-render must not resend them. */
let lastListKey: string | null = null;

/** Test hook. */
export function resetChatSetList(): void {
  lastListKey = null;
}

const money = (n: number) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;

/**
 * Sets the chat looked up (feature 044, D7). Every figure comes from the
 * inventory, never from the model's text. One `<article>` per set inside a list,
 * a heading, one line of facts and a single "Review set" link whose accessible
 * name says which set it opens (modern-web-guidance: card).
 *
 * Nothing here touches the cart: the shopper reviews and adds the set on the
 * tire page (FR9).
 */
export default function ChatSetCards({ sets, spanish = false, onOpen }: Props) {
  // One `chat_sets` list per set of cards shown; every tire of a card sits at
  // that card's position (046, AC4).
  const listKey = sets.map(s => s.href).join('|');
  useEffect(() => {
    if (!listKey || listKey === lastListKey) return;
    lastListKey = listKey;
    const payload: ListPayload = {
      item_list_id: LISTS.chatSets.id,
      item_list_name: LISTS.chatSets.name,
      items: sets.flatMap((s, i) => selectPayload(LISTS.chatSets, setTires(s), i + 1).items),
    };
    void trackEcommerce(EVENTS.VIEW_ITEM_LIST, payload);
  }, [listKey]);

  if (sets.length === 0) return null;
  const t = spanish
    ? { tires: 'llantas', used: 'Usadas', new: 'Nuevas', tread: 'labrado', review: 'Ver juego' }
    : { tires: 'tires', used: 'Used', new: 'New', tread: 'tread', review: 'Review set' };

  return (
    <ul className="mt-2 flex w-full flex-col gap-2" aria-label={spanish ? 'Juegos' : 'Sets'}>
      {sets.map((s, i) => {
        const condition = s.condition === 'New' ? t.new : t.used;
        const facts = `${s.count} ${t.tires} · ${condition} · ${s.city}`;
        return (
          <li key={s.href}>
            <article className="rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-700">
              <h3 className="font-semibold text-gray-900">
                {s.brand} {s.model}
              </h3>
              <p className="mt-0.5">{facts}</p>
              <p className="mt-0.5">
                <span className="font-semibold text-gray-900">{money(s.total)}</span>
                {s.treadLabel && (
                  <span className="text-gray-500">{` · ${t.tread} ${s.treadLabel}`}</span>
                )}
              </p>
              <footer className="mt-2">
                <Link
                  href={s.href}
                  onClick={() => {
                    void trackEcommerce(
                      EVENTS.SELECT_ITEM,
                      selectPayload(LISTS.chatSets, setTires(s), i + 1)
                    );
                    onOpen?.();
                  }}
                  data-track="chat_set_open"
                  data-track-category="ai_chat"
                  data-track-position={String(i + 1)}
                  data-track-set-size={String(s.count)}
                  data-track-city={s.city}
                  className="inline-flex min-h-[44px] items-center rounded-md bg-green-600 px-3 text-sm font-semibold text-white transition-colors hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                >
                  {t.review}
                  <span className="sr-only">{`: ${s.brand} ${s.model}, ${facts}, ${money(s.total)}`}</span>
                  <span aria-hidden="true" className="ml-1">
                    →
                  </span>
                </Link>
              </footer>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
