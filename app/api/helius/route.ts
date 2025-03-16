import { NextRequest, NextResponse } from 'next/server';

// Get the API key directly from environment variables - check both possible names
const HELIUS_API_KEY = process.env.HELIUS_API_KEY || process.env.NEXT_PUBLIC_HELIUS_API_KEY || '';
const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

// Debug logging
console.log(`[Main Helius API] Initializing with API key length: ${HELIUS_API_KEY.length}`);
console.log(`[Main Helius API] API key is empty: ${HELIUS_API_KEY === ''}`);
console.log(`[Main Helius API] process.env.HELIUS_API_KEY exists: ${!!process.env.HELIUS_API_KEY}`);
console.log(
  `[Main Helius API] process.env.NEXT_PUBLIC_HELIUS_API_KEY exists: ${!!process.env.NEXT_PUBLIC_HELIUS_API_KEY}`
);
if (HELIUS_API_KEY.length > 0) {
  console.log(`[Main Helius API] API key first 4 chars: ${HELIUS_API_KEY.substring(0, 4)}`);
}
console.log(`[Main Helius API] RPC URL: ${HELIUS_RPC_URL.replace(HELIUS_API_KEY, 'MASKED')}`);
console.log(`[Main Helius API] NODE_ENV: ${process.env.NODE_ENV}`);

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds
const MAX_REQUESTS_PER_IP = 60; // 60 requests per minute per IP
const MAX_REQUESTS_PER_WALLET = 30; // 30 requests per minute per wallet

// In-memory rate limiting (will reset on server restart)
// In a production environment, you'd use Redis or another persistent store
const ipRequestCounts: Record<string, { count: number; resetTime: number }> = {};
const walletRequestCounts: Record<string, { count: number; resetTime: number }> = {};

// Check rate limit for an identifier (IP or wallet)
function checkRateLimit(
  identifier: string,
  store: Record<string, { count: number; resetTime: number }>,
  maxRequests: number
): boolean {
  const now = Date.now();

  // Initialize or reset if window has passed
  if (!store[identifier] || now > store[identifier].resetTime) {
    store[identifier] = {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    };
    return true;
  }

  // Increment count and check limit
  store[identifier].count += 1;
  return store[identifier].count <= maxRequests;
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown-ip';

    // Check IP-based rate limit
    if (!checkRateLimit(ip, ipRequestCounts, MAX_REQUESTS_PER_IP)) {
      return NextResponse.json({ error: 'Rate limit exceeded for your IP' }, { status: 429 });
    }

    // Parse the request body
    const body = await request.json();
    const { method, params, walletAddress } = body;

    // If a wallet address is provided, check wallet-based rate limit
    if (walletAddress) {
      if (!checkRateLimit(walletAddress, walletRequestCounts, MAX_REQUESTS_PER_WALLET)) {
        return NextResponse.json({ error: 'Rate limit exceeded for this wallet' }, { status: 429 });
      }
    }

    // Validate required fields
    if (!method) {
      return NextResponse.json({ error: 'Method is required' }, { status: 400 });
    }

    // Log the request (for debugging, only in development)
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log(`Helius API request:`, {
        method: method,
        params,
        walletAddress,
      });
    }

    // Forward the request to Helius
    const response = await fetch(HELIUS_RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'ash-coin-app',
        method,
        params,
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
    console.error('Error in Helius API proxy:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
