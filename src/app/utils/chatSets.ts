/**
 * Tire sets proposed by the AI chat (feature 044), and the tire page's check of
 * a set that arrives from a chat link.
 *
 * Pure: no React, no database. The tire page's client panel imports this
 * module, so it may import only **types** from the repository — a value import
 * would pull `@/connection/db` into the browser (041's barrel trap; guarded by
 * `chatSets.guard.test.ts`).
 */
import type { SizeUnit } from '@/repositories/tireSetsRepository';

import {
  cheapestSet,
  effectiveTread,
  isWithinTolerance,
  pickReplacement,
  SET_PAGE_CANDIDATES,
  setTotal,
  treadRange,
  type SetSize,
  type SetUnit,
  type TireCity,
} from './tireSets';
import { buildTireSlug } from './tireSlug';

export type ChatSetRequest = {
  /** `w/s/d`, as the inventory stores it (`225/45/17`). */
  size: string;
  quantity: SetSize;
  brands?: string[];
  condition?: 'new' | 'used';
  /** A city the customer named: only that city is searched (D4 skips step 1). */
  city?: TireCity;
  /** The visitor's estimated city (043): ordering only. */
  visitorCity?: TireCity | null;
};

/**
 * - `found`: sets of the requested number (in the named city, if any).
 * - `other_city`: none in the visitor's city; these are in the other one.
 * - `smaller`: no set of the requested number; these are smaller sets.
 * - `none`: no set at all.
 */
export type ChatSetOutcome = 'found' | 'other_city' | 'smaller' | 'none';

/** What a chat card shows. Nothing internal: no warehouse, no shelf, no codes. */
export type ChatSetCard = {
  brand: string;
  model: string;
  condition: 'New' | 'Used';
  city: TireCity;
  count: number;
  total: number;
  treadLabel: string;
  href: string;
  /** `w/s/d`, for analytics (046). */
  size: string;
  /** Each tire's id and price, for analytics items (046). Nothing internal. */
  units: { id: string; price: number }[];
};

export type ChatSetsResult = {
  outcome: ChatSetOutcome;
  /** The number of tires of the sets shown (smaller than asked for `smaller`). */
  quantity: SetSize;
  sets: ChatSetCard[];
};

export const MAX_CHAT_SETS = 3;

const otherCity = (c: TireCity): TireCity => (c === 'Miami' ? 'Orlando' : 'Miami');

/** 041's group: brand, model, size, run-flat, condition and city. */
const groupKey = (u: SizeUnit) =>
  [u.brand, u.model2, u.runFlat ? 'rf' : 'std', u.condition, u.city].join('|').toLowerCase();

/** The page's order for its 60 candidates: tread desc (none last), then price. */
function pageOrder(a: SizeUnit, b: SizeUnit): number {
  const ta = a.tread ?? -Infinity;
  const tb = b.tread ?? -Infinity;
  return tb - ta || a.price - b.price;
}

type Candidate = { units: SizeUnit[]; total: number; patched: number };

/** Up to 3 sets of `quantity`, one per brand and model, D1 order. */
function bestSets(units: SizeUnit[], quantity: SetSize, first: TireCity | null): Candidate[] {
  const groups = new Map<string, SizeUnit[]>();
  for (const u of units) {
    if (!u.brand || !u.model2 || u.brand === 'Unknown') continue;
    const k = groupKey(u);
    const list = groups.get(k);
    if (list) list.push(u);
    else groups.set(k, [u]);
  }

  const sets: Candidate[] = [];
  for (const list of groups.values()) {
    const visible = [...list].sort(pageOrder).slice(0, SET_PAGE_CANDIDATES);
    const set = cheapestSet(visible, quantity) as SizeUnit[] | null;
    if (set)
      sets.push({ units: set, total: setTotal(set), patched: set.filter(u => u.patched).length });
  }

  sets.sort(
    (a, b) =>
      Number(b.units[0].city === first) - Number(a.units[0].city === first) ||
      a.patched - b.patched ||
      a.total - b.total ||
      a.units[0].id.localeCompare(b.units[0].id)
  );

  const seenModels = new Set<string>();
  const picked: Candidate[] = [];
  for (const s of sets) {
    const model = `${s.units[0].brand}|${s.units[0].model2}`.toLowerCase();
    if (seenModels.has(model)) continue;
    seenModels.add(model);
    picked.push(s);
    if (picked.length === MAX_CHAT_SETS) break;
  }
  return picked;
}

