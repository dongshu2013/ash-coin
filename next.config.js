/** @type {import('next').NextConfig} */
const webpack = require('webpack');

// Load environment variables from .env.local if running in development
if (process.env.NODE_ENV === 'development') {
  require('dotenv').config({ path: '.env.local' });
}

// Get environment variables - check both HELIUS_API_KEY and NEXT_PUBLIC_HELIUS_API_KEY
const HELIUS_API_KEY = process.env.HELIUS_API_KEY || process.env.NEXT_PUBLIC_HELIUS_API_KEY || '';

// Log environment variables in development only
if (process.env.NODE_ENV === 'development') {
  console.log('Next.js config - Environment variables:', {
    HELIUS_API_KEY: HELIUS_API_KEY ? `Set (length: ${HELIUS_API_KEY.length})` : 'Not set',
    NODE_ENV: process.env.NODE_ENV,
  });
}

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  // Make environment variables available to the server
  env: {
    HELIUS_API_KEY: HELIUS_API_KEY || '',
    NEXT_PUBLIC_HELIUS_API_KEY: HELIUS_API_KEY || '',
  },
  // Also make them available via serverRuntimeConfig
  serverRuntimeConfig: {
    HELIUS_API_KEY: HELIUS_API_KEY || '',
  },
  publicRuntimeConfig: {
    NEXT_PUBLIC_HELIUS_API_KEY: HELIUS_API_KEY || '',
  },
  webpack: config => {
    // Add polyfills for Node.js modules used by Helius SDK
    config.externals.push('pino-pretty', 'lokijs', 'encoding');

    // Add fallbacks for Node.js core modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      path: require.resolve('path-browserify'),
      zlib: require.resolve('browserify-zlib'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      os: require.resolve('os-browserify/browser'),
      buffer: require.resolve('buffer/'),
    };

    // Add buffer polyfill
    config.plugins.push(
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser',
      })
    );

    return config;
  },
};

module.exports = nextConfig;
