/**
 * Pure SQL-string helpers for the online-sellable tire lot. Kept free of any I/O
 * import (no `db`/`constants`) so it can be unit-tested without a database and
 * without tripping the env-required connection module. `tiresRepository`
 * consumes these for both the storefront list and the Google Merchant feed.
 */

/**
 * The base WHERE clause that defines the **online-sellable** tire lot — the
 * business rule the storefront shows. Shared so `fetchTires` and the Google
 * Merchant feed can never drift: the feed is exactly what the site sells. Do not
 * weaken this without a product decision.
 */
export const STOREFRONT_SELLABLE_WHERE =
  "Local = '0' AND Trash = 'false' AND Condition != 'sold' AND RemainingLife >= '50%' AND Price != 0";

/**
 * Whitelisted columns the Google Merchant feed is allowed to read — a subset of
 * `View_Tires`. Internal columns (VaultName, Local, Trash, Amount, DOT,
 * ModificationDate, …) are deliberately NOT selected, so they can never leak
 * into a public feed. Keep this list minimal.
 */
export type FeedTireRecord = {
  TireId: string;
  Code?: string;
  Brand?: string;
  Model2?: string;
  RealSize?: string;
  Description?: string;
  Price?: string | number;
  ProductTypeId?: number;
  Condition?: string;
  RemainingLife?: string;
  Patched?: string;
  Tread?: string;
  loadIndex?: string;
  speedIndex?: string;
  Image1?: string;
  Image2?: string;
  Image3?: string;
  Image4?: string;
};

const FEED_COLUMNS =
  'TireId, Code, Brand, Model2, RealSize, Description, Price, ProductTypeId, Condition, ' +
  'RemainingLife, Patched, Tread, loadIndex, speedIndex, Image1, Image2, Image3, Image4';

/**
 * The exact SQL the feed runs. Pure (no I/O) so it can be unit-tested: it must
 * reuse `STOREFRONT_SELLABLE_WHERE` (never the dashboard's `Trash='false'`-only
 * clause) and carry no row cap.
 */
export function buildFeedQuery(): string {
  return `SELECT ${FEED_COLUMNS} FROM dbo.View_Tires WHERE ${STOREFRONT_SELLABLE_WHERE} ORDER BY ModificationDate DESC`;
}
