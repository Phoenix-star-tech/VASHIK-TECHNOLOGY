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
