'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import Dashboard from '@/components/Dashboard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WalletNotDetected from '@/components/WalletNotDetected';
import CustomWalletButton from '@/components/CustomWalletButton';

export default function Home() {
  const { connected } = useWallet();
  const [isPhantomInstalled, setIsPhantomInstalled] = useState(true);

  useEffect(() => {
    // Check if Phantom wallet is installed
    const checkPhantomWallet = () => {
      // @ts-ignore - window.phantom is injected by the Phantom wallet extension
      const phantom = window?.phantom?.solana;
      setIsPhantomInstalled(!!phantom);
    };

    checkPhantomWallet();
  }, []);

  return (
    <main className="flex min-h-screen flex-col">
      <Header />

      <div className="flex-grow container mx-auto px-4 py-8">
        {!isPhantomInstalled ? (
          <WalletNotDetected />
        ) : !connected ? (
          <div className="flex flex-col items-center justify-center h-[70vh] text-center">
            <h1 className="text-4xl font-bold mb-6">Welcome to Ash Coin</h1>
            <p className="text-xl mb-8 max-w-2xl">
              Connect your Phantom wallet to view your Solana memecoins, burn them for credits, and
              claim Ash Coin rewards.
            </p>
            <CustomWalletButton className="btn-primary text-lg py-3 px-8" />
          </div>
        ) : (
          <Dashboard />
        )}
      </div>

      <Footer />
    </main>
  );
}
