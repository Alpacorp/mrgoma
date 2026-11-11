'use client';

import { useId, useMemo, useState } from 'react';

import Image from 'next/image';

import { useCart } from '@/app/context/CartContext';
import { trackEcommerce, trackEvent } from '@/app/utils/analytics';
import { EVENTS } from '@/app/utils/analyticsEvents';
import { setUnitToLine, type SetProduct } from '@/app/utils/cartSets';
import { cartPayload } from '@/app/utils/ecommerce';
import { GENERIC_TIRE_IMAGE } from '@/app/utils/genericTireImage';
import {
  availableSetSizes,
  isQuantityMode,
  setTotal,
  suggestSet,
  swapOptions,
  treadRange,
  type SetSize,
  type SetUnit,
} from '@/app/utils/tireSets';
import { buildTireSlug } from '@/app/utils/tireSlug';

type Props = {
  anchor: SetUnit;
  candidates: SetUnit[];
  product: SetProduct;
  /** Compatible tires besides this one, for the intro line (spec FR4). */
  more?: number;
  /** Inside the set panel (feature 041, round 3): no card frame, heading id from the panel. */
  embedded?: boolean;
  titleId?: string;
  /** Called after the set is added, so the panel can close before the cart opens. */
  onAdded?: () => void;
  /**
   * A set chosen elsewhere — the AI chat (feature 044) — to start from instead
   * of the suggestion. Already validated (`resolvePresetSet`); anchor first.
   * Choosing another size returns to the suggestion.
   */
  initialSet?: SetUnit[];
  /** One line above the set, e.g. "1 tire sold; we picked the closest match". */
  notice?: string;
};

const money = (n: number) => `$${n.toFixed(2)}`;

const unitLabel = (u: SetUnit) =>
  [
    u.tread !== null ? `${u.tread}/32` : 'tread n/a',
    u.life ? `${u.life} life` : null,
    u.patched ? 'patched' : 'no patch',
    money(u.price),
  ]
    .filter(Boolean)
    .join(' · ');

/**
 * "Build your set" (feature 041). Native radios for the size, a native select
 * per unit for swapping, one polite atomic live region for the total — the
 * decisions in `spec/features/041-tire-sets/ux-notes.md`.
 */
