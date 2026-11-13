import type { AddToCartProduct, CartItem } from '@/app/context/CartContext';
import type { SetUnit } from '@/app/utils/tireSets';

/** What every tire of a set shares — the group, taken from the tire on the page. */
export type SetProduct = {
  brand: string;
  model2?: string;
  size?: string;
};

/**
 * A cart line for a set unit: the group's identity (brand, model, size) plus the
 * unit's own data. Built this way so the cart title and the GA4 `item_name` are
 * the same ones `view_item` sent for that tire (feature 040). Used by the set
 * builder and by checkout's sold-tire replacement.
 */
export function setUnitToLine(u: SetUnit, product: SetProduct): AddToCartProduct {
  return {
    id: u.id,
    code: u.code,
    name: `(${u.code ?? u.id}) | ${product.brand} | ${product.size ?? ''}`.trim(),
    price: u.price,
    condition: u.condition,
    imageSrc: u.image ?? undefined,
    brand: product.brand,
    model: product.model2,
    size: product.size,
    city: u.city,
    tread: u.tread,
    life: u.life,
    patched: u.patched,
    dot: u.dot,
  };
}

/**
 * How the cart reads when it holds sets (feature 041).
 *
 * The cart stays a flat list of unique tires — that is what Stripe, the order
 * tables and analytics expect — and lines that were added together carry the
 * same `setId`. This turns the flat list into what the shopper should see: sets
 * of 2+ grouped with their total and tread range, everything else as single
 * tires. A set reduced to one tire reads as a single tire (spec FR10).
 */

export type CartGroup =
  | { kind: 'single'; item: CartItem }
  | { kind: 'set'; setId: string; items: CartItem[]; total: number; range: string | null };

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

export function treadRangeLabel(treads: Array<number | null | undefined>): string | null {
  const nums = treads.filter((t): t is number => typeof t === 'number' && Number.isFinite(t));
  if (nums.length === 0) return null;
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  return min === max ? `${fmt(min)}/32` : `${fmt(min)}–${fmt(max)}/32`;
}

export function groupCartLines(items: CartItem[]): CartGroup[] {
  const bySet = new Map<string, CartItem[]>();
  for (const item of items) {
    if (!item.setId) continue;
    const list = bySet.get(item.setId) ?? [];
    list.push(item);
    bySet.set(item.setId, list);
  }

  const groups: CartGroup[] = [];
  const emitted = new Set<string>();
  for (const item of items) {
    const members = item.setId ? bySet.get(item.setId) : undefined;
    if (!item.setId || !members || members.length < 2) {
      groups.push({ kind: 'single', item });
      continue;
    }
    if (emitted.has(item.setId)) continue;
    emitted.add(item.setId);
    groups.push({
      kind: 'set',
      setId: item.setId,
      items: members,
      total: Math.round(members.reduce((s, m) => s + m.price * m.quantity, 0) * 100) / 100,
      range: treadRangeLabel(members.map(m => m.tread)),
    });
  }
  return groups;
}

/**
 * Where a set's tires are, for a header or a card (feature 047, D5): "Miami",
 * "Orlando", or "Miami and Orlando" when the set mixes them — never just one of
 * them. Lines without a city (carts saved before 041) are skipped; `''` when
 * none has one.
 */
export function citiesLabel(cities: Array<'Miami' | 'Orlando' | undefined>): string {
  const known = [...new Set(cities.filter((c): c is 'Miami' | 'Orlando' => Boolean(c)))].sort();
  return known.join(' and ');
}
