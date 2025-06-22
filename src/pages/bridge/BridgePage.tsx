import { useState } from 'react';
import { BridgeForm } from '../../components/jupiter/BridgeForm';

export default function BridgePage() {
  const [slippage, setSlippage] = useState<number>(0.5);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Cross-Chain Bridge</h1>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Bridge Tokens</h2>
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
          <BridgeForm slippageBps={slippage * 100} />
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Bridge History</h2>
          <div className="text-center py-8 text-gray-500">
            Your bridge transactions will appear here
          </div>
        </div>
      </div>
    </div>
  );
}
