import { useState } from 'react';
import { SwapForm } from './SwapForm';

type TradeView = 'swap' | 'limit' | 'market';

type TradeInterfaceProps = {
  view: TradeView;
};

export function TradeInterface({ view }: TradeInterfaceProps) {
  const [slippage, setSlippage] = useState<number>(0.5);

  const renderForm = () => {
    switch (view) {
      case 'swap':
        return <SwapForm slippageBps={slippage * 100} />;
      case 'limit':
        return (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
            <p className="text-yellow-700 dark:text-yellow-400">
              Limit order functionality is coming soon!
            </p>
          </div>
        );
      case 'market':
        return (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <p className="text-blue-700 dark:text-blue-400">
              Market order functionality is coming soon!
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">
            {view === 'swap' ? 'Swap' : view === 'limit' ? 'Limit Order' : 'Market Order'}
          </h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Slippage:</span>
            <div className="flex space-x-1">
              {[0.1, 0.5, 1].map((value) => (
                <button
                  key={value}
                  onClick={() => setSlippage(value)}
                  className={`px-2 py-1 text-xs rounded ${
                    slippage === value
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  {value}%
                </button>
              ))}
            </div>
          </div>
        </div>
        {renderForm()}
      </div>
    </div>
  );
}
