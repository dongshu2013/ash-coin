// Cache keys
const CACHE_KEYS = {
  TOKENS: 'ash-coin-tokens-cache',
};

// Cache expiration time (1 minute in milliseconds)
const CACHE_EXPIRATION = 60 * 1000;

// Helper function to get cached data
function getCachedData(key: string) {
  if (typeof window === 'undefined') return null;

  try {
    const cachedData = localStorage.getItem(key);
    if (!cachedData) return null;

    const { data, timestamp } = JSON.parse(cachedData);
    const now = Date.now();

    // Check if cache is still valid (less than 1 minute old)
    if (now - timestamp < CACHE_EXPIRATION) {
      console.log(`Using cached data for ${key}`);
      return data;
    }

    console.log(`Cache expired for ${key}`);
    return null;
  } catch (error) {
    console.error('Error reading from cache:', error);
    return null;
  }
}

// Helper function to set cached data
function setCachedData(key: string, data: any) {
  if (typeof window === 'undefined') return;

  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
    };

    localStorage.setItem(key, JSON.stringify(cacheData));
    console.log(`Data cached for ${key}`);
  } catch (error) {
    console.error('Error writing to cache:', error);
  }
}

// Helper function to make API calls to our backend proxy
async function callBackendApi(endpoint: string, method: 'GET' | 'POST' = 'GET', data?: any) {
  try {
    console.log(`Calling backend API: ${endpoint}`, data);

    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(endpoint, options);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! Status: ${response.status}, ${errorText}`);
    }

    const responseData = await response.json();

    if (responseData.error) {
      console.error('API error:', responseData.error);
      throw new Error(responseData.error || 'Error calling API');
    }

    return responseData.result;
  } catch (error) {
    console.error(`Error in API call to ${endpoint}:`, error);
    throw error;
  }
}

// Function to get all tokens owned by a wallet (excluding SOL)
export async function getTokensByOwner(ownerAddress: string) {
  try {
    console.log('Fetching tokens for wallet:', ownerAddress);

    // Generate cache key specific to this wallet
    const tokensKey = `${CACHE_KEYS.TOKENS}-${ownerAddress}`;

    // Try to get tokens from cache
    let tokensResult = getCachedData(tokensKey);
    if (!tokensResult) {
      // If not in cache or expired, fetch from our backend API
      tokensResult = await callBackendApi(`/api/helius/assets?owner=${ownerAddress}`);

      // Cache the result
      setCachedData(tokensKey, tokensResult);
    }

    console.log('Tokens data:', tokensResult);

    // Create an array to hold all tokens
    const allTokens = [...(tokensResult.items || [])];

    // Include all tokens with a non-zero balance
    const tokens = allTokens.filter((token: any) => {
      // Skip SOL
      if (token.id === 'So11111111111111111111111111111111111111112') {
        return false;
      }

      // For tokens, check token_info.balance
      if (token.token_info && token.token_info.balance) {
        return token.token_info.balance > 0;
      }

      return false;
    });

    console.log('Filtered tokens (non-zero balance, excluding SOL):', tokens);
    return tokens;
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return [];
  }
}

// Function to get token price and market data (mock for now)
export async function getTokenMarketData(tokens: any[]) {
  if (!tokens || tokens.length === 0) {
    return [];
  }

  // In a real implementation, you would fetch price data from an API
  // For now, we'll generate mock data
  return tokens
    .map(token => {
      // Get token amount and decimals
      const decimals = token.token_info?.decimals || token.content?.metadata?.decimals || 9;

      // Handle different token amount structures
      let uiAmount = 0;
      if (token.token_info && token.token_info.balance) {
        // Token amount from token_info
        uiAmount = token.token_info.balance / Math.pow(10, decimals);
      } else if (token.ownership && token.ownership.amount) {
        // Fallback to ownership.amount if available
        uiAmount = parseInt(token.ownership.amount) / Math.pow(10, decimals);
      }

      // Skip tokens with zero balance
      if (uiAmount <= 0) {
        return null;
      }

      // For tokens, use price_info if available
      let tokenPrice = 0;
      if (token.token_info?.price_info?.price_per_token) {
        tokenPrice = token.token_info.price_info.price_per_token;
      } else {
        // Generate a random price between $0.000001 and $1
        tokenPrice = Math.random() * 0.999999 + 0.000001;
      }

      // Calculate market cap
      const supply = token.token_info?.supply
        ? parseInt(token.token_info.supply) / Math.pow(10, decimals)
        : 1000000000;
      const marketCap = supply * tokenPrice;

      // Calculate a mock 24h change (-15% to +15%)
      const change24h = Math.random() * 30 - 15;

      // Get token symbol and name
      const symbol =
        token.token_info?.symbol || token.content?.metadata?.symbol || token.symbol || 'UNKNOWN';

      const name = token.content?.metadata?.name || token.name || token.id.slice(0, 8);

      // Calculate token value
      const value = tokenPrice * uiAmount;

      return {
        ...token,
        price: tokenPrice,
        marketCap,
        change24h,
        value,
        uiAmount,
        symbol,
        name,
        decimals,
        isNft: false,
        hasPrice: true,
      };
    })
    .filter(token => token !== null); // Filter out null tokens (those with zero balance)
}

/**
 * Get the current block height from the Solana blockchain via our backend API
 * @returns The current block height
 */
export const getCurrentBlockHeight = async (): Promise<number> => {
  try {
    const result = await callBackendApi('/api/helius/blockheight');
    return result;
  } catch (error) {
    console.error('Error getting current block height:', error);
    // Return a fallback block height in case of error
    return 1040000 + Math.floor(Math.random() * 10000);
  }
};
