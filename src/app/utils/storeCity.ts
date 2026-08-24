/**
 * Which city a tire is actually in.
 *
 * The inventory records an internal warehouse name in `VaultName` — `Clifton`,
 * `Semoran`, `441`, `27th Ave`, `Warehouse` — and those names are **not** the
 * public store names in `locationsConfig`, so the two cannot be joined. This is
 * the map between them, and it is deliberately the only one.
 *
 * Until 2026-08-24 every tire page, every Product JSON-LD node and every Google
 * Merchant item said "Available at MrGoma Tires in Miami, FL." — a sentence with
 * no store in it at all. **793 of 4.157 sellable tires are in Orlando**, so
 * roughly one in five listings named the wrong city, on the storefront and in the
 * feed Google Shopping reads.
 *
 * `VaultName` itself never reaches a customer: `pickTireListFields` keeps it off
 * the public list API and the Merchant whitelist keeps it out of the feed. That
 * is why this returns a **city** rather than a store name — the buyer needs to
 * know where the tire is, not what the warehouse is called inside.
 */

export type StoreCity = 'Miami' | 'Orlando';

/** The warehouses in the Orlando area. Confirmed with the owner, 2026-08-24. */
export const ORLANDO_VAULTS = ['Clifton', 'Semoran', 'Orlando'] as const;

/**
 * The warehouses in the Miami area, listed rather than merely implied.
 *
 * Two of these were checked before being accepted: `Warehouse` holds 1.771
 * sellable tires — 43% of the catalog — and its name says nothing about where it
 * is; `Pembroke WH` is Pembroke Pines, which is Broward County rather than
 * Miami-Dade. Both were confirmed as Miami on 2026-08-24, the second because the
 * metro area is what a buyer recognises.
 */
export const MIAMI_VAULTS = [
  'Warehouse',
  'Pembroke WH',
  'Coral Gables',
  'Hialeah',
  '441',
  '27th Ave',
  'Cutler bay',
] as const;

/** Every warehouse we know of, for the guard that checks none was forgotten. */
export const KNOWN_VAULTS = [...ORLANDO_VAULTS, ...MIAMI_VAULTS];

/**
 * Maps a warehouse name to the city a customer should be told.
 *
 * An unrecognised or missing name falls back to `Miami`. That is the status quo
 * and the larger group, but it is a *fallback, not an answer*: a warehouse
 * opening in Kissimmee would silently read as Miami, which is the same defect
 * this function exists to fix. Add it to `ORLANDO_VAULTS` or `MIAMI_VAULTS`.
 */
export function storeCity(vaultName?: string | null): StoreCity {
  const name = (vaultName ?? '').trim().toLowerCase();
  return ORLANDO_VAULTS.some(vault => vault.toLowerCase() === name) ? 'Orlando' : 'Miami';
}