const TireSetBuilder = ({
  anchor,
  candidates,
  product,
  more,
  embedded = false,
  titleId,
  onAdded,
  initialSet,
  notice,
}: Props) => {
  const { addSetToCart, isInCart } = useCart();
  const sizes = useMemo(() => availableSetSizes(anchor, candidates), [anchor, candidates]);
  const quantityMode = isQuantityMode(anchor);
  const [preset, setPreset] = useState<SetUnit[] | null>(
    initialSet && initialSet.length >= 2 ? initialSet : null
  );
  const [size, setSize] = useState<SetSize>(
    preset ? (preset.length as SetSize) : (sizes[sizes.length - 1] ?? 2)
  );
  const [overrides, setOverrides] = useState<Record<number, string>>({});
  const groupName = useId();

  const suggested = useMemo(
    () =>
      preset && preset.length === size ? preset : (suggestSet(anchor, candidates, size) ?? []),
    [anchor, candidates, size, preset]
  );

  // The shopper's swaps, applied slot by slot on top of the suggestion.
  const set = useMemo(() => {
    const byId = new Map(candidates.map(c => [c.id, c]));
    const current = [...suggested];
    for (const [slot, id] of Object.entries(overrides)) {
      const i = Number(slot);
      const unit = byId.get(id);
      if (unit && i > 0 && i < current.length) current[i] = unit;
    }
    return current;
  }, [suggested, overrides, candidates]);

  if (sizes.length === 0 || set.length === 0) return null;

  const total = setTotal(set);
  const range = treadRange(set)?.label;
  const swaps = Object.keys(overrides).length;
  const allInCart = set.every(u => isInCart(u.id));

  const chooseSize = (next: SetSize) => {
    setSize(next);
    setPreset(null);
    setOverrides({});
  };

  const add = () => {
    const lines = set.map(u => setUnitToLine(u, product));
    const setId = `set-${anchor.id}-${Date.now().toString(36)}`;
    addSetToCart(lines, setId);
    void trackEcommerce(EVENTS.ADD_TO_CART, {
      ...cartPayload(lines),
      set_size: set.length,
    });
    trackEvent({
      action: EVENTS.SET_BUILT,
      category: 'cart',
      params: { set_size: set.length, swaps, condition: anchor.condition },
    });
    onAdded?.();
  };

  return (
    <section
      aria-labelledby={titleId ?? `${groupName}-title`}
      className={embedded ? '' : 'mt-6 rounded-xl border border-gray-200 bg-white p-4 sm:p-5'}
    >
      <h2 id={titleId ?? `${groupName}-title`} className="text-lg font-semibold text-gray-900">
        {quantityMode ? 'Buy more than one' : 'Build your set'}
      </h2>
      {/* The page has two add buttons; say which one does what (user test, 10 nov). */}
      <p className="mt-1 text-sm text-gray-700">
        {embedded
          ? quantityMode
            ? 'Choose how many you need; the tire on the page is one of them.'
            : 'The tire on the page plus matching ones — same model and size, tread within 2/32″.'
          : quantityMode
            ? 'Add to Cart above adds one tire. Choose how many you need here.'
            : 'Add to Cart above adds only this tire. Here you add it together with matching tires — same model and size, tread within 2/32″.'}
        {more ? (
          <span className="mt-1 block font-medium text-green-800">
            {`We have ${more} more of this tire in ${anchor.city}.`}
          </span>
        ) : null}
      </p>

      {notice ? (
        <p role="status" className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {notice}
        </p>
      ) : null}

      <fieldset className="mt-3">
        <legend className="text-sm text-gray-700">How many tires?</legend>
        <div className="mt-2 flex gap-2">
          {sizes.map(s => (
            <label
              key={s}
              className={`flex min-h-[44px] min-w-[64px] cursor-pointer items-center justify-center rounded-md border px-4 text-sm font-semibold has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-green-500 ${
                s === size
                  ? 'border-green-600 bg-green-50 text-green-800'
                  : 'border-gray-300 bg-white text-gray-800 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name={groupName}
                value={s}
                checked={s === size}
                onChange={() => chooseSize(s)}
                className="sr-only"
                data-track="set_size_select"
                data-track-label={String(s)}
              />
              {s} tires
            </label>
          ))}
        </div>
      </fieldset>

      {!quantityMode && (
        <ol
          className="mt-4 divide-y divide-gray-100"
          aria-label={`Tires in your set of ${set.length}`}
        >
          {set.map((u, i) => {
            const options = i === 0 ? [] : swapOptions(set, i, candidates);
            return (
              <li key={`${i}-${u.id}`} className="flex flex-wrap items-center gap-3 py-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-100">
                  <Image
                    src={u.image || GENERIC_TIRE_IMAGE}
                    alt=""
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-medium text-gray-900">
                    {i === 0 ? 'This tire' : `Tire ${i + 1}`}
                    {u.code && i === 0 ? (
                      <span className="ml-1 text-gray-500">#{u.code}</span>
                    ) : null}
                    {u.code && i > 0 ? (
                      // A new tab keeps the set being built on this page.
                      <a
                        href={`/tires/${buildTireSlug(u.id, product.brand ?? '', product.size ?? '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-1 inline-flex items-center gap-0.5 rounded-sm text-green-700 underline underline-offset-2 hover:text-green-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                      >
                        #{u.code}
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-3.5 w-3.5"
                        >
                          <path d="M11 3a1 1 0 1 0 0 2h2.586l-6.293 6.293a1 1 0 1 0 1.414 1.414L15 6.414V9a1 1 0 1 0 2 0V4a1 1 0 0 0-1-1h-5Z" />
                          <path d="M5 5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-3a1 1 0 1 0-2 0v3H5V7h3a1 1 0 0 0 0-2H5Z" />
                        </svg>
                        <span className="sr-only">(view this tire, opens in a new tab)</span>
                      </a>
                    ) : null}
                  </p>
                  <p className="text-gray-600">
                    {/* The size on every unit: the shopper sees they all match (round 3). */}
                    {product.size ? (
                      <span className="font-medium text-gray-900">{`${product.size} · `}</span>
                    ) : null}
                    {unitLabel(u)}
                    {u.dot ? ` · DOT ${u.dot}` : ''}
                  </p>
                </div>
                {/* In the panel (28rem) the select always takes its own full-width row. */}
                {options.length > 0 && (
                  <label className={`w-full text-sm ${embedded ? '' : 'sm:w-auto'}`}>
                    <span className="sr-only">{`Swap tire ${i + 1} of ${set.length}`}</span>
                    <select
                      className={`min-h-[44px] w-full rounded-md border border-gray-300 bg-white px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 ${embedded ? '' : 'sm:w-56'}`}
                      value=""
                      onChange={e => {
                        const id = e.target.value;
                        if (id) setOverrides(prev => ({ ...prev, [i]: id }));
                      }}
                      data-track="set_unit_swap"
                    >
                      <option value="">Swap this tire…</option>
                      {options.map(o => (
                        <option key={o.id} value={o.id}>
                          {`${o.code ? `#${o.code} · ` : ''}${unitLabel(o)}`}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </li>
            );
          })}
        </ol>
      )}

      {/* In the panel the total and the button stay pinned to its bottom edge, so
          the decision is always in reach while the list scrolls (phones). */}
      <div
        className={
          embedded
            ? 'sticky bottom-0 -mx-4 mt-3 border-t border-gray-200 bg-white px-4 pt-3 pb-4'
            : ''
        }
      >
        <p
          className="mt-3 text-base font-semibold text-gray-900"
          aria-live="polite"
          aria-atomic="true"
        >
          {`Set of ${set.length} · total ${money(total)}`}
          {!quantityMode && range ? ` · tread ${range}` : ''}
        </p>

        <button
          type="button"
          onClick={add}
          disabled={allInCart}
          className={`mt-3 inline-flex min-h-[44px] w-full items-center justify-center rounded-md bg-green-600 px-5 text-base font-semibold text-white hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${embedded ? '' : 'sm:w-auto'}`}
        >
          {allInCart ? 'Set in cart' : `Add all ${set.length} tires to cart`}
        </button>
      </div>
    </section>
  );
};

export default TireSetBuilder;
