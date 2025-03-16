'use client';

import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-ash-950 border-t border-ash-200 dark:border-ash-800">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-ash-600 dark:text-ash-400">
              © {new Date().getFullYear()} Ash Coin. All rights reserved.
            </p>
          </div>
          <div className="flex space-x-6">
            <Link href="#" className="text-ash-600 dark:text-ash-400 hover:text-accent-DEFAULT dark:hover:text-accent-DEFAULT transition-colors">
              Terms
            </Link>
            <Link href="#" className="text-ash-600 dark:text-ash-400 hover:text-accent-DEFAULT dark:hover:text-accent-DEFAULT transition-colors">
              Privacy
            </Link>
            <Link href="#" className="text-ash-600 dark:text-ash-400 hover:text-accent-DEFAULT dark:hover:text-accent-DEFAULT transition-colors">
              Docs
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 