import { cartLine } from '@/app/utils/cartLine';
import { brandName, parseTireName } from '@/app/utils/tireNaming';

/**
 * GA4 ecommerce payloads, built in one place (feature 040).
 *
 * A tire reaches analytics from four shapes — a catalog card, the detail page,
 * a cart line and a paid Stripe line — and before this module each screen had
 * its own idea of how to name one (see `cartLine.ts` and feature 028). Every
 * event describes a tire through `toGaItem`, so a product can be followed from
 * `view_item` to `purchase` under the same id and name.
 *
 * **Pure, and no analytics imports**, so the payload can be asserted directly.
 * That matters because the checkout caller holds the customer's email and
 * address: the safeguard against leaking them is that the builders below name
 * every field they emit, and the tests assert the exact key set.
 */

/** ISO currency of the store, as GA4 expects it (upper case). */
export const STORE_CURRENCY = (process.env.NEXT_PUBLIC_STRIPE_CURRENCY || 'USD').toUpperCase();

export type GaItem = {
  item_id: string;
  item_name: string;
  item_brand?: string;
  item_category?: string;
  item_variant?: string;
  price: number;
  quantity: number;
};

/** The fields a tire may carry, whatever screen it comes from. */
export type TireLike = {
  id: string | number;
  name: string;
  price?: number | string | null;
  quantity?: number;
  brand?: string | null;
  model?: string | null;
  size?: string | null;
  condition?: string | null;
};

