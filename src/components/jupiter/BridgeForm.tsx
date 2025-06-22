import { useState, useEffect } from 'react';

type BridgeFormProps = {
  slippageBps: number;
};

type Chain = {
  id: string;
  name: string;
  icon: string;
};

const SUPPORTED_CHAINS: Chain[] = [
  { id: 'solana', name: 'Solana', icon: 'solana.svg' },
  { id: 'ethereum', name: 'Ethereum', icon: 'ethereum.svg' },
  { id: 'binance', name: 'Binance Smart Chain', icon: 'binance.svg' },
  { id: 'polygon', name: 'Polygon', icon: 'polygon.svg' },
  { id: 'avalanche', name: 'Avalanche', icon: 'avalanche.svg' },
];

type Token = {
  id: string;
  symbol: string;
  name: string;
  chain: string;
  decimals: number;
  address: string;
};

const SUPPORTED_TOKENS: Token[] = [
  { id: 'usdc', symbol: 'USDC', name: 'USD Coin', chain: 'solana', decimals: 6, address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' },
  { id: 'usdt', symbol: 'USDT', name: 'Tether', chain: 'solana', decimals: 6, address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB' },
  { id: 'weth', symbol: 'WETH', name: 'Wrapped Ethereum', chain: 'ethereum', decimals: 18, address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' },
  { id: 'wbtc', symbol: 'WBTC', name: 'Wrapped Bitcoin', chain: 'ethereum', decimals: 8, address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599' },
];

export function BridgeForm({ slippageBps }: BridgeFormProps) {
  const [fromChain, setFromChain] = useState<Chain>(SUPPORTED_CHAINS[0]);
  const [toChain, setToChain] = useState<Chain>(SUPPORTED_CHAINS[1]);
  const [token, setToken] = useState<Token | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableTokens, setAvailableTokens] = useState<Token[]>([]);

  // Filter available tokens based on selected chain
  useEffect(() => {
    const tokens = SUPPORTED_TOKENS.filter(t => t.chain === fromChain.id);
    setAvailableTokens(tokens);
    setToken(tokens[0] || null);
  }, [fromChain]);

  const handleBridge = async () => {
    if (!token || !amount) return;
    
    setLoading(true);
    try {
      // Here you would integrate with the Jupiter bridge API
      console.log('Bridging', amount, token.symbol, 'from', fromChain.name, 'to', toChain.name);
      console.log('Slippage:', slippageBps / 100, '%');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      alert(`Successfully bridged ${amount} ${token.symbol} from ${fromChain.name} to ${toChain.name}`);
      setAmount('');
    } catch (error) {
      console.error('Bridge error:', error);
      alert('Failed to process bridge transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          From
        </label>
        <div className="flex space-x-2">
          <select
            value={fromChain.id}
            onChange={(e) => setFromChain(SUPPORTED_CHAINS.find(c => c.id === e.target.value) || SUPPORTED_CHAINS[0])}
            className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {SUPPORTED_CHAINS.map((chain) => (
              <option key={chain.id} value={chain.id}>
                {chain.name}
              </option>
            ))}
          </select>
          <div className="w-24">
            <select
              value={token?.id || ''}
              onChange={(e) => setToken(availableTokens.find(t => t.id === e.target.value) || null)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {availableTokens.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.symbol}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button className="p-2 rounded-full bg-gray-200 dark:bg-gray-700">
          ↓
        </button>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          To
        </label>
        <select
          value={toChain.id}
          onChange={(e) => setToChain(SUPPORTED_CHAINS.find(c => c.id === e.target.value) || SUPPORTED_CHAINS[1])}
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          {SUPPORTED_CHAINS.filter(chain => chain.id !== fromChain.id).map((chain) => (
            <option key={chain.id} value={chain.id}>
              {chain.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Amount
        </label>
        <div className="flex rounded-md shadow-sm">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="0.0"
          />
        </div>
        {token && (
          <div className="text-right text-sm text-gray-500 dark:text-gray-400">
            Balance: 0.0 {token.symbol}
          </div>
        )}
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-500 dark:text-gray-400">Estimated Received:</span>
          <span className="font-medium">
            {amount ? `${(parseFloat(amount) * 0.99).toFixed(6)}` : '0.0'}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Bridge Fee:</span>
          <span>1.0%</span>
        </div>
      </div>

      <button
        onClick={handleBridge}
        disabled={loading || !token || !amount}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-md disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Bridge Tokens'}
      </button>
    </div>
  );
}
