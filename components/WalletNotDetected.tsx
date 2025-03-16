'use client';

import React from 'react';

const WalletNotDetected = () => {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 max-w-2xl mx-auto my-8 text-center">
      <h2 className="text-2xl font-bold text-amber-800 mb-4">Phantom Wallet Not Detected</h2>
      <p className="text-amber-700 mb-6">
        To use Ash Coin, you need to have the Phantom wallet extension installed in your browser.
      </p>
      <div className="flex flex-col items-center space-y-4">
        <a
          href="https://phantom.app/download"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          Download Phantom Wallet
        </a>
        <p className="text-sm text-amber-600">
          After installing, refresh this page to connect your wallet.
        </p>
      </div>
    </div>
  );
};

export default WalletNotDetected;
