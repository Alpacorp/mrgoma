/**
 * The single source of truth for every differentiator claim the site makes.
 *
 * Before this module the same claim was retyped in eleven files, which is how
 * the site ended up telling two different inventory stories at once: the home
 * page said "15,000+ tires in stock" while `/tires` rendered the live database
 * count. Both were visible to Google, and read together they looked like an
 * exaggeration.
 *
 * Rules that must survive future edits (see `spec/features/014-serp-differentiators`):
 *
 * - There are exactly **two** inventory claims and they mean different things.
 *   {@link INVENTORY_NETWORK} is the physical stock across the stores;
 *   {@link onlineInventoryLabel} is what is actually purchasable on the site.
 *   Neither may be written in a way that implies the other, and the unqualified
 *   "15,000+ tires in stock" is retired.
 * - "Used tires" is the product term in titles, headings and URLs, because that
 *   is what people search. "Like-new" is a qualifier for body copy and the
 *   differentiator strips only.
 * - Superlatives stay defensible: "one of Florida's largest selections", never
 *   "Florida's largest selection".
 */

/** Warranty claim, short form — used in strips, titles and badges. */
export const WARRANTY = '30-Day Warranty';

/** Warranty claim, long form — used in prose and the primary differentiator list. */
export const WARRANTY_LONG = '30-Day Warranty on Like-New Used Tires';

/**
 * The network inventory claim: physical stock held across all stores.
 * Always carries the "across our 7 locations" qualifier — an unqualified
 * "15,000+ tires in stock" contradicts the live count on the listing pages.
 */
export const INVENTORY_NETWORK = '15,000+ tires across our 7 locations';

/** The network figure on its own, for layouts that render the label separately. */
export const INVENTORY_NETWORK_FIGURE = '15,000+';

/** The label that must accompany {@link INVENTORY_NETWORK_FIGURE}. */
export const INVENTORY_NETWORK_LABEL = 'Tires across our 7 locations';

/**
 * The online inventory claim: how many tires are actually purchasable on the
 * site right now. Always fed the live `totalCount` the page already renders.
 */
export function onlineInventoryLabel(count: number): string {
  return `${count.toLocaleString('en-US')} available to buy online`;
}

/** Shipping promise. Unconditional — confirmed with the owner (2026-07-31). */
export const SHIPPING = 'Free shipping nationwide';

export const LOCATIONS_COUNT = 7;

/** Locations claim, short form for strips. */
export const LOCATIONS_LABEL = '7 locations Miami & Orlando';

/** Locations claim, prose form. */
export const LOCATIONS_LABEL_LONG = '7 locations in Miami & Orlando, FL';

export const FOUNDED_YEAR = 2007;

/** Trust claim built from {@link FOUNDED_YEAR} so the year is stated once. */
export const SINCE = `Since ${FOUNDED_YEAR}`;

export const FAMILY_OWNED = 'Family-owned business';

/** Installation speed claim. */
export const FAST_INSTALLATION = 'Fast installation';

/**
 * Selection claim. Deliberately *not* "Florida's largest selection": a
 * comparative superlative is challengeable and we cannot evidence it.
 */
export const SELECTION_CLAIM = "One of Florida's largest selections of like-new used tires";

/** The brand slogan. Supporting copy — never the `<h1>`. */
export const SLOGAN = 'The Tires you need, The Price you want';

/** Brand positioning line. */
export const POSITIONING = 'Dealership-Level Service. Independent-Shop Prices.';

/** Brand positioning line, short form. */
export const POSITIONING_SHORT = 'Drive with Confidence';

/** What we sell, as one line. */
export const OFFERING = 'New Tires • Like-New Used Tires • Complete Auto Care';

/** The four claims we lead with, in priority order. */
export const PRIMARY_DIFFERENTIATORS: readonly string[] = [
  WARRANTY_LONG,
  INVENTORY_NETWORK,
  SELECTION_CLAIM,
  OFFERING,
];

/** Supporting trust and convenience claims. */
export const SECONDARY_DIFFERENTIATORS: readonly string[] = [
  FAST_INSTALLATION,
  '7 convenient locations',
  'Shop online',
  SHIPPING,
  `Trusted since ${FOUNDED_YEAR}`,
  FAMILY_OWNED,
];

/**
 * What the home hero strip renders. Short enough to wrap to at most two lines
 * at 390px so it never pushes the tire search below the fold.
 */
export const HOME_TRUST_CLAIMS: readonly string[] = [
  WARRANTY,
  // Carries the location count inside it, so LOCATIONS_LABEL would repeat it —
  // three pills also wrap more reliably at 390px than four.
  INVENTORY_NETWORK,
  SHIPPING,
];

/**
 * Patterns that identify a primary differentiator inside prose.
 *
 * The metadata guard uses these rather than substring-matching
 * {@link PRIMARY_DIFFERENTIATORS} directly: a 150-character description cannot
 * contain a full claim verbatim, but it must contain a recognisable form of one.
 */
export const PRIMARY_DIFFERENTIATOR_PATTERNS: readonly RegExp[] = [
  /30-day warranty/i,
  /15,000\+/,
  /largest selections?/i,
  /like-new used/i,
];

/** True when `text` states at least one primary differentiator. */
export function statesPrimaryDifferentiator(text: string): boolean {
  return PRIMARY_DIFFERENTIATOR_PATTERNS.some(pattern => pattern.test(text));
}
