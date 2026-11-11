'use client';

import { useEffect, useId, useRef, useState } from 'react';

import type { SetProduct } from '@/app/utils/cartSets';
import { parseSetParam, resolvePresetSet } from '@/app/utils/chatSets';
import type { SetSize, SetUnit } from '@/app/utils/tireSets';

import TireSetBuilder from './TireSetBuilder';

type Props = {
  anchor: SetUnit;
  candidates: SetUnit[];
  product: SetProduct;
  more: number;
  sizes: SetSize[];
  /** Total of the cheapest-size suggestion, for "from $X for 2". */
  fromTotal: number;
  fromSize: SetSize;
  quantityMode: boolean;
};

const money = (n: number) => `$${n.toFixed(2)}`;

/**
 * "Build your set" as a short card in the page and a panel on demand
 * (feature 041, user test round 3).
 *
 * The full builder used to sit in the page and pushed the tire's description
 * far down. Now the page shows one card — what is possible and from how much —
 * and the builder opens in a native modal `<dialog>`: a side panel from 640 px,
 * a bottom sheet on phones. `showModal()` gives the focus containment, inert
 * page, Esc / back gesture and focus return the platform already provides; no
 * custom trap or scroll lock (see `.mg-sheet` in globals.css).
 *
 * After the set is added the panel closes first, then the cart drawer opens —
 * one layer at a time.
 */
const TireSetPanel = ({
  anchor,
  candidates,
  product,
  more,
  sizes,
  fromTotal,
  fromSize,
  quantityMode,
}: Props) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  /** A set opened from the AI chat (feature 044): the builder starts from it. */
  const [preset, setPreset] = useState<{ set: SetUnit[]; notice?: string; key: string } | null>(
    null
  );
  const [cardNotice, setCardNotice] = useState<string | null>(null);

  // Light dismiss: `closedby="any"` where supported; elsewhere (Safari) close on a
  // press *and* release outside the panel, so a drag that ends on the backdrop
  // does not dismiss.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || 'closedBy' in HTMLDialogElement.prototype) return;
    const outside = (e: PointerEvent) => {
      const r = dialog.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    };
    let pressedOutside = false;
    const down = (e: PointerEvent) => {
      pressedOutside = outside(e);
    };
    const up = (e: PointerEvent) => {
      if (pressedOutside && outside(e)) dialog.close();
    };
    dialog.addEventListener('pointerdown', down);
    dialog.addEventListener('pointerup', up);
    return () => {
      dialog.removeEventListener('pointerdown', down);
      dialog.removeEventListener('pointerup', up);
    };
  }, []);

  // `?set=` from a chat card, read after mount so the page's HTML never varies
  // by URL (no `searchParams` on the server). Removed from the address bar once
  // read: a reload or a shared link opens the page as usual.
  useEffect(() => {
    const url = new URL(window.location.href);
    const raw = url.searchParams.get('set');
    if (raw === null) return;
    url.searchParams.delete('set');
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);

    const result = resolvePresetSet(parseSetParam(raw), anchor, candidates);
    if (result.status === 'exact') {
      setPreset({ set: result.set, key: raw });
    } else if (result.status === 'replaced') {
      const n = result.replaced;
      setPreset({
        set: result.set,
        key: raw,
        notice:
          n === 1
            ? '1 tire of that set just sold; we picked the closest match.'
            : `${n} tires of that set just sold; we picked the closest matches.`,
      });
    } else if (result.status === 'unavailable') {
      setCardNotice(
        `That set of ${result.size} is no longer available. You can build another one here.`
      );
    }
    // Run once per page: the link is read on arrival only.
  }, []);

  useEffect(() => {
    if (preset) open();
  }, [preset]);

  const open = () => {
    const dialog = dialogRef.current;
    dialog?.showModal?.();
    // Start on the primary control — the chosen size — rather than "Close".
    dialog?.querySelector<HTMLInputElement>('input[type="radio"]:checked')?.focus();
  };
  const close = () => dialogRef.current?.close?.();

  const sizeText = sizes.length === 1 ? `${sizes[0]}` : `${sizes[0]}–${sizes[sizes.length - 1]}`;

  return (
    <>
      <div className="mt-4 flex flex-col gap-3 rounded-xl border border-green-200 bg-green-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-gray-800">
          {cardNotice ? (
            <p role="status" className="mb-2 font-medium text-amber-900">
              {cardNotice}
            </p>
          ) : null}
          <p className="font-semibold text-gray-900">
            {quantityMode ? 'Need more than one?' : `Need ${sizeText} tires?`}
          </p>
          <p className="mt-0.5">
            {`We have ${more} more like this in ${anchor.city} · from ${money(fromTotal)} for ${fromSize}`}
          </p>
        </div>
        <button
          type="button"
          onClick={open}
          aria-haspopup="dialog"
          data-track="set_builder_open"
          data-track-category="cart"
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-md border border-green-600 bg-white px-4 text-sm font-semibold text-green-800 transition-colors hover:bg-green-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
        >
          {quantityMode ? 'Choose quantity' : 'Build a set'}
          <span aria-hidden="true" className="ml-1">
            →
          </span>
        </button>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        {...({ closedby: 'any' } as Record<string, string>)}
        className="mg-sheet"
      >
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {`${anchor.city} · ${product.brand} ${product.size ?? ''}`}
          </p>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="-m-1 inline-flex h-11 w-11 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        </div>
        <div className="px-4 pt-4">
          <TireSetBuilder
            key={preset?.key ?? 'suggested'}
            initialSet={preset?.set}
            notice={preset?.notice}
            anchor={anchor}
            candidates={candidates}
            product={product}
            embedded
            titleId={titleId}
            onAdded={close}
          />
        </div>
      </dialog>
    </>
  );
};

export default TireSetPanel;
