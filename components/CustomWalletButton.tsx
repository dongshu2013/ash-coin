'use client';

import { useState, useEffect } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function CustomWalletButton({ className = '' }: { className?: string }) {
  // Use client-side only rendering to avoid hydration mismatch
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder with the same dimensions during server rendering
    return (
      <button
        className={`wallet-adapter-button wallet-adapter-button-trigger ${className}`}
        disabled
      >
        Connect Wallet
      </button>
    );
  }

  return <WalletMultiButton className={className} />;
}
