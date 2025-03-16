'use client';

import React from 'react';
import WalletContextProvider from './WalletContextProvider';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return <WalletContextProvider>{children}</WalletContextProvider>;
}
