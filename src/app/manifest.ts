import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MrGoma Tires',
    short_name: 'MrGoma',
    description: 'New and used tires in Miami – MrGoma Tires',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#16a34a',
    icons: [
      {
        src: '/favicon.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  };
}
