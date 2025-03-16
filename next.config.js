/** @type {import('next').NextConfig} */
const webpack = require('webpack');

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  // Explicitly define environment variables that should be available at runtime
  env: {
    NEXT_PUBLIC_HELIUS_API_KEY: process.env.NEXT_PUBLIC_HELIUS_API_KEY || '',
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

    // Log environment variables during build (for debugging)
    console.log('Building with environment variables:', {
      NEXT_PUBLIC_HELIUS_API_KEY: process.env.NEXT_PUBLIC_HELIUS_API_KEY ? 'Set' : 'Not set',
      NODE_ENV: process.env.NODE_ENV,
    });

    return config;
  },
};

module.exports = nextConfig;
