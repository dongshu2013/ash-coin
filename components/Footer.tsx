'use client';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-ash-950 border-t border-ash-200 dark:border-ash-800">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center">
          <p className="text-ash-600 dark:text-ash-400">
            © {new Date().getFullYear()} Ash Coin. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
