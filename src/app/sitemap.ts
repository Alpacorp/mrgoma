import type { MetadataRoute } from 'next';

import { absUrl, getSiteUrl } from '@/app/utils/seo';
import { buildTireSlug } from '@/app/utils/tireSlug';
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
    dynamicRoutes = ids.map(i => {
      const slug = buildTireSlug(i.id, i.brand || '', i.size || '');
      return {
        url: absUrl(`/tires/${slug}`),
        lastModified: i.modified || now,
        changeFrequency: 'weekly',
        priority: 0.6,
      };
    });
  } catch {
    dynamicRoutes = [];
  }

  return [...staticRoutes, ...dynamicRoutes];
}
