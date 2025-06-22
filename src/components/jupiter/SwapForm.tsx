import { useState, useEffect } from 'react';
import { TokenInfo } from '@solana/spl-token-registry';
import { Jupiter, RouteInfo } from '@jup-ag/core';
import { Connection, PublicKey } from '@solana/web3.js';

type SwapFormProps = {
  slippageBps: number;
};

export function SwapForm({ slippageBps }: SwapFormProps) {
  const [inputToken, setInputToken] = useState<TokenInfo | null>(null);
  const [outputToken, setOutputToken] = useState<TokenInfo | null>(null);
  const [inputAmount, setInputAmount] = useState('');
  const [outputAmount, setOutputAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [jupiter, setJupiter] = useState<Jupiter | null>(null);
  const [routes, setRoutes] = useState<RouteInfo[]>([]);

  // Initialize Jupiter
  useEffect(() => {
    const init = async () => {
      const connection = new Connection('https://api.mainnet-beta.solana.com');
      const jupiter = await Jupiter.load({
        connection,
        cluster: 'mainnet-beta',
        user: new PublicKey('YOUR_WALLET_PUBLIC_KEY'), // Replace with actual wallet public key
      });
      setJupiter(jupiter);
    };
    init();
  }, []);

  const handleSwap = async () => {
    if (!jupiter || !inputToken || !outputToken || !inputAmount) return;

    setLoading(true);
    try {
      // Get routes for the swap
      const routes = await jupiter.computeRoutes({
        inputMint: new PublicKey(inputToken.address),
        outputMint: new PublicKey(outputToken.address),
        amount: parseFloat(inputAmount) * 10 ** inputToken.decimals,
        slippageBps,
      });

      setRoutes(routes.routesInfos);
      
      if (routes.routesInfos.length > 0) {
        setOutputAmount((routes.routesInfos[0].outAmount / 10 ** outputToken.decimals).toString());
      }
    } catch (error) {
      console.error('Error computing routes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          You pay
        </label>
        <div className="flex rounded-md shadow-sm">
          <input
            type="number"
            value={inputAmount}
            onChange={(e) => setInputAmount(e.target.value)}
            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="0.0"
          />
          <select
            value={inputToken?.symbol || ''}
            onChange={(e) => {
              // Token selection logic here
            }}
            className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-white"
          >
            <option value="">Select token</option>
            {/* Token options will be populated here */}
          </select>
        </div>
      </div>

      <div className="flex justify-center">
        <button className="p-2 rounded-full bg-gray-200 dark:bg-gray-700">
          ↓
        </button>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          You receive
        </label>
        <div className="flex rounded-md shadow-sm">
          <input
            type="text"
            value={outputAmount}
            readOnly
            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="0.0"
          />
          <select
            value={outputToken?.symbol || ''}
            onChange={(e) => {
              // Token selection logic here
            }}
            className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-white"
          >
            <option value="">Select token</option>
            {/* Token options will be populated here */}
          </select>
        </div>
      </div>

      <button
        onClick={handleSwap}
        disabled={loading || !inputToken || !outputToken || !inputAmount}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {loading ? 'Swapping...' : 'Swap'}
      </button>

      {routes.length > 0 && (
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded">
          <h3 className="font-medium mb-2">Best Route:</h3>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {routes[0].marketInfos
              .map((market) => market.label)
              .join(' → ')}
          </div>
          <div className="mt-2 text-sm">
            Price Impact: {routes[0].priceImpactPct.toFixed(2)}%
          </div>
        </div>
      )}
    </div>
  );
}
