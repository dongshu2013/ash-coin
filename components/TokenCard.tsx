'use client';

interface TokenProps {
  token: {
    name: string;
    symbol: string;
    balance: string;
    price: string;
    value: string;
    change: string;
    logo: string;
  };
}

const TokenCard = ({ token }: TokenProps) => {
  const isPositiveChange = token.change.startsWith('+');

  return (
    <div className="card hover:shadow-lg transition-shadow p-5">
      {/* Token Header with Logo and Name */}
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 rounded-full bg-ash-100 dark:bg-ash-800 flex items-center justify-center text-2xl mr-4 shadow-sm">
          {token.logo}
        </div>
        <div>
          <h3 className="font-bold text-lg">{token.name}</h3>
          <p className="text-sm text-ash-500 dark:text-ash-400">{token.symbol}</p>
        </div>
      </div>

      {/* Token Details */}
      <div className="grid grid-cols-2 gap-4">
        {/* Left Column */}
        <div>
          <p className="text-sm text-ash-500 dark:text-ash-400 mb-1">Balance</p>
          <p className="font-medium text-lg">{token.balance}</p>
        </div>

        {/* Right Column */}
        <div className="text-right">
          <p className="text-sm text-ash-500 dark:text-ash-400 mb-1">Total Value</p>
          <p className="font-medium text-lg">{token.value}</p>
        </div>

        {/* Price Row - Full Width */}
        <div className="col-span-2 mt-2 pt-3 border-t border-ash-100 dark:border-ash-800">
          <div className="flex justify-between items-center">
            <p className="text-sm text-ash-500 dark:text-ash-400">Price per token</p>
            <div className="flex items-center">
              <p className="font-medium mr-2">{token.price}</p>
              <p
                className={`text-sm px-2 py-1 rounded-full ${isPositiveChange ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'}`}
              >
                {token.change}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenCard;
