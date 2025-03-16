import { NextResponse } from 'next/server';

// Get the API key directly from environment variables - check both possible names
const HELIUS_API_KEY = process.env.HELIUS_API_KEY || process.env.NEXT_PUBLIC_HELIUS_API_KEY || '';
const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

// Debug logging
console.log(`[Blockheight API] Initializing with API key length: ${HELIUS_API_KEY.length}`);
console.log(`[Blockheight API] API key is empty: ${HELIUS_API_KEY === ''}`);
console.log(`[Blockheight API] process.env.HELIUS_API_KEY exists: ${!!process.env.HELIUS_API_KEY}`);
console.log(
  `[Blockheight API] process.env.NEXT_PUBLIC_HELIUS_API_KEY exists: ${!!process.env.NEXT_PUBLIC_HELIUS_API_KEY}`
);
if (HELIUS_API_KEY.length > 0) {
  console.log(`[Blockheight API] API key first 4 chars: ${HELIUS_API_KEY.substring(0, 4)}`);
}
console.log(`[Blockheight API] RPC URL: ${HELIUS_RPC_URL.replace(HELIUS_API_KEY, 'MASKED')}`);
console.log(`[Blockheight API] NODE_ENV: ${process.env.NODE_ENV}`);

export async function GET() {
  try {
    // Log the request (for debugging, only in development)
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log('Getting current block height');
    }

    const response = await fetch(HELIUS_RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'ash-coin-app',
        method: 'getBlockHeight',
        params: [],
      }),
    });

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

    return NextResponse.json({ result: data.result });
  } catch (error) {
    // Always log unexpected errors
    // eslint-disable-next-line no-console
    console.error('Error in getBlockHeight API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
