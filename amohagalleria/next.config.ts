import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false, // Disables source map generation
  webpack: (config) => {
    config.devtool = false; // Disables source maps in development
    return config;
  },
  images: {
    remotePatterns: [ // Replaces deprecated domains option
      {
        protocol: 'https',
        hostname: 'ihtrnldifbhuntphmfll.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Optional: Rewrite noisy paths to silence 404s
  async rewrites() {
    return [
      {
        source: '/_next/src/:path*',
        destination: '/404',
      },
      {
        source: '/src/lib/:path*',
        destination: '/404',
      },
      {
        source: '/.well-known/appspecific/com.chrome.devtools.json',
        destination: '/404',
      }
    ]
  },
  logging: {
    fetches: {
      fullUrl: false, // Reduces fetch logging noise
    },
  },
};

export default nextConfig;