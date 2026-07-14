/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/webp'],
    minimumCacheTTL: 2678400,
    qualities: [75],
    deviceSizes: [640, 828, 1200, 1920],
    imageSizes: [128, 256],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.usedtires.online',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'mrgomatires.com',
        port: '',
      },
    ],
  },
  allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev'],
};

export default nextConfig;
