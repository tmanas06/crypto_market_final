
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CoinSelectorProps {
  selectedCoin: string;
  onCoinChange: (coin: string) => void;
}

const CoinSelector = ({ selectedCoin, onCoinChange }: CoinSelectorProps) => {
  const popularCoins = [
    { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
    { id: 'binancecoin', name: 'BNB', symbol: 'BNB' },
    { id: 'solana', name: 'Solana', symbol: 'SOL' },
    { id: 'ripple', name: 'XRP', symbol: 'XRP' },
    { id: 'cardano', name: 'Cardano', symbol: 'ADA' },
    { id: 'avalanche-2', name: 'Avalanche', symbol: 'AVAX' },
    { id: 'polygon', name: 'Polygon', symbol: 'MATIC' },
    { id: 'chainlink', name: 'Chainlink', symbol: 'LINK' },
    { id: 'uniswap', name: 'Uniswap', symbol: 'UNI' }
  ];

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium">Select Coin:</label>
      <Select value={selectedCoin} onValueChange={onCoinChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Choose a cryptocurrency" />
        </SelectTrigger>
        <SelectContent>
          {popularCoins.map((coin) => (
            <SelectItem key={coin.id} value={coin.id}>
              <div className="flex items-center gap-2">
                <span className="font-medium">{coin.symbol}</span>
                <span className="text-gray-500">{coin.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CoinSelector;
