
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

// Fallback data for when API is unavailable
const fallbackMemeCoins: MemeCoin[] = [
  {
    id: 'dogecoin',
    name: 'Dogecoin',
    symbol: 'doge',
    image: 'https://coin-images.coingecko.com/coins/images/5/large/dogecoin.png',
    current_price: 0.17,
    price_change_percentage_24h: -0.16,
    market_cap: 25481819178,
    market_cap_rank: 9
  },
  {
    id: 'shiba-inu',
    name: 'Shiba Inu',
    symbol: 'shib',
    image: 'https://coin-images.coingecko.com/coins/images/11939/large/shiba.png',
    current_price: 0.000023,
    price_change_percentage_24h: 2.45,
    market_cap: 13500000000,
    market_cap_rank: 12
  },
  {
    id: 'pepe',
    name: 'Pepe',
    symbol: 'pepe',
    image: 'https://coin-images.coingecko.com/coins/images/29850/large/pepe-token.jpeg',
    current_price: 0.000018,
    price_change_percentage_24h: 5.67,
    market_cap: 7500000000,
    market_cap_rank: 18
  },
  {
    id: 'floki',
    name: 'FLOKI',
    symbol: 'floki',
    image: 'https://coin-images.coingecko.com/coins/images/16746/large/PNG_image.png',
    current_price: 0.00015,
    price_change_percentage_24h: -1.23,
    market_cap: 1400000000,
    market_cap_rank: 56
  },
  {
    id: 'bonk',
    name: 'Bonk',
    symbol: 'bonk',
    image: 'https://coin-images.coingecko.com/coins/images/28600/large/bonk.jpg',
    current_price: 0.000034,
    price_change_percentage_24h: 3.89,
    market_cap: 2300000000,
    market_cap_rank: 42
  },
  {
    id: 'dogwifcoin',
    name: 'dogwifhat',
    symbol: 'wif',
    image: 'https://coin-images.coingecko.com/coins/images/33566/large/dogwifhat.jpg',
    current_price: 2.45,
    price_change_percentage_24h: -2.1,
    market_cap: 2400000000,
    market_cap_rank: 41
  }
];

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
  
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${memeCoinIds.join(',')}&order=market_cap_desc&per_page=10&page=1&sparkline=false`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch meme coins data');
    }
    
    return response.json();
  } catch (error) {
    console.warn('API fetch failed, using fallback data:', error);
    // Return fallback data when API fails
    return fallbackMemeCoins;
  }
};

const MemeCoins = () => {
  const [usingFallback, setUsingFallback] = useState(false);

  const { data: memeCoins, isLoading, error } = useQuery({
    queryKey: ['memeCoins'],
    queryFn: async () => {
      try {
        const data = await fetchMemeCoins();
        setUsingFallback(data === fallbackMemeCoins);
        return data;
      } catch (err) {
        setUsingFallback(true);
        return fallbackMemeCoins;
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: false, // Don't retry failed requests, use fallback instead
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

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">🚀 Meme Coins Dashboard</h1>
            <p className="text-muted-foreground">Track the hottest meme cryptocurrencies</p>
            {usingFallback && (
              <p className="text-yellow-600 text-sm mt-1">
                ⚠️ Using sample data - Live data temporarily unavailable
              </p>
            )}
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
                    onError={(e) => {
                      // Fallback to a placeholder if image fails to load
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40x40/f0f0f0/666666?text=' + coin.symbol.toUpperCase();
                    }}
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
          {usingFallback && (
            <p className="text-yellow-600 mt-2">
              Currently showing sample data. Live data will be restored when API is available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemeCoins;
