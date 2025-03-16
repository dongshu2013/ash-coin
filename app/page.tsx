'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Dashboard from '@/components/Dashboard';
import BurnTokens from '@/components/BurnTokens';
import ClaimAsh from '@/components/ClaimAsh';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Home() {
  const { connected } = useWallet();
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <main className="flex min-h-screen flex-col">
      <Header />

      <div className="flex-grow container mx-auto px-4 py-8">
        {!connected ? (
          <div className="flex flex-col items-center justify-center h-[70vh] text-center">
            <h1 className="text-4xl font-bold mb-6">Welcome to Ash Coin</h1>
            <p className="text-xl mb-8 max-w-2xl">
              Connect your Phantom wallet to view your Solana memecoins, burn them for credits, and
              claim Ash Coin rewards.
            </p>
            <WalletMultiButton className="btn-primary text-lg py-3 px-8" />
          </div>
        ) : (
          <div>
            <div className="flex justify-center mb-8 border-b border-ash-200 dark:border-ash-800">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-6 py-3 font-medium text-lg ${
                  activeTab === 'dashboard'
                    ? 'border-b-2 border-accent text-accent'
                    : 'text-ash-600 dark:text-ash-400'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('burn')}
                className={`px-6 py-3 font-medium text-lg ${
                  activeTab === 'burn'
                    ? 'border-b-2 border-accent text-accent'
                    : 'text-ash-600 dark:text-ash-400'
                }`}
              >
                Burn Tokens
              </button>
              <button
                onClick={() => setActiveTab('claim')}
                className={`px-6 py-3 font-medium text-lg ${
                  activeTab === 'claim'
                    ? 'border-b-2 border-accent text-accent'
                    : 'text-ash-600 dark:text-ash-400'
                }`}
              >
                Claim Ash
              </button>
            </div>

            <div className="mt-6">
              {activeTab === 'dashboard' && <Dashboard />}
              {activeTab === 'burn' && <BurnTokens />}
              {activeTab === 'claim' && <ClaimAsh />}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
