import type { MetadataRoute } from 'next';

import { storefrontManifest } from '@/app/utils/appManifest';

export default function manifest(): MetadataRoute.Manifest {
  return storefrontManifest();
}
