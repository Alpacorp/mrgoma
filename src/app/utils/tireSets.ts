/**
 * The tire-set engine (feature 041): which sets can be built around a tire, which
 * units to suggest, which swaps keep a set valid, and what replaces a unit that
 * sold. Pure — no React, no database — so every rule in the spec is a unit test.
 *
 * Every tire is a unique physical unit, so a "set" is never a quantity: it is a
 * choice of distinct units of the same brand, model, size and run-flat type, in
 * the same city (the query guarantees those). This module adds the last rule —
 * **the tread may differ by at most 2/32" across the set** — and the order in
 * which units are preferred (decision D6 of the spec):
 *
 *   1. tread closest to the tire the shopper is looking at,
 *   2. unpatched before patched,
 *   3. lower price.
 */

export type SetSize = 2 | 3 | 4;
export const SET_SIZES: readonly SetSize[] = [2, 3, 4];

/** Largest allowed tread difference inside a set, in 32nds of an inch (D2). */
export const MAX_TREAD_SPREAD = 2;

/**
 * Tread assumed for a **new** tire with no recorded value. New units of a model
 * are identical, so a missing figure is a data gap, not a worn tire (spec FR1).
 */
export const NEW_TIRE_TREAD = 10;

/** Float tolerance: `9.6 → 7.6` is exactly 2/32" and must pass. */
const EPSILON = 1e-9;

export type TireCity = 'Miami' | 'Orlando';

/** One tire as the set builder sees it. Never carries warehouse names. */
export type SetUnit = {
  id: string;
  code?: string;
  price: number;
  /** In 32nds of an inch, or `null` when the record has no usable value. */
  tread: number | null;
  /** Remaining life as the record shows it, e.g. `"88%"`. */
  life?: string;
  patched: boolean;
  dot?: string;
  /** A real photo, or `null` — never the generic placeholder. */
  image?: string | null;
  condition: 'New' | 'Used';
  city: TireCity;
};

/** The fields of a detail-page tire this module needs (a subset of `SingleTire`). */
export type TireForSet = {
  id: string | number;
  code?: string;
  price: string;
  treadDepth: string;
  remainingLife?: string;
  patched?: string;
  dot?: string;
  images?: Array<{ src: string }>;
  condition?: string;
  city?: TireCity;
};

/** A detail-page tire as the set engine sees it. */
export function anchorFromTire(tire: TireForSet): SetUnit {
  const price = parseFloat(String(tire.price));
  const photo = (tire.images ?? []).find(i => i.src && !i.src.includes('generic-tire-image'));
  return {
    id: String(tire.id),
    code: tire.code,
    price: Number.isFinite(price) ? price : 0,
    tread: parseTread(tire.treadDepth),
    life: tire.remainingLife && tire.remainingLife !== '-' ? tire.remainingLife : undefined,
    patched: tire.patched === 'Yes',
    dot: tire.dot && tire.dot !== 'N/A' ? tire.dot : undefined,
    image: photo?.src ?? null,
    condition: tire.condition === 'New' ? 'New' : 'Used',
    city: tire.city ?? 'Miami',
  };
}

