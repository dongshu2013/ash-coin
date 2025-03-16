'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import TokenCard from './TokenCard';
import { motion } from 'framer-motion';
import { getTokensByOwner, getTokenMarketData } from '@/utils/helius';

// Function to get emoji for token
const getTokenEmoji = (symbol: string, isNft: boolean) => {
  if (isNft) return '🖼️';

  const emojiMap: Record<string, string> = {
    SOL: '☀️',
    BONK: '🐕',
    WIF: '🐕',
    BOOP: '👾',
    POPCAT: '🐱',
    SAMO: '🐕',
    PEPE: '🐸',
    DOGE: '🐕',
    CAT: '🐱',
    MOUSE: '🐭',
    RABBIT: '🐰',
    PENGU: '🐧',
    UAI: '🔷',
    ASH: '🔥',
  };

  return emojiMap[symbol] || '💰';
};

// Function to clear the cache for a specific wallet
const clearCache = (walletAddress: string) => {
  if (typeof window === 'undefined') return;

  try {
    // Clear tokens cache
    localStorage.removeItem(`ash-coin-tokens-cache-${walletAddress}`);
    console.log('Cache cleared for wallet:', walletAddress);
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

const Dashboard = () => {
  const { publicKey } = useWallet();
  const [assets, setAssets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalValue, setTotalValue] = useState('0');
  const [creditBalance, setCreditBalance] = useState('0');
  const [ashBalance, setAshBalance] = useState('0');
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAssets = async (forceRefresh = false) => {
    if (!publicKey) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // If force refresh, clear the cache first
      if (forceRefresh) {
        clearCache(publicKey.toString());
        setIsRefreshing(true);
      }

      // Fetch assets owned by the connected wallet
      const walletAssets = await getTokensByOwner(publicKey.toString());

      if (walletAssets && walletAssets.length > 0) {
        // Get market data for the assets
        const assetsWithMarketData = await getTokenMarketData(walletAssets);

        // Format assets for display
        const formattedAssets = assetsWithMarketData
          .filter(asset => {
            // For tokens, include if they have a non-zero amount
            return asset.uiAmount > 0;
          })
          .map(asset => ({
            id: asset.id,
            name: asset.name,
            symbol: asset.symbol,
            balance: asset.uiAmount.toLocaleString(undefined, { maximumFractionDigits: 2 }),
            price: `$${asset.price < 0.01 ? asset.price.toFixed(8) : asset.price.toFixed(2)}`,
            value: `$${asset.value < 0.01 ? asset.value.toFixed(8) : asset.value.toFixed(2)}`,
            change: `${asset.change24h > 0 ? '+' : ''}${asset.change24h.toFixed(1)}%`,
            logo: getTokenEmoji(asset.symbol, asset.isNft),
            rawValue: asset.value,
            isNft: asset.isNft,
            hasPrice: asset.hasPrice,
          }));

        // Sort assets by value (highest first)
        formattedAssets.sort((a, b) => {
          return b.rawValue - a.rawValue;
        });

        setAssets(formattedAssets);

        // Calculate total value
        const total = formattedAssets.reduce((acc, asset) => acc + asset.rawValue, 0);
        setTotalValue(total.toLocaleString(undefined, { maximumFractionDigits: 2 }));

        // Check for ASH token and set balance
        const ashToken = formattedAssets.find(asset => asset.symbol === 'ASH');
        if (ashToken) {
          setAshBalance(ashToken.balance);
        } else {
          setAshBalance('0');
        }

        console.log('All assets:', formattedAssets);
      } else {
        console.log('No assets found');
        setAssets([]);
        setTotalValue('0');
        setAshBalance('0');
      }
    } catch (err) {
      console.error('Error fetching assets:', err);
      setError('Failed to load your assets. Please try again later.');
      setAssets([]);
      setTotalValue('0');
      setAshBalance('0');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      // Set a mock credit balance for now
      setCreditBalance('0');
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [publicKey]);

  // Handle manual refresh
  const handleRefresh = () => {
    fetchAssets(true);
  };

  if (!publicKey) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-ash-600 dark:text-ash-400">
          Please connect your wallet to view your dashboard.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card"
        >
          <h2 className="text-xl font-semibold mb-2">Ash Coin Balance</h2>
          <div className="flex items-end">
            <p className="text-3xl font-bold">{isLoading ? '...' : ashBalance}</p>
            <p className="text-sm text-ash-500 dark:text-ash-400 ml-2 mb-1">ASH</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="card"
        >
          <h2 className="text-xl font-semibold mb-2">Credit Balance</h2>
          <div className="flex items-end">
            <p className="text-3xl font-bold">{isLoading ? '...' : creditBalance}</p>
            <p className="text-sm text-ash-500 dark:text-ash-400 ml-2 mb-1">CREDITS</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card"
        >
          <h2 className="text-xl font-semibold mb-2">Total Portfolio Value</h2>
          <div className="flex items-end">
            <p className="text-3xl font-bold">${isLoading ? '...' : totalValue}</p>
            <p className="text-sm text-ash-500 dark:text-ash-400 ml-2 mb-1">USD</p>
          </div>
        </motion.div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Tokens</h2>

        <div className="flex items-center">
          <button
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
            className={`flex items-center text-sm font-medium px-3 py-1 rounded-md transition-colors ${
              isLoading || isRefreshing
                ? 'bg-ash-200 text-ash-500 dark:bg-ash-800 dark:text-ash-600 cursor-not-allowed'
                : 'bg-ash-100 text-ash-700 hover:bg-ash-200 dark:bg-ash-800 dark:text-ash-300 dark:hover:bg-ash-700'
            }`}
          >
            <svg
              className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card animate-pulse">
              <div className="h-6 bg-ash-200 dark:bg-ash-800 rounded w-1/3 mb-4"></div>
              <div className="h-8 bg-ash-200 dark:bg-ash-800 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-ash-200 dark:bg-ash-800 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assets.length > 0 ? (
            assets.map((asset, index) => (
              <motion.div
                key={asset.id || asset.symbol}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <TokenCard token={asset} />
              </motion.div>
            ))
          ) : (
            <div className="col-span-2 text-center py-8">
              <p className="text-lg text-ash-600 dark:text-ash-400">
                No tokens found in your wallet.
              </p>
              <p className="mt-2 text-ash-500 dark:text-ash-500">
                Connect a wallet with Solana tokens to see them displayed here.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
