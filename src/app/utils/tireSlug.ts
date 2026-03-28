function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
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
