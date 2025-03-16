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
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-ash-100 dark:bg-ash-800 flex items-center justify-center text-xl mr-3">
            {token.logo}
          </div>
          <div>
            <h3 className="font-bold">{token.name}</h3>
            <p className="text-sm text-ash-500 dark:text-ash-400">{token.symbol}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-medium">{token.price}</p>
          <p className={`text-sm ${isPositiveChange ? 'text-green-500' : 'text-red-500'}`}>
            {token.change}
          </p>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-ash-500 dark:text-ash-400">Balance</p>
          <p className="font-medium">{token.balance}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-ash-500 dark:text-ash-400">Value</p>
          <p className="font-medium">{token.value}</p>
        </div>
      </div>
    </div>
  );
};

export default TokenCard; 