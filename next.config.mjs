import dns from 'node:dns';

try {
  dns.setDefaultResultOrder('ipv4first');
} catch {}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/protal',
        destination: '/portal',
      },
    ];
  },
};

export default nextConfig;
