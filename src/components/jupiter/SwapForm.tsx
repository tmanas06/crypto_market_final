import React, { useEffect, useState } from 'react';
import { TokenInfo, TokenListProvider } from '@solana/spl-token-registry';
import { Jupiter, RouteInfo } from '@jup-ag/core';
import { Connection, PublicKey } from '@solana/web3.js';
// import { useWallet } from '@solana/wallet-adapter-react';

type SwapFormProps = {
  slippageBps: number;
};

export function SwapForm({ slippageBps }: SwapFormProps) {
  const { publicKey, connected } = useWallet();
  const [inputToken, setInputToken] = useState<TokenInfo | null>(null);
  const [outputToken, setOutputToken] = useState<TokenInfo | null>(null);
  const [inputAmount, setInputAmount] = useState('');
  const [outputAmount, setOutputAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [jupiter, setJupiter] = useState<Jupiter | null>(null);
  const [routes, setRoutes] = useState<RouteInfo[]>([]);
  const [tokenList, setTokenList] = useState<TokenInfo[]>([]);

  // Load token list on mount
  useEffect(() => {
    new TokenListProvider()
      .resolve()
      .then(tokens => {
        const list = tokens.filterByClusterSlug('mainnet-beta').getList();
        setTokenList(list);
        // Optionally pre-select popular tokens
        if (list.length > 1) {
          setInputToken(list[0]);
          setOutputToken(list[1]);
        }
      });
  }, []);

  // Initialize Jupiter when wallet connects
  useEffect(() => {
    if (!connected || !publicKey) {
      setJupiter(null);
      return;
    }
    const init = async () => {
      const connection = new Connection('https://api.mainnet-beta.solana.com');
      const jup = await Jupiter.load({
        connection,
        cluster: 'mainnet-beta',
        user: publicKey,
      });
      setJupiter(jup);
    };
    init();
  }, [connected, publicKey]);

  const handleSwap = async () => {
    if (!jupiter || !inputToken || !outputToken || !inputAmount) return;

    setLoading(true);
    try {
      // Convert input amount to smallest units safely
      const amount = BigInt(
        Math.floor(parseFloat(inputAmount) * 10 ** inputToken.decimals)
      );

      const routesResult = await jupiter.computeRoutes({
        inputMint: new PublicKey(inputToken.address),
        outputMint: new PublicKey(outputToken.address),
        amount,
        slippageBps,
      });

      setRoutes(routesResult.routesInfos);

      if (routesResult.routesInfos.length > 0) {
        const bestRoute = routesResult.routesInfos[0];
        setOutputAmount(
          (Number(bestRoute.outAmount) / 10 ** outputToken.decimals).toFixed(6)
        );

        // To execute swap, you would do:
        // const { execute } = await jupiter.exchange({
        //   routeInfo: bestRoute,
        // });
        // await execute();
      } else {
        setOutputAmount('');
      }
    } catch (error) {
      console.error('Error computing routes:', error);
      setOutputAmount('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-md mx-auto">
      <div className="space-y-2">
        <label className="block font-medium">You pay</label>
        <div className="flex rounded-md border">
          <input
            type="number"
            min="0"
            step="any"
            value={inputAmount}
            onChange={e => setInputAmount(e.target.value)}
            className="flex-grow px-3 py-2 rounded-l-md outline-none"
            placeholder="0.0"
          />
          <select
            value={inputToken?.address || ''}
            onChange={e => {
              const selected = tokenList.find(t => t.address === e.target.value);
              setInputToken(selected || null);
            }}
            className="px-3 rounded-r-md bg-gray-100"
          >
            <option value="">Select token</option>
            {tokenList.map(token => (
              <option key={token.address} value={token.address}>
                {token.symbol}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
          onClick={() => {
            // Swap input and output tokens and amounts
            setInputToken(outputToken);
            setOutputToken(inputToken);
            setInputAmount(outputAmount);
            setOutputAmount(inputAmount);
            setRoutes([]);
          }}
        >
          ↓
        </button>
      </div>

      <div className="space-y-2">
        <label className="block font-medium">You receive</label>
        <div className="flex rounded-md border">
          <input
            type="text"
            value={outputAmount}
            readOnly
            className="flex-grow px-3 py-2 rounded-l-md bg-gray-100"
            placeholder="0.0"
          />
          <select
            value={outputToken?.address || ''}
            onChange={e => {
              const selected = tokenList.find(t => t.address === e.target.value);
              setOutputToken(selected || null);
            }}
            className="px-3 rounded-r-md bg-gray-100"
          >
            <option value="">Select token</option>
            {tokenList.map(token => (
              <option key={token.address} value={token.address}>
                {token.symbol}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={handleSwap}
        disabled={
          loading ||
          !connected ||
          !inputToken ||
          !outputToken ||
          !inputAmount ||
          Number(inputAmount) <= 0
        }
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Computing routes...' : 'Get Swap Routes'}
      </button>

      {routes.length > 0 && (
        <div className="mt-4 p-4 border rounded bg-gray-50">
          <h3 className="font-semibold mb-2">Best Route:</h3>
          <div className="text-sm text-gray-700">
            {routes[0].marketInfos.map(m => m.label).join(' → ')}
          </div>
          <div className="mt-1 text-sm">
            Price Impact: {(routes[0].priceImpactPct * 100).toFixed(2)}%
          </div>
        </div>
      )}

      {!connected && (
        <div className="mt-4 text-red-600 font-semibold">
          Please connect your wallet to use Jupiter swap.
        </div>
      )}
    </div>
  );
}