/** The card for a set. Its link opens the page of the set's best-tread tire. */
export function toChatSetCard(units: SizeUnit[], size: string): ChatSetCard {
  const ordered = [...units].sort(
    (a, b) =>
      (effectiveTread(b) ?? 0) - (effectiveTread(a) ?? 0) ||
      a.price - b.price ||
      a.id.localeCompare(b.id)
  );
  const anchor = ordered[0];
  const ids = ordered.map(u => u.id).join(',');
  return {
    brand: anchor.brand,
    model: anchor.model2,
    condition: anchor.condition,
    city: anchor.city,
    count: units.length,
    total: setTotal(units),
    treadLabel: treadRange(units)?.label ?? '',
    href: `/tires/${buildTireSlug(anchor.id, anchor.brand, size)}?set=${ids}`,
    size,
    units: ordered.map(u => ({ id: u.id, price: u.price })),
  };
}

/** The chat's answer for a size: sets, or the D4 ladder when there are none. */
export function pickChatSets(units: SizeUnit[], req: ChatSetRequest): ChatSetsResult {
  const brands = (req.brands ?? []).map(b => b.trim().toLowerCase()).filter(Boolean);
  const narrowed = units.filter(
    u =>
      (brands.length === 0 || brands.includes(u.brand.toLowerCase())) &&
      (!req.condition || u.condition.toLowerCase() === req.condition) &&
      (!req.city || u.city === req.city)
  );

  const cards = (cs: Candidate[]) => cs.map(c => toChatSetCard(c.units, req.size));
  const first = req.city ?? req.visitorCity ?? null;

  const found = bestSets(narrowed, req.quantity, first);
  if (found.length > 0) {
    // Nothing in the visitor's own city: say so rather than imply it is local.
    const home = !req.city && req.visitorCity ? req.visitorCity : null;
    const outcome: ChatSetOutcome =
      home && found.every(c => c.units[0].city === otherCity(home)) ? 'other_city' : 'found';
    return { outcome, quantity: req.quantity, sets: cards(found) };
  }

  for (let q = req.quantity - 1; q >= 2; q--) {
    const smaller = bestSets(narrowed, q as SetSize, first);
    if (smaller.length > 0)
      return { outcome: 'smaller', quantity: q as SetSize, sets: cards(smaller) };
  }
  return { outcome: 'none', quantity: req.quantity, sets: [] };
}

/* ── The tire page: a set arriving from a chat link (D6) ─────────────────── */

export type PresetResult =
  | { status: 'exact'; set: SetUnit[] }
  | { status: 'replaced'; set: SetUnit[]; replaced: number }
  | { status: 'unavailable'; size: SetSize }
  | { status: 'ignored' };

/** `?set=a,b,c,d` → ids, or `null` when the value cannot be a set. */
export function parseSetParam(value: string | null | undefined): string[] | null {
  if (!value) return null;
  const ids = value.split(',').map(s => s.trim());
  if (ids.length < 2 || ids.length > 4) return null;
  if (ids.some(id => !/^\d{1,12}$/.test(id))) return null;
  if (new Set(ids).size !== ids.length) return null;
  return ids;
}

/**
 * Checks the tires named by a chat link against the tires the page can build
 * with. The page's tire (`anchor`) must be one of them. Tires that sold — or
 * that this page cannot use — are replaced with 041's `pickReplacement`; when
 * that is impossible the set is `unavailable`. The result is always a valid
 * set or nothing.
 */
export function resolvePresetSet(
  ids: string[] | null,
  anchor: SetUnit,
  candidates: SetUnit[]
): PresetResult {
  if (!ids || !ids.includes(anchor.id)) return { status: 'ignored' };
  const size = ids.length as SetSize;
  const byId = new Map(candidates.filter(c => c.id !== anchor.id).map(c => [c.id, c]));

  const kept: SetUnit[] = [anchor];
  let missing = 0;
  for (const id of ids) {
    if (id === anchor.id) continue;
    const unit = byId.get(id);
    if (unit && unit.city === anchor.city && isWithinTolerance([...kept, unit])) kept.push(unit);
    else missing++;
  }
  if (!isWithinTolerance(kept)) return { status: 'unavailable', size };

  for (let i = 0; i < missing; i++) {
    const next = pickReplacement(
      kept,
      candidates.filter(c => c.id !== anchor.id)
    );
    if (!next) return { status: 'unavailable', size };
    kept.push(next);
  }
  return missing === 0
    ? { status: 'exact', set: kept }
    : { status: 'replaced', set: kept, replaced: missing };
}
