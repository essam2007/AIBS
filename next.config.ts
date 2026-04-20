import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.reuters.com' },
      { protocol: 'https', hostname: '*.cnbc.com' },
      { protocol: 'https', hostname: '*.marketwatch.com' },
      { protocol: 'https', hostname: '*.oilprice.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Cache-Control', value: 's-maxage=30, stale-while-revalidate=60' },
        ],
      },
    ]
  },
};

export default nextConfig;
