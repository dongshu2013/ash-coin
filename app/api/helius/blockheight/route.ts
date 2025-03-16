import { NextResponse } from 'next/server';
import { HELIUS_API_KEY } from '@/utils/helius';

// Construct the Helius RPC URL with the API key
const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

// Add debug logging for the Helius RPC URL and API key (masking the actual key)
// eslint-disable-next-line no-console
console.log('Blockheight API route initialized with:');
// eslint-disable-next-line no-console
console.log('- API Key length:', HELIUS_API_KEY ? HELIUS_API_KEY.length : 0);
// eslint-disable-next-line no-console
console.log('- API Key is empty:', HELIUS_API_KEY === '');
// eslint-disable-next-line no-console
console.log('- RPC URL:', HELIUS_RPC_URL.replace(/api-key=([^&]*)/, 'api-key=[REDACTED]'));

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
