/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  env: {
    infuraKey: process.env.INFURA_KEY,
    defaultChainId: process.env.DEFAULT_CHAIN_ID,
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/rates',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
