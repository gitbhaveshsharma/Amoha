import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false, // Disables source map generation
  webpack: (config, { isServer }) => {
    config.devtool = false; // Disables source maps in development

    // Handle problematic modules for client-side builds
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'aws-sdk': false,
        'mock-aws-s3': false,
        nock: false,
        'node-pre-gyp': false,
        canvas: false,
        encoding: false,
      };
    }

    return config;
  },
  experimental: {
    serverComponentsExternalPackages: [
      '@tensorflow/tfjs-node',
      'aws-sdk',
      'mock-aws-s3',
      'nock',
      'canvas',
    ],
  },
  turbo: {
    rules: {
      '*.node': { loaders: ['file-loader'] },
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ihtrnldifbhuntphmfll.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
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
      },
    ];
  },
  logging: {
    fetches: {
      fullUrl: false, // Reduces fetch logging noise
    },
  },
};

export default nextConfig;
