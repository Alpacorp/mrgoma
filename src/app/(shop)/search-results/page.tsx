import { redirect } from 'next/navigation';

/**
 * Legacy route: /search-results
 * Permanently redirects to /tires preserving all query params (size, filters, pagination).
 */
export default async function LegacySearchResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ w?: string; s?: string; d?: string; page?: string; [key: string]: string | undefined }>;
}) {
  const sp = await searchParams;
  const params = new URLSearchParams();

  Object.entries(sp).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  const query = params.toString();
  redirect(query ? `/tires?${query}` : '/tires');
}
