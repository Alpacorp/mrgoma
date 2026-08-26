/**
 * How a tire's condition facts are written for a buyer.
 *
 * One place, because these appear on the card, in the table and on the detail
 * page — and this repository has now collapsed four separate spellings of a
 * brand, of a city and of the sellable rule. A fourth divergence is not worth
 * waiting for.
 */

/**
 * Tread depth, in the unit the US market reads it in.
 *
 * The stored value is a bare number — `8.0` — and the card showed exactly that.
 * A tire's tread is measured in **thirty-seconds of an inch**, and a naked "8.0"
 * is unreadable to the buyer it is meant to reassure: 8 of what? A new passenger
 * tire is about 10/32", the legal minimum is 2/32", so 8/32" says "most of its
 * life left" to anyone who has bought tires before, and nothing at all otherwise.
 */
export function treadDepthLabel(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return '—';
  const raw = String(value).trim();
  if (!raw || raw === '-' || raw === 'N/A') return '—';

  // Already carries a unit — leave it alone rather than doubling it.
  if (raw.includes('/32') || raw.includes('"')) return raw;

  const n = Number(raw);
  if (!Number.isFinite(n)) return raw;

  // 8.0 reads as 8; 7.5 keeps its half.
  const shown = Number.isInteger(n) ? String(n) : String(n);
  return `${shown}/32"`;
}

/** The unit on its own, for a column header or a label. */
export const TREAD_UNIT = '32nds of an inch';

/**
 * What a patched tire means.
 *
 * "Patched: Yes" on its own reads as a warning, and it is the point where a
 * buyer of used tires hesitates. A patch is a repair to a standard — the shop
 * inspects and repairs to DOT practice — and saying so is the difference between
 * a fact that worries and a fact that reassures. Mission: transparency over
 * hiding; the answer to a scary-sounding truth is context, not silence.
 */
export const PATCHED_EXPLANATION =
  'Professionally inspected and repaired to DOT safety standards.';

/** The reassurance, but only where there is something to reassure about. */
export function patchedNote(value: string | undefined | null): string | undefined {
  return String(value ?? '').trim().toLowerCase() === 'yes' ? PATCHED_EXPLANATION : undefined;
}