const toNumber = (v: unknown): number => {
  const n = typeof v === 'string' ? parseFloat(v) : Number(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

const toQuantity = (v: unknown): number => {
  const n = Math.floor(Number(v));
  return Number.isFinite(n) && n >= 1 ? n : 1;
};

/** `Used` / `New`, or nothing when the source does not say. */
export function normalizeCondition(condition?: string | null): string | undefined {
  const c = (condition ?? '').trim().toLowerCase();
  if (c === 'new') return 'New';
  if (c === 'used') return 'Used';
  return undefined;
}

/**
 * Fill a missing brand, model or size from the composed name
 * `(CODE) | BRAND | MODEL | SIZE`.
 *
 * Not every source carries them as fields: catalog cards may lack `size`, and
 * Stripe sessions created before feature 040 carry only the description. The
 * split itself is `parseTireName`'s — the one reading of a tire's name.
 */
function fillFromComposedName(tire: TireLike): TireLike {
  if (tire.model && tire.size) return tire;
  const parts = (tire.name || '').split(' | ').map(p => p.trim());
  if (parts.length < 3) return tire;
  const parsed = parseTireName(tire.name);
  return {
    ...tire,
    brand: tire.brand || parts[1],
    model: tire.model || parsed.displayName || null,
    size: tire.size || parsed.size || null,
  };
}

/** Round to cents, so floating sums never reach GA as `239.99999999`. */
const money = (n: number) => Math.round(n * 100) / 100;

/**
 * One tire as a GA4 item.
 *
 * `item_name` is the title the shopper read — `Used Michelin Defender 225/65R17`
 * — composed from the same `cartLine()` the cart and checkout print. Brand,
 * condition and size also travel as their own fields so reports can group by
 * them without parsing the name.
 */
export function toGaItem(input: TireLike): GaItem {
  const tire = fillFromComposedName(input);
  const line = cartLine({
    name: tire.name,
    brand: tire.brand ?? undefined,
    model: tire.model ?? undefined,
    size: tire.size ?? undefined,
  });
  const condition = normalizeCondition(tire.condition);
  const size = line.size || undefined;
  // `cartLine` falls back to the raw `name` for items saved before model/size
  // existed; that name already contains the size, so it is not appended twice.
  const titleHasSize = size ? line.title.includes(size) : true;
  const item_name = [condition, line.title, titleHasSize ? '' : size]
    .filter(Boolean)
    .join(' ')
    .trim();

  const item: GaItem = {
    item_id: String(tire.id),
    item_name: item_name || String(tire.id),
    price: money(toNumber(tire.price)),
    quantity: toQuantity(tire.quantity),
  };
  const brand = brandName(tire.brand ?? undefined);
  if (brand) item.item_brand = brand;
  if (condition) item.item_category = condition;
  if (size) item.item_variant = size;
  return item;
}

/** A line of a paid Stripe session, as `/api/checkout/session` returns it. */
export type StripeLine = {
  productId: string | null;
  description: string;
  condition: string | null;
  quantity: number;
  amount_total: number;
  /**
   * Before tax. With Stripe's automatic tax (delivery orders) `amount_total`
   * includes the line's tax, which must not inflate the item price — the tax is
   * reported once, at order level.
   */
  amount_subtotal?: number | null;
  brand?: string | null;
  model?: string | null;
  size?: string | null;
  /**
   * New / Used. `condition` on a Stripe line is the stock status at the time of
   * sale, not the tire's condition, so it is only a fallback.
   */
  tireCondition?: string | null;
};

/** The id Stripe carries for the synthetic sales-tax line. Not a product. */
export const TAX_LINE_ID = 'tax';

/**
 * A paid Stripe line as a GA4 item, or `null` for the tax line.
 *
 * Sessions created before feature 040 carry no brand/model/size metadata; their
 * description is the composed `(CODE) | BRAND | MODEL | SIZE`, which
 * `parseTireName` already knows how to split.
 */
export function toGaItemFromStripeLine(line: StripeLine): GaItem | null {
  if (!line.productId || line.productId === TAX_LINE_ID) return null;
  const quantity = toQuantity(line.quantity);
  const unitPrice = (line.amount_subtotal ?? line.amount_total ?? 0) / 100 / quantity;

  return toGaItem({
    id: line.productId,
    name: line.description,
    price: unitPrice,
    quantity,
    brand: line.brand,
    model: line.model,
    size: line.size,
    condition: line.tireCondition || line.condition,
  });
}

export type CartPayload = { currency: string; value: number; items: GaItem[] };

/** The `currency` / `value` / `items` triple every cart-level event carries. */
export function cartPayload(tires: TireLike[]): CartPayload {
  const items = tires.map(toGaItem);
  const value = money(items.reduce((sum, it) => sum + it.price * it.quantity, 0));
  return { currency: STORE_CURRENCY, value, items };
}

/** What `/api/checkout/session` returns that a purchase needs. */
export type PaidSession = {
  id: string;
  amount_total: number | null;
  currency: string | null;
  items: StripeLine[];
  shipping_total?: number | null;
  tax_total?: number | null;
};

export type PurchasePayload = CartPayload & {
  transaction_id: string;
  tax: number;
  shipping: number;
};

/**
 * The GA4 `purchase` payload. Revenue is what Stripe charged, not a sum of our
 * own prices, so tax and shipping are reported separately and the tax line is
 * never an item.
 */
export function purchasePayload(session: PaidSession): PurchasePayload {
  return {
    transaction_id: session.id,
    currency: (session.currency || STORE_CURRENCY).toUpperCase(),
    value: money((session.amount_total || 0) / 100),
    tax: money((session.tax_total || 0) / 100),
    shipping: money((session.shipping_total || 0) / 100),
    items: (session.items || [])
      .map(toGaItemFromStripeLine)
      .filter((it): it is GaItem => it !== null),
  };
}

/* ── Feature 046: lists, selection and search ─────────────────────────────── */

export type GaList = { id: string; name: string };

/** The listings, with ids and names fixed so reports can compare them (FR3). */
export const LISTS = {
  catalog: { id: 'catalog', name: 'All tires' },
  newTires: { id: 'new_tires', name: 'New tires' },
  usedTires: { id: 'used_tires', name: 'Used tires' },
  chatSets: { id: 'chat_sets', name: 'Chat sets' },
  brand: (brand: string): GaList => ({ id: 'brand_tires', name: `Brand: ${brand}` }),
  size: (size: string): GaList => ({ id: 'size_tires', name: `Size: ${size}` }),
} as const;

/** GA4 caps an event at 200 items. */
export const MAX_LIST_ITEMS = 200;

export type GaListItem = GaItem & { item_list_id: string; item_list_name: string; index: number };

export type ListPayload = { item_list_id: string; item_list_name: string; items: GaListItem[] };

const listItem = (list: GaList, tire: TireLike, index: number): GaListItem => ({
  ...toGaItem(tire),
  item_list_id: list.id,
  item_list_name: list.name,
  index,
});

/**
 * `view_item_list`: every tire shown, positioned on the whole result —
 * `offset` is how many came before this page (page 2 of 20 starts at 21).
 */
export function listPayload(list: GaList, tires: TireLike[], offset = 0): ListPayload {
  return {
    item_list_id: list.id,
    item_list_name: list.name,
    items: tires.slice(0, MAX_LIST_ITEMS).map((t, i) => listItem(list, t, offset + i + 1)),
  };
}

/**
 * `select_item`: the tire(s) opened from a list at `index` (1-based). A chat
 * set opens several tires at one position.
 */
export function selectPayload(list: GaList, tires: TireLike[], index: number): ListPayload {
  return {
    item_list_id: list.id,
    item_list_name: list.name,
    items: tires.slice(0, MAX_LIST_ITEMS).map(t => listItem(list, t, index)),
  };
}

export type SearchEventParams = {
  search_term: string;
  tire_width?: string;
  tire_profile?: string;
  tire_rim?: string;
  tire_brand?: string;
  tire_condition?: string;
};

/** GA4 cuts parameter values at 100 characters; cut them ourselves first. */
const cut = (v: string) => v.slice(0, 100);

const clean = (v?: string | null) => (v ?? '').trim();

/**
 * GA4 `search` parameters for a tire size search (046, FR6). `search_term` reads
 * as a shopper writes a size — `225/45R17`, or partial: `225/45`, `225`,
 * `R17`. `null` when there is no size part: that is not a size search.
 */
export function searchParams(input: {
  w?: string | null;
  s?: string | null;
  d?: string | null;
  brands?: string | null;
  condition?: string | null;
}): SearchEventParams | null {
  const w = clean(input.w);
  const s = clean(input.s);
  const d = clean(input.d);
  if (!w && !s && !d) return null;

  const head = [w, s].filter(Boolean).join('/');
  const term = d ? `${head}R${d}` : head;
  const out: SearchEventParams = { search_term: cut(term) };
  if (w) out.tire_width = w;
  if (s) out.tire_profile = s;
  if (d) out.tire_rim = d;
  const brands = clean(input.brands);
  if (brands) out.tire_brand = cut(brands);
  const condition = clean(input.condition).toLowerCase();
  if (condition) out.tire_condition = cut(condition);
  return out;
}
