/**
 * Whether a tire can be published and how (feature 045).
 *
 * `View_Tires.Condition` is the stock status (`sold` when sold); `Trash` is set
 * when staff remove a record. The catalog and the feed already exclude both
 * through `STOREFRONT_SELLABLE_WHERE`; the tire page reads one tire by id, so
 * it needs the same two answers explicitly.
 */

/** The rule `TireInformation` applies to show "Not available". */
export function isSoldStatus(status: unknown): boolean {
  return typeof status === 'string' && status.trim().toLowerCase() === 'sold';
}

/** The `Trash` bit arrives as a boolean, a number or a string depending on the driver path. */
export function isTrashed(record: { Trash?: unknown } | null | undefined): boolean {
  const v = record?.Trash;
  if (typeof v === 'string') return v.trim().toLowerCase() === 'true' || v.trim() === '1';
  return v === true || v === 1;
}

/**
 * A record that must not be published: in the trash **and not sold**.
 *
 * Selling a tire puts it in the trash too — on 2026-11-10 all 19,387 sold
 * records had `Trash = 1` — so the trash alone cannot mean "removed": that would
 * take down every sold tire page, which stays indexed with `SoldOut` (045, D1).
 * Only trashed tires that never sold (~1,080: withdrawn, duplicated, entered by
 * mistake) are hidden.
 */
export function isRemoved(record: { Trash?: unknown; Condition?: unknown } | null | undefined) {
  return isTrashed(record) && !isSoldStatus(record?.Condition);
}

/** schema.org availability for the tire page's Product offer. */
export function schemaAvailability(status: unknown): 'SoldOut' | 'InStock' {
  return isSoldStatus(status) ? 'SoldOut' : 'InStock';
}
