/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    minimumCacheTTL: 2678400,
    qualities: [75],
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

  async rewrites() {
    return [
      {
        source: '/',
        destination: '/home',
      },
    ]
  },
};

export default nextConfig;
