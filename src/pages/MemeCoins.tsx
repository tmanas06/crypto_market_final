
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import WalletConnect from '@/components/WalletConnect';

interface MemeCoin {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  market_cap_rank: number;
}

const fetchMemeCoins = async (): Promise<MemeCoin[]> => {
  // Popular meme coin IDs
  const memeCoinIds = [
    'dogecoin',
    'shiba-inu',
    'pepe',
    'floki',
    'bonk',
    'dogwifcoin',
    'memecoin-2',
    'baby-doge-coin',
    'dogelon-mars',
    'samoyedcoin'
  ];
  
  const response = await fetch(
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${memeCoinIds.join(',')}&order=market_cap_desc&per_page=10&page=1&sparkline=false`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch meme coins data');
  }
  
  return response.json();
};

const MemeCoins = () => {
  const { data: memeCoins, isLoading, error } = useQuery({
    queryKey: ['memeCoins'],
    queryFn: fetchMemeCoins,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Meme Coins</h1>
            <p className="text-gray-600">Failed to fetch meme coin data. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">🚀 Meme Coins Dashboard</h1>
            <p className="text-muted-foreground">Track the hottest meme cryptocurrencies</p>
          </div>
          <WalletConnect />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {memeCoins?.map((coin) => (
            <Card key={coin.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                <div className="flex items-center gap-3 flex-1">
                  <img 
                    src={coin.image} 
                    alt={coin.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <CardTitle className="text-lg">{coin.name}</CardTitle>
                    <CardDescription className="font-mono">
                      {coin.symbol.toUpperCase()}
                    </CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">
                    Rank #{coin.market_cap_rank}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Price</span>
                    <span className="font-semibold text-lg">
                      ${coin.current_price.toFixed(coin.current_price < 1 ? 6 : 2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">24h Change</span>
                    <div className={`flex items-center gap-1 ${
                      coin.price_change_percentage_24h >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {coin.price_change_percentage_24h >= 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      <span className="font-medium">
                        {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Market Cap</span>
                    <span className="font-medium">
                      ${(coin.market_cap / 1e9).toFixed(2)}B
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>⚠️ Meme coins are highly volatile and speculative. Invest at your own risk!</p>
          <p>Data updates every 30 seconds</p>
        </div>
      </div>
    </div>
  );
};

export default MemeCoins;
