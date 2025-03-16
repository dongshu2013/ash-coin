'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';
import { getCurrentBlockHeight } from '@/utils/api';

// Mock claim history
const mockClaimHistory = [
  {
    id: 1,
    date: '2023-11-15',
    blockRange: '1000000-1010000',
    credits: '425.50',
    ashAmount: '85.10',
  },
  {
    id: 2,
    date: '2023-11-25',
    blockRange: '1010001-1020000',
    credits: '312.75',
    ashAmount: '62.55',
  },
  {
    id: 3,
    date: '2023-12-05',
    blockRange: '1020001-1030000',
    credits: '578.25',
    ashAmount: '115.65',
  },
];

const ClaimAsh = () => {
  const { publicKey } = useWallet();
  const [claimHistory, setClaimHistory] = useState(mockClaimHistory);
  const [currentBlock, setCurrentBlock] = useState(1040000);
  const [nextClaimBlock, setNextClaimBlock] = useState(1050000);
  const [creditBalance, setCreditBalance] = useState('250.75');
  const [ashBalance, setAshBalance] = useState('263.30');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [claimedAmount, setClaimedAmount] = useState('0');
  const [blockProgress, setBlockProgress] = useState(0);

  // Function to fetch actual block height
  const fetchCurrentBlockHeight = async () => {
    try {
      const blockHeight = await getCurrentBlockHeight();
      setCurrentBlock(blockHeight);
      // Calculate progress based on actual block height
      const progress = ((blockHeight - 1040000) / 10000) * 100;
      setBlockProgress(Math.min(progress, 99.9));
    } catch (error) {
      console.error('Error fetching block height:', error);
    }
  };

  useEffect(() => {
    // Initial fetch of block height
    fetchCurrentBlockHeight();

    // Increment block every 0.4 seconds
    const blockIncrementInterval = setInterval(() => {
      setCurrentBlock(prev => {
        const newBlock = prev + 1;
        const progress = ((newBlock - 1040000) / 10000) * 100;
        setBlockProgress(Math.min(progress, 99.9));
        return newBlock;
      });
    }, 400); // 0.4 seconds

    // Refresh actual block height every 5 minutes
    const refreshInterval = setInterval(
      () => {
        fetchCurrentBlockHeight();
      },
      5 * 60 * 1000
    ); // 5 minutes

    return () => {
      clearInterval(blockIncrementInterval);
      clearInterval(refreshInterval);
    };
  }, []);

  const handleClaim = () => {
    if (currentBlock < nextClaimBlock) return;

    setIsLoading(true);

    // Simulate claiming process
    setTimeout(() => {
      const ashAmount = (parseFloat(creditBalance) * 0.2).toFixed(2);

      // Add to claim history
      const newClaimRecord = {
        id: claimHistory.length + 1,
        date: new Date().toISOString().split('T')[0],
        blockRange: `${nextClaimBlock - 10000}-${nextClaimBlock}`,
        credits: creditBalance,
        ashAmount: ashAmount,
      };

      setClaimHistory([newClaimRecord, ...claimHistory]);
      setClaimedAmount(ashAmount);
      setAshBalance((parseFloat(ashBalance) + parseFloat(ashAmount)).toFixed(2));
      setCreditBalance('0.00');
      setNextClaimBlock(nextClaimBlock + 10000);
      setBlockProgress(0);
      setShowSuccess(true);

      setIsLoading(false);
    }, 2000);
  };

  if (!publicKey) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-ash-600 dark:text-ash-400">
          Please connect your wallet to claim Ash Coin.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-6">Claim Ash Coin</h2>

          {showSuccess ? (
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
                <button onClick={() => setShowSuccess(false)} className="btn-primary">
                  Continue
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="card mb-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Current Block</h3>
                  <p className="text-2xl font-bold">{currentBlock.toLocaleString()}</p>
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

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-ash-100 dark:bg-ash-800 rounded-lg">
                  <h3 className="text-sm font-medium mb-1 text-ash-500 dark:text-ash-400">
                    Credit Balance
                  </h3>
                  <p className="text-xl font-bold">{creditBalance}</p>
                </div>
                <div className="p-4 bg-ash-100 dark:bg-ash-800 rounded-lg">
                  <h3 className="text-sm font-medium mb-1 text-ash-500 dark:text-ash-400">
                    ASH Balance
                  </h3>
                  <p className="text-xl font-bold">{ashBalance}</p>
                </div>
              </div>

              <button
                className={`w-full py-3 rounded-lg font-medium ${
                  currentBlock >= nextClaimBlock
                    ? 'btn-primary'
                    : 'bg-ash-200 text-ash-500 cursor-not-allowed'
                }`}
                disabled={currentBlock < nextClaimBlock || isLoading}
                onClick={handleClaim}
              >
                {isLoading
                  ? 'Processing...'
                  : currentBlock >= nextClaimBlock
                    ? 'Claim ASH Coin'
                    : `Wait for block ${nextClaimBlock.toLocaleString()}`}
              </button>

              {currentBlock < nextClaimBlock && (
                <p className="text-sm text-ash-500 dark:text-ash-400 text-center mt-3">
                  Claims are available every 10,000 blocks
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
    </div>
  );
};

export default ClaimAsh;
