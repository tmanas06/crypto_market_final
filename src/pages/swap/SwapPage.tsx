import { useState } from 'react';
import { SwapForm } from '../../components/jupiter/SwapForm';

export default function SwapPage() {
  const [slippage, setSlippage] = useState<number>(0.5);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Swap Tokens</h1>
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            Slippage Tolerance
          </label>
          <div className="flex space-x-2">
            {[0.1, 0.5, 1].map((value) => (
              <button
                key={value}
                onClick={() => setSlippage(value)}
                className={`px-3 py-1 rounded-md ${
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
        <SwapForm slippageBps={slippage * 100} />
      </div>
    </div>
  );
}
