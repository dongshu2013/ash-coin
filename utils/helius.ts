// Import functions from api.ts
import { getTokensByOwner, getTokenMarketData, getCurrentBlockHeight } from './api';
import getConfig from 'next/config';

// Re-export the functions from api.ts
export { getTokensByOwner, getTokenMarketData, getCurrentBlockHeight };

// Get server runtime config
const { serverRuntimeConfig } = getConfig() || {};

// Get Helius API key from environment variable (server-side only)
// Try serverRuntimeConfig first, then fall back to process.env
export const HELIUS_API_KEY =
  serverRuntimeConfig?.HELIUS_API_KEY || process.env.HELIUS_API_KEY || '';

// Construct the Helius RPC URL with the API key
export const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

// Log basic configuration info (only in development)
if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line no-console
  console.log(
    `Helius API key: ${HELIUS_API_KEY ? `Set (length: ${HELIUS_API_KEY.length})` : 'Not set'}`
  );
}
