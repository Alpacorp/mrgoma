/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2678400,
    qualities: [50, 75],
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
