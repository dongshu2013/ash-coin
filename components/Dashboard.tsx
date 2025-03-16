'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import TokenCard from './TokenCard';
import { motion } from 'framer-motion';
import { getTokensByOwner, getTokenMarketData, getCurrentBlockHeight } from '@/utils/helius';

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

// Define the burn record type
interface BurnRecord {
  id: number;
  date: string;
  token: string;
  amount: string;
  value: string;
  credits: string;
  blockNumber: string;
  txHash: string;
}

// Define the claim record type
interface ClaimRecord {
  id: number;
  date: string;
  blockRange: string;
  credits: string;
  ashAmount: string;
}

// Remove mock burn history and replace with empty array
const mockBurnHistory: BurnRecord[] = [];

const Dashboard = () => {
  const { publicKey } = useWallet();
  const [assets, setAssets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalValue, setTotalValue] = useState('0');
  const [creditBalance, setCreditBalance] = useState('0');
  const [ashBalance, setAshBalance] = useState('0');
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeView, setActiveView] = useState<'tokens' | 'burn' | 'claim'>('burn');

  // Burn token states
  const [burnHistory, setBurnHistory] = useState(mockBurnHistory);
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [burnAmount, setBurnAmount] = useState('');
  const [isBurning, setIsBurning] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [earnedCredits, setEarnedCredits] = useState('0');

  // Claim states
  const [claimHistory, setClaimHistory] = useState<ClaimRecord[]>([]);
  const [currentBlock, setCurrentBlock] = useState(1040000);
  const [nextClaimBlock, setNextClaimBlock] = useState(1050000);
  const [blockProgress, setBlockProgress] = useState(0);
  const [isClaiming, setIsClaiming] = useState(false);
  const [showClaimSuccess, setShowClaimSuccess] = useState(false);
  const [claimedAmount, setClaimedAmount] = useState('0');
  const [isLoadingBlock, setIsLoadingBlock] = useState(false);

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
            rawPrice: asset.price,
            rawBalance: asset.uiAmount,
            isNft: asset.isNft,
            hasPrice: asset.hasPrice,
            creditRate: 1.2 + Math.random() * 0.5, // Mock credit rate between 1.2 and 1.7
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

  // Function to fetch the current block height and calculate next claim block
  const fetchCurrentBlock = async () => {
    setIsLoadingBlock(true);
    try {
      const blockHeight = await getCurrentBlockHeight();
      setCurrentBlock(blockHeight);

      // Calculate next claim block (next multiple of 10,000)
      const nextMultiple = Math.ceil(blockHeight / 10000) * 10000;
      setNextClaimBlock(nextMultiple);

      // Calculate progress to next claim
      const progress = ((blockHeight % 10000) / 10000) * 100;
      setBlockProgress(progress);

      console.log(
        `Current block: ${blockHeight}, Next claim: ${nextMultiple}, Progress: ${progress.toFixed(1)}%`
      );
    } catch (error) {
      console.error('Error fetching current block:', error);
    } finally {
      setIsLoadingBlock(false);
    }
  };

  useEffect(() => {
    fetchAssets();

    // Fetch current block on initial load
    fetchCurrentBlock();

    // Periodically update the block height (every 30 seconds)
    const blockInterval = setInterval(() => {
      fetchCurrentBlock();
    }, 30000);

    return () => {
      clearInterval(blockInterval);
    };
  }, [publicKey]);

  // Handle manual refresh
  const handleRefresh = () => {
    fetchAssets(true);
    fetchCurrentBlock();
  };

  // Handle burn token
  const handleBurn = () => {
    if (!selectedToken || !burnAmount) return;

    setIsBurning(true);

    // Simulate burning process
    setTimeout(() => {
      const token = assets.find(t => t.symbol === selectedToken);
      if (token) {
        const amount = parseFloat(burnAmount.replace(/,/g, ''));
        const value = amount * token.rawPrice;
        const credits = (value * token.creditRate).toFixed(2);

        // Generate mock block number and transaction hash
        const blockNumber = Math.floor(1000000 + Math.random() * 500000);
        const txHash =
          '0x' +
          Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

        // Add to burn history
        const newBurnRecord = {
          id: burnHistory.length + 1,
          date: new Date().toISOString().split('T')[0],
          token: token.symbol,
          amount: amount.toLocaleString(),
          value: `$${value.toFixed(2)}`,
          credits: credits,
          blockNumber: blockNumber.toString(),
          txHash: txHash,
        };

        setBurnHistory([newBurnRecord, ...burnHistory]);
        setEarnedCredits(credits);
        setShowSuccess(true);
        setBurnAmount('');
        setSelectedToken(null);

        // Update credit balance
        setCreditBalance((parseFloat(creditBalance) + parseFloat(credits)).toFixed(2));
      }

      setIsBurning(false);
    }, 2000);
  };

  // Handle claim ash
  const handleClaim = () => {
    if (currentBlock < nextClaimBlock) return;

    setIsClaiming(true);

    // Simulate claiming process
    setTimeout(() => {
      const ashAmount = (parseFloat(creditBalance) * 0.2).toFixed(2);

      // Generate mock block range
      const blockRange = `${nextClaimBlock - 10000}-${nextClaimBlock}`;

      // Add to claim history
      const newClaimRecord = {
        id: claimHistory.length + 1,
        date: new Date().toISOString().split('T')[0],
        blockRange: blockRange,
        credits: creditBalance,
        ashAmount: ashAmount,
      };

      setClaimHistory([newClaimRecord, ...claimHistory]);
      setClaimedAmount(ashAmount);
      setAshBalance((parseFloat(ashBalance) + parseFloat(ashAmount)).toFixed(2));
      setCreditBalance('0.00');
      setNextClaimBlock(nextClaimBlock + 10000);
      setBlockProgress(0);
      setShowClaimSuccess(true);

      setIsClaiming(false);
    }, 2000);
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
          <h2 className="text-xl font-semibold mb-2">Ash Balance</h2>
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
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveView('burn')}
            className={`px-4 py-2 font-medium rounded-md transition-colors ${
              activeView === 'burn'
                ? 'bg-accent text-white'
                : 'bg-ash-100 text-ash-700 hover:bg-ash-200 dark:bg-ash-800 dark:text-ash-300 dark:hover:bg-ash-700'
            }`}
          >
            Burn Tokens
          </button>
          <button
            onClick={() => setActiveView('claim')}
            className={`px-4 py-2 font-medium rounded-md transition-colors ${
              activeView === 'claim'
                ? 'bg-accent text-white'
                : 'bg-ash-100 text-ash-700 hover:bg-ash-200 dark:bg-ash-800 dark:text-ash-300 dark:hover:bg-ash-700'
            }`}
          >
            Claim Ash
          </button>
          <button
            onClick={() => setActiveView('tokens')}
            className={`px-4 py-2 font-medium rounded-md transition-colors ${
              activeView === 'tokens'
                ? 'bg-accent text-white'
                : 'bg-ash-100 text-ash-700 hover:bg-ash-200 dark:bg-ash-800 dark:text-ash-300 dark:hover:bg-ash-700'
            }`}
          >
            Your Tokens
          </button>
        </div>

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

      {activeView === 'burn' ? (
        // Burn Tokens View
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-6">Burn Tokens for Credits</h2>

            {showSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 mb-6"
              >
                <div className="flex items-center justify-center flex-col text-center py-4">
                  <div className="text-5xl mb-4">🔥</div>
                  <h3 className="text-xl font-bold mb-2">Burn Successful!</h3>
                  <p className="mb-4">
                    You earned <span className="font-bold">{earnedCredits}</span> credits
                  </p>
                  <button onClick={() => setShowSuccess(false)} className="btn-primary">
                    Burn More Tokens
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="card mb-6">
                <div className="mb-4">
                  <select
                    className="input"
                    value={selectedToken || ''}
                    onChange={e => setSelectedToken(e.target.value)}
                    disabled={isLoading || assets.length === 0}
                  >
                    <option value="">Select a token to burn</option>
                    {assets.map(token => (
                      <option key={token.symbol} value={token.symbol}>
                        {token.name} ({token.symbol}) - Balance: {token.balance}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedToken && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-4"
                  >
                    <label className="block text-sm font-medium mb-2">Amount to Burn</label>
                    <input
                      type="text"
                      className="input"
                      value={burnAmount}
                      onChange={e => setBurnAmount(e.target.value)}
                      placeholder="Enter amount"
                    />

                    {burnAmount && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4 p-3 bg-ash-100 dark:bg-ash-800 rounded-lg"
                      >
                        <p className="text-sm mb-1">
                          <span className="text-ash-500 dark:text-ash-400">Estimated Credits:</span>{' '}
                          {(() => {
                            const token = assets.find(t => t.symbol === selectedToken);
                            if (token && burnAmount) {
                              const amount = parseFloat(burnAmount.replace(/,/g, ''));
                              if (!isNaN(amount)) {
                                const value = amount * token.rawPrice;
                                return (value * token.creditRate).toFixed(2);
                              }
                            }
                            return '0.00';
                          })()}
                        </p>
                        <p className="text-xs text-ash-500 dark:text-ash-400">
                          Rate:{' '}
                          {assets.find(t => t.symbol === selectedToken)?.creditRate.toFixed(1)}x
                          credits per dollar value
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                <button
                  className="btn-primary w-full mt-4"
                  disabled={!selectedToken || !burnAmount || isBurning || isLoading}
                  onClick={handleBurn}
                >
                  {isBurning ? 'Processing...' : 'Burn Tokens'}
                </button>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-6">Burn History</h2>

            {burnHistory.length === 0 ? (
              <div className="card text-center py-8">
                <p className="text-ash-500 dark:text-ash-400">No burn history yet</p>
              </div>
            ) : (
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-ash-200 dark:border-ash-700">
                        <th className="text-left py-3 px-4 font-semibold">Date</th>
                        <th className="text-left py-3 px-4 font-semibold">Block</th>
                        <th className="text-left py-3 px-4 font-semibold">Token</th>
                        <th className="text-right py-3 px-4 font-semibold">Amount</th>
                        <th className="text-right py-3 px-4 font-semibold">Value</th>
                        <th className="text-right py-3 px-4 font-semibold">Credits</th>
                      </tr>
                    </thead>
                    <tbody>
                      {burnHistory.map(record => (
                        <tr
                          key={record.id}
                          className="border-b border-ash-100 dark:border-ash-800 hover:bg-ash-50 dark:hover:bg-ash-900/50"
                        >
                          <td className="py-3 px-4">{record.date}</td>
                          <td className="py-3 px-4">
                            <div>{record.blockNumber}</div>
                            <div
                              className="text-xs text-ash-500 truncate max-w-[120px]"
                              title={record.txHash}
                            >
                              {record.txHash}
                            </div>
                          </td>
                          <td className="py-3 px-4">{record.token}</td>
                          <td className="py-3 px-4 text-right">{record.amount}</td>
                          <td className="py-3 px-4 text-right">{record.value}</td>
                          <td className="py-3 px-4 text-right font-medium">{record.credits}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : activeView === 'claim' ? (
        // Claim Ash View
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-6">Claim Ash</h2>

            {showClaimSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card bg-accent-light/10 border border-accent-light/30 mb-6"
              >
                <div className="flex items-center justify-center flex-col text-center py-4">
                  <div className="text-5xl mb-4">✨</div>
                  <h3 className="text-xl font-bold mb-2">Claim Successful!</h3>
                  <p className="mb-4">
                    You claimed <span className="font-bold">{claimedAmount}</span> ASH
                  </p>
                  <button onClick={() => setShowClaimSuccess(false)} className="btn-primary">
                    Continue
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="card mb-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Current Block</h3>
                    <p className="text-2xl font-bold">
                      {isLoadingBlock ? (
                        <span className="text-ash-400">Loading...</span>
                      ) : (
                        currentBlock.toLocaleString()
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <h3 className="text-lg font-semibold mb-1">Next Claim</h3>
                    <p className="text-2xl font-bold">{nextClaimBlock.toLocaleString()}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress to next claim</span>
                    <span>{Math.min(Math.round(blockProgress), 100)}%</span>
                  </div>
                  <div className="w-full bg-ash-200 dark:bg-ash-800 rounded-full h-2.5">
                    <div
                      className="bg-accent h-2.5 rounded-full"
                      style={{ width: `${blockProgress}%` }}
                    ></div>
                  </div>
                </div>

                <button
                  className={`w-full py-3 rounded-lg font-medium ${
                    currentBlock >= nextClaimBlock
                      ? 'btn-primary'
                      : 'bg-ash-200 text-ash-500 cursor-not-allowed'
                  }`}
                  disabled={
                    currentBlock < nextClaimBlock || isClaiming || parseFloat(creditBalance) <= 0
                  }
                  onClick={handleClaim}
                >
                  {isClaiming
                    ? 'Processing...'
                    : currentBlock >= nextClaimBlock
                      ? 'Claim ASH'
                      : `Wait for block ${nextClaimBlock.toLocaleString()}`}
                </button>

                {currentBlock < nextClaimBlock && (
                  <p className="text-sm text-ash-500 dark:text-ash-400 text-center mt-3">
                    Claims are available every 10,000 blocks
                  </p>
                )}

                {parseFloat(creditBalance) <= 0 && (
                  <p className="text-sm text-ash-500 dark:text-ash-400 text-center mt-3">
                    You need credits to claim ASH. Burn tokens to earn credits.
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-6">Claim History</h2>

            {claimHistory.length === 0 ? (
              <div className="card text-center py-8">
                <p className="text-ash-500 dark:text-ash-400">No claim history yet</p>
              </div>
            ) : (
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-ash-200 dark:border-ash-700">
                        <th className="text-left py-3 px-4 font-semibold">Date</th>
                        <th className="text-left py-3 px-4 font-semibold">Block Range</th>
                        <th className="text-right py-3 px-4 font-semibold">Credits</th>
                        <th className="text-right py-3 px-4 font-semibold">ASH</th>
                      </tr>
                    </thead>
                    <tbody>
                      {claimHistory.map(record => (
                        <tr
                          key={record.id}
                          className="border-b border-ash-100 dark:border-ash-800 hover:bg-ash-50 dark:hover:bg-ash-900/50"
                        >
                          <td className="py-3 px-4">{record.date}</td>
                          <td className="py-3 px-4">{record.blockRange}</td>
                          <td className="py-3 px-4 text-right">{record.credits}</td>
                          <td className="py-3 px-4 text-right font-medium">{record.ashAmount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : // Tokens View
      isLoading ? (
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
