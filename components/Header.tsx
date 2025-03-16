'use client';

import Image from 'next/image';
import Link from 'next/link';
import CustomWalletButton from './CustomWalletButton';

const Header = () => {
  return (
    <header className="bg-white dark:bg-ash-950 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-light via-accent to-accent-dark flex items-center justify-center">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-light via-accent to-accent-dark">
            Ash Coin
          </span>
        </Link>

        <CustomWalletButton className="btn-primary" />
      </div>
    </header>
  );
};

export default Header;
