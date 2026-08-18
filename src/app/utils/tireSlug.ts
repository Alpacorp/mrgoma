export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * The value in `values` whose slug is `slug`, or `null`.
 *
 * The inverse of {@link slugify}, and the only correct way to turn a URL segment
 * back into the catalog value it came from: it answers `null` for anything we do
 * not have, rather than reconstructing something plausible from the slug's
 * shape.
 *
 * That distinction was a live bug. `/tires/size/[size]` used to fall back to
 * splitting an unrecognised slug into three parts and inventing a size from
 * them, so `/tires/size/foo-bar-baz` rendered a real page — indexable, and
 * declaring itself canonical. Any three-segment slug was a new page, which is an
 * unbounded URL space anyone could add to. The brand route never had the bug
 * because it did exactly what this function does.
 *
 * Kept here, beside `slugify`, so the two halves of the mapping cannot drift
 * apart, and so matching can be tested without reaching a database.
 */
export function matchSlug(values: readonly string[], slug: string): string | null {
  if (!slug) return null;
  return values.find(value => slugify(value) === slug) ?? null;
}

/**
 * Builds a SEO-friendly slug for a tire product page.
 * Format: {id}-{brand}-{size}
 * Example: 591388-suredrive-225-40-18
 */
export function buildTireSlug(id: string, brand: string, size: string): string {
  const brandSlug = slugify(brand);
  const sizeSlug = slugify(size);
  return [id, brandSlug, sizeSlug].filter(Boolean).join('-');
}

/**
 * Extracts the tire ID from a slug. The ID is always the first numeric segment.
 * Example: "591388-suredrive-225-40-18" → "591388"
 */
export function extractIdFromSlug(slug: string): string {
  return slug.split('-')[0];
}
