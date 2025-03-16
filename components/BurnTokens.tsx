'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';

// Mock data for demonstration
const mockTokens = [
  {
    name: 'BONK',
    symbol: 'BONK',
    balance: '1,000,000',
    price: '$0.00002',
    value: '$20.00',
    creditRate: 1.2, // Credits per dollar value
    logo: '🐕',
  },
  {
    name: 'Dogwifhat',
    symbol: 'WIF',
    balance: '500',
    price: '$2.45',
    value: '$1,225.00',
    creditRate: 1.5,
    logo: '🐕',
  },
  {
    name: 'BOOP',
    symbol: 'BOOP',
    balance: '25,000',
    price: '$0.0035',
    value: '$87.50',
    creditRate: 1.3,
    logo: '👾',
  },
  {
    name: 'Popcat',
    symbol: 'POPCAT',
    balance: '7,500',
    price: '$0.0012',
    value: '$9.00',
    creditRate: 1.1,
    logo: '🐱',
  },
];

// Mock burn history
const mockBurnHistory = [
  {
    id: 1,
    date: '2023-12-01',
    token: 'BONK',
    amount: '500,000',
    value: '$10.00',
    credits: '12.00',
  },
  { id: 2, date: '2023-12-05', token: 'WIF', amount: '100', value: '$245.00', credits: '367.50' },
  { id: 3, date: '2023-12-10', token: 'BOOP', amount: '10,000', value: '$35.00', credits: '45.50' },
];

const BurnTokens = () => {
  const { publicKey } = useWallet();
  const [burnHistory, setBurnHistory] = useState(mockBurnHistory);
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [burnAmount, setBurnAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [earnedCredits, setEarnedCredits] = useState('0');

  const handleBurn = () => {
    if (!selectedToken || !burnAmount) return;

    setIsLoading(true);

    // Simulate burning process
    setTimeout(() => {
      const token = mockTokens.find(t => t.symbol === selectedToken);
      if (token) {
        const amount = parseFloat(burnAmount.replace(/,/g, ''));
        const tokenPrice = parseFloat(token.price.replace('$', ''));
        const value = amount * tokenPrice;
        const credits = (value * token.creditRate).toFixed(2);

        // Add to burn history
        const newBurnRecord = {
          id: burnHistory.length + 1,
          date: new Date().toISOString().split('T')[0],
          token: token.symbol,
          amount: amount.toLocaleString(),
          value: `$${value.toFixed(2)}`,
          credits: credits,
        };

        setBurnHistory([newBurnRecord, ...burnHistory]);
        setEarnedCredits(credits);
        setShowSuccess(true);
        setBurnAmount('');
        setSelectedToken(null);
      }

      setIsLoading(false);
    }, 2000);
  };

  if (!publicKey) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-ash-600 dark:text-ash-400">
          Please connect your wallet to burn tokens.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-6">Burn Memecoins for Credits</h2>

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
                <label className="block text-sm font-medium mb-2">Select Token</label>
                <select
                  className="input"
                  value={selectedToken || ''}
                  onChange={e => setSelectedToken(e.target.value)}
                >
                  <option value="">Select a token</option>
                  {mockTokens.map(token => (
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
                          const token = mockTokens.find(t => t.symbol === selectedToken);
                          if (token && burnAmount) {
                            const amount = parseFloat(burnAmount.replace(/,/g, ''));
                            if (!isNaN(amount)) {
                              const tokenPrice = parseFloat(token.price.replace('$', ''));
                              const value = amount * tokenPrice;
                              return (value * token.creditRate).toFixed(2);
                            }
                          }
                          return '0.00';
                        })()}
                      </p>
                      <p className="text-xs text-ash-500 dark:text-ash-400">
                        Rate:{' '}
                        {mockTokens.find(t => t.symbol === selectedToken)?.creditRate.toFixed(1)}x
                        credits per dollar value
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              )}

              <button
                className="btn-primary w-full mt-4"
                disabled={!selectedToken || !burnAmount || isLoading}
                onClick={handleBurn}
              >
                {isLoading ? 'Processing...' : 'Burn Tokens'}
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
    </div>
  );
};

export default BurnTokens;
