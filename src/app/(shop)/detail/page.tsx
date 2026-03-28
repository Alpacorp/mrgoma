import { redirect } from 'next/navigation';

import { buildTireSlug } from '@/app/utils/tireSlug';
import { fetchTireById } from '@/repositories/tiresRepository';

/**
 * Legacy route: /detail?productId=X
 * Permanently redirects to the new SEO-friendly URL: /tires/{id}-{brand}-{size}
 * Keeps old links (social, indexed pages) working via 301.
 */
export default async function LegacyDetailPage({
  searchParams,
}: {
  searchParams: Promise<{ productId?: string }>;
}) {
  const { productId } = await searchParams;

  if (!productId) {
    redirect('/search-results');
  }

  try {
    const record = await fetchTireById(productId);
    if (record) {
      const slug = buildTireSlug(String(record.TireId), record.Brand || '', record.RealSize || '');
      redirect(`/tires/${slug}`);
    }
  } catch {
    // fall through to generic redirect
  }

  // Product isn't found — redirect to catalog instead of showing error
  redirect('/search-results');
}
