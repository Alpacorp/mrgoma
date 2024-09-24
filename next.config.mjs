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
  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/catalog',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
