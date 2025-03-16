// Import functions from api.ts
import { getTokensByOwner, getTokenMarketData, getCurrentBlockHeight } from './api';

// Re-export the functions from api.ts
export { getTokensByOwner, getTokenMarketData, getCurrentBlockHeight };

// For client-side components that need to know the API endpoints
export const API_ENDPOINTS = {
  ASSETS: '/api/helius/assets',
  BLOCKHEIGHT: '/api/helius/blockheight',
  HELIUS: '/api/helius',
};

// Note: We no longer export HELIUS_API_KEY or HELIUS_RPC_URL from this file
// as they are now accessed directly in the API routes using process.env
