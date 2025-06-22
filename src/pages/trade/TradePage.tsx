import { useState } from 'react';
import { TradeInterface } from '../../components/jupiter/TradeInterface';

export default function TradePage() {
  const [view, setView] = useState<'swap' | 'limit' | 'market'>('swap');

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Trade</h1>
      
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setView('swap')}
          className={`px-4 py-2 rounded-md ${
            view === 'swap' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
          }`}
        >
          Swap
        </button>
        <button
          onClick={() => setView('limit')}
          className={`px-4 py-2 rounded-md ${
            view === 'limit'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
          }`}
        >
          Limit Order
        </button>
        <button
          onClick={() => setView('market')}
          className={`px-4 py-2 rounded-md ${
            view === 'market'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
          }`}
        >
          Market Order
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TradeInterface view={view} />
        </div>
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-4">Order Book</h2>
            {/* Order book component will go here */}
            <div className="text-gray-500 text-center py-8">
              Order book data will appear here
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
