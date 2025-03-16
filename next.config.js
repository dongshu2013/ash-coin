/** @type {import('next').NextConfig} */
const webpack = require('webpack');
const path = require('path');

// Load environment variables from .env.local if running in development
if (process.env.NODE_ENV === 'development') {
  require('dotenv').config({ path: '.env.local' });
}

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  env: {
    HELIUS_API_KEY: process.env.HELIUS_API_KEY || '',
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
      // Add aliases for problematic native modules
      usb: path.resolve(__dirname, './usb-stub.js'),
      'node-hid': path.resolve(__dirname, './usb-stub.js'),
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
