import type { MetadataRoute } from 'next';
import { absUrl, getSiteUrl } from '@/app/utils/seo';
import { fetchActiveTireIds } from '@/repositories/tiresRepository';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const site = getSiteUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: site, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: absUrl('/search-results'), lastModified: now, changeFrequency: 'daily', priority: 0.7 },
    { url: absUrl('/legal-policies'), lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  let dynamicRoutes: MetadataRoute.Sitemap = [];
  try {
    const ids = await fetchActiveTireIds(2000);
    dynamicRoutes = ids.map(i => ({
      url: absUrl(`/detail?productId=${encodeURIComponent(i.id)}`),
      lastModified: i.modified || now,
      changeFrequency: 'weekly',
      priority: 0.6,
    }));
  } catch (e) {
    // In case DB is unavailable, fallback to static only
    dynamicRoutes = [];
  }

  return [...staticRoutes, ...dynamicRoutes];
}
