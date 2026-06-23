import { permanentRedirect, redirect } from 'next/navigation';

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
    redirect('/tires');
  }

  // NOTE: redirect()/permanentRedirect() work by throwing a NEXT_REDIRECT error.
  // They must be called OUTSIDE try/catch, otherwise the catch swallows the
  // redirect and execution falls through to the catalog redirect below.
  let slug: string | null = null;
  try {
    const record = await fetchTireById(productId);
    if (record) {
      slug = buildTireSlug(String(record.TireId), record.Brand || '', record.RealSize || '');
    }
  } catch {
    // DB/lookup failed — fall through to the generic catalog redirect.
  }

  if (slug) {
    permanentRedirect(`/tires/${slug}`);
  }

  // Product isn't found — redirect to catalog instead of showing error
  redirect('/tires');
}
