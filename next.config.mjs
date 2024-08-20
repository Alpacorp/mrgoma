/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
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
};

export default nextConfig;
