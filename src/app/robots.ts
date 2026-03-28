import type { MetadataRoute } from 'next';

import { getSiteUrl } from '@/app/utils/seo';

export default function robots(): MetadataRoute.Robots {
  const site = getSiteUrl();
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/checkout', '/dashboard', '/sellers/'],
      },
    ],
    sitemap: `${site}/sitemap.xml`,
    host: site,
  };
}
