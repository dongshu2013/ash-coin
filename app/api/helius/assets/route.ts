import { NextRequest, NextResponse } from 'next/server';

// Get the API key directly from environment variables - check both possible names
const HELIUS_API_KEY = process.env.HELIUS_API_KEY || process.env.NEXT_PUBLIC_HELIUS_API_KEY || '';
const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

// Debug logging
console.log(`[Assets API] Initializing with API key length: ${HELIUS_API_KEY.length}`);
console.log(`[Assets API] API key is empty: ${HELIUS_API_KEY === ''}`);
console.log(`[Assets API] process.env.HELIUS_API_KEY exists: ${!!process.env.HELIUS_API_KEY}`);
console.log(
  `[Assets API] process.env.NEXT_PUBLIC_HELIUS_API_KEY exists: ${!!process.env.NEXT_PUBLIC_HELIUS_API_KEY}`
);
if (HELIUS_API_KEY.length > 0) {
  console.log(`[Assets API] API key first 4 chars: ${HELIUS_API_KEY.substring(0, 4)}`);
}
console.log(`[Assets API] RPC URL: ${HELIUS_RPC_URL.replace(HELIUS_API_KEY, 'MASKED')}`);
console.log(`[Assets API] NODE_ENV: ${process.env.NODE_ENV}`);

export async function GET(request: NextRequest) {
  try {
    // Get the owner address from the query parameters
    const searchParams = request.nextUrl.searchParams;
    const ownerAddress = searchParams.get('owner');

    // Validate required parameters
    if (!ownerAddress) {
      return NextResponse.json({ error: 'Owner address is required' }, { status: 400 });
    }

    // Log the request (for debugging, only in development)
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log(`Getting assets for wallet: ${ownerAddress}`);
    }

    // Call Helius API
    // eslint-disable-next-line no-console
    console.log('Sending request to Helius API for getAssetsByOwner');

    const response = await fetch(HELIUS_RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'ash-coin-app',
        method: 'getAssetsByOwner',
        params: {
          ownerAddress,
          page: 1,
          limit: 100,
          options: {
            showFungible: true,
            showNativeBalance: false, // Don't show SOL balance
          },
        },
      }),
    });

    // Log the response status
    // eslint-disable-next-line no-console
    console.log(`Helius API response status: ${response.status} ${response.statusText}`);

    // Check if the response is OK
    if (!response.ok) {
      // Log error in development
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error(`Helius API error: ${response.status} ${response.statusText}`);
      }

      return NextResponse.json(
        { error: `Helius API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    // Parse and return the response
    const data = await response.json();

    // Check for Helius API errors
    if (data.error) {
      // Log error in development
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Helius API returned an error:', data.error);
      }

      return NextResponse.json(
        { error: data.error.message || 'Error calling Helius API' },
        { status: 400 }
      );
    }

    // Log success
    // eslint-disable-next-line no-console
    console.log(`Helius API request successful for getAssetsByOwner`);

    return NextResponse.json({ result: data.result });
  } catch (error) {
    // Always log unexpected errors
    // eslint-disable-next-line no-console
    console.error('Error in getAssetsByOwner API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