/** `'10.0'` → 10, `'9.6'` → 9.6; `'-'`, blank, garbage or ≤ 0 → `null`. */
export function parseTread(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const n = typeof value === 'number' ? value : parseFloat(String(value).trim());
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** The tread a unit counts with: its own, or full tread for a new tire. */
export function effectiveTread(unit: SetUnit): number | null {
  if (unit.tread !== null && unit.tread !== undefined) return unit.tread;
  return unit.condition === 'New' ? NEW_TIRE_TREAD : null;
}

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

export type TreadRange = { min: number; max: number; spread: number; label: string };

/** "9–10/32, Δ1/32", or "10/32" when every tire is the same. */
export function treadRange(units: SetUnit[]): TreadRange | null {
  const treads = units.map(effectiveTread).filter((t): t is number => t !== null);
  if (treads.length === 0) return null;
  const min = Math.min(...treads);
  const max = Math.max(...treads);
  const spread = Math.round((max - min) * 10) / 10;
  const label = spread === 0 ? `${fmt(min)}/32` : `${fmt(min)}–${fmt(max)}/32, Δ${fmt(spread)}/32`;
  return { min, max, spread, label };
}

/** True when every unit has a tread and they differ by at most 2/32". */
export function isWithinTolerance(units: SetUnit[]): boolean {
  const treads = units.map(effectiveTread);
  if (treads.some(t => t === null)) return false;
  const nums = treads as number[];
  return Math.max(...nums) - Math.min(...nums) <= MAX_TREAD_SPREAD + EPSILON;
}

export function setTotal(units: SetUnit[]): number {
  return Math.round(units.reduce((sum, u) => sum + (u.price || 0), 0) * 100) / 100;
}

/** New tires are identical: the shopper picks a quantity, not units (D11). */
export function isQuantityMode(anchor: SetUnit): boolean {
  return anchor.condition === 'New';
}

/** Candidates that can ever join a set with `anchor`: same city, a tread, not itself. */
function eligible(anchor: SetUnit, candidates: SetUnit[]): SetUnit[] {
  const seen = new Set<string>([anchor.id]);
  return candidates.filter(c => {
    if (seen.has(c.id)) return false;
    seen.add(c.id);
    return c.city === anchor.city && effectiveTread(c) !== null;
  });
}

/** D6 as a comparator, relative to a reference tread. */
function byPreference(reference: number) {
  return (a: SetUnit, b: SetUnit) =>
    Math.abs((effectiveTread(a) as number) - reference) -
      Math.abs((effectiveTread(b) as number) - reference) ||
    Number(a.patched) - Number(b.patched) ||
    a.price - b.price ||
    a.id.localeCompare(b.id);
}

/** How many other tires could join a valid set with `anchor` (spec FR4). */
export function countJoinable(anchor: SetUnit, candidates: SetUnit[]): number {
  const t = effectiveTread(anchor);
  if (t === null) return 0;
  return eligible(anchor, candidates).filter(
    c => Math.abs((effectiveTread(c) as number) - t) <= MAX_TREAD_SPREAD + EPSILON
  ).length;
}

/**
 * The best set of `size` tires that includes `anchor`, or `null`.
 *
 * Picking the closest treads greedily can overshoot (anchor 8, units 6 and 10:
 * each is 2 away, together 4 apart). So every 2/32" window that contains the
 * anchor is tried, the D6-best units are taken inside each, and the windows are
 * compared on (total tread distance, patched count, total price).
 */
export function suggestSet(
  anchor: SetUnit,
  candidates: SetUnit[],
  size: SetSize
): SetUnit[] | null {
  const anchorTread = effectiveTread(anchor);
  if (anchorTread === null) return null;
  const pool = eligible(anchor, candidates);
  const prefer = byPreference(anchorTread);

  const lowerBounds = new Set<number>([anchorTread]);
  for (const c of pool) {
    const t = effectiveTread(c) as number;
    if (t <= anchorTread && anchorTread - t <= MAX_TREAD_SPREAD + EPSILON) lowerBounds.add(t);
  }

  let best: { units: SetUnit[]; score: [number, number, number] } | null = null;
  for (const low of lowerBounds) {
    const high = low + MAX_TREAD_SPREAD + EPSILON;
    const inWindow = pool
      .filter(c => {
        const t = effectiveTread(c) as number;
        return t >= low - EPSILON && t <= high;
      })
      .sort(prefer);
    if (inWindow.length < size - 1) continue;
    const chosen = inWindow.slice(0, size - 1);
    const score: [number, number, number] = [
      chosen.reduce((s, c) => s + Math.abs((effectiveTread(c) as number) - anchorTread), 0),
      chosen.filter(c => c.patched).length,
      setTotal(chosen),
    ];
    if (
      !best ||
      score[0] < best.score[0] - EPSILON ||
      (Math.abs(score[0] - best.score[0]) <= EPSILON &&
        (score[1] < best.score[1] || (score[1] === best.score[1] && score[2] < best.score[2])))
    ) {
      best = { units: [anchor, ...chosen], score };
    }
  }
  return best ? best.units : null;
}

/** Sizes for which a valid set exists (spec FR3). */
export function availableSetSizes(anchor: SetUnit, candidates: SetUnit[]): SetSize[] {
  return SET_SIZES.filter(size => suggestSet(anchor, candidates, size) !== null);
}

/**
 * Units that can replace `set[index]` without breaking the 2/32" rule, best
 * first. The anchor (index 0) is never swapped: it is the tire on the page.
 */
export function swapOptions(set: SetUnit[], index: number, candidates: SetUnit[]): SetUnit[] {
  if (index <= 0 || index >= set.length) return [];
  const anchor = set[0];
  const anchorTread = effectiveTread(anchor);
  if (anchorTread === null) return [];
  const others = set.filter((_, i) => i !== index);
  const inSet = new Set(set.map(u => u.id));
  return eligible(anchor, candidates)
    .filter(c => !inSet.has(c.id) && isWithinTolerance([...others, c]))
    .sort(byPreference(anchorTread));
}

/**
 * The best unit to replace one that sold, given the units the shopper keeps
 * (spec FR13). Same city as the kept units, within 2/32" of all of them, D6
 * order relative to the first kept unit. `null` when nothing fits.
 */
export function pickReplacement(keep: SetUnit[], candidates: SetUnit[]): SetUnit | null {
  if (keep.length === 0) return null;
  const reference = effectiveTread(keep[0]);
  if (reference === null) return null;
  const kept = new Set(keep.map(u => u.id));
  const city = keep[0].city;
  const options = candidates
    .filter(
      c =>
        !kept.has(c.id) &&
        c.city === city &&
        effectiveTread(c) !== null &&
        isWithinTolerance([...keep, c])
    )
    .sort(byPreference(reference));
  return options[0] ?? null;
}

/**
 * The unit most like a tire with tread `reference`, in 041's order (closest
 * tread → unpatched → cheaper → id). No tread limit: used by feature 043 to
 * point a visitor at "the same tire" in their own city. Units without a tread
 * come last; `null` for an empty list.
 */
export function closestMatch(reference: number | null, candidates: SetUnit[]): SetUnit | null {
  if (candidates.length === 0) return null;
  const withTread = candidates.filter(c => effectiveTread(c) !== null);
  const without = candidates.filter(c => effectiveTread(c) === null);
  const ref = reference ?? Math.max(0, ...withTread.map(c => effectiveTread(c) as number));
  const ordered = [
    ...withTread.sort(byPreference(ref)),
    ...without.sort((a, b) => Number(a.patched) - Number(b.patched) || a.price - b.price),
  ];
  return ordered[0] ?? null;
}
