'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey } from '@solana/web3.js';
import TokenCard from './TokenCard';
import { motion } from 'framer-motion';

// Mock data for demonstration
const mockTokens = [
  { 
    name: 'BONK', 
    symbol: 'BONK', 
    balance: '1,000,000', 
    price: '$0.00002', 
    value: '$20.00',
    change: '+5.2%',
    logo: '🐕'
  },
  { 
    name: 'Dogwifhat', 
    symbol: 'WIF', 
    balance: '500', 
    price: '$2.45', 
    value: '$1,225.00',
    change: '+12.3%',
    logo: '🐕'
  },
  { 
    name: 'BOOP', 
    symbol: 'BOOP', 
    balance: '25,000', 
    price: '$0.0035', 
    value: '$87.50',
    change: '-2.1%',
    logo: '👾'
  },
  { 
    name: 'Popcat', 
    symbol: 'POPCAT', 
    balance: '7,500', 
    price: '$0.0012', 
    value: '$9.00',
    change: '+1.7%',
    logo: '🐱'
  },
];

const Dashboard = () => {
  const { publicKey } = useWallet();
  const [tokens, setTokens] = useState(mockTokens);
  const [isLoading, setIsLoading] = useState(true);
  const [totalValue, setTotalValue] = useState('0');
  const [creditBalance, setCreditBalance] = useState('0');

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Calculate total value
      const total = tokens.reduce((acc, token) => {
        return acc + parseFloat(token.value.replace('$', '').replace(',', ''));
      }, 0);
      setTotalValue(total.toFixed(2));
      setCreditBalance('250.75');
    }, 1500);

    return () => clearTimeout(timer);
  }, [tokens]);

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card"
        >
          <h2 className="text-xl font-semibold mb-2">Total Memecoin Value</h2>
          <div className="flex items-end">
            <p className="text-3xl font-bold">${isLoading ? '...' : totalValue}</p>
            <p className="text-sm text-ash-500 dark:text-ash-400 ml-2 mb-1">USD</p>
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
      </div>

      <h2 className="text-2xl font-bold mb-4">Your Memecoins</h2>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-6 bg-ash-200 dark:bg-ash-800 rounded w-1/3 mb-4"></div>
              <div className="h-8 bg-ash-200 dark:bg-ash-800 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-ash-200 dark:bg-ash-800 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tokens.map((token, index) => (
            <motion.div
              key={token.symbol}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <TokenCard token={token} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard; 