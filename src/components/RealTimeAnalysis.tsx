
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, MinusIcon, XCircle, RefreshCw } from 'lucide-react';

interface CryptoData {
  id: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  image: string;
}

interface AnalysisResult {
  coin: string;
  name: string;
  price: number;
  priceChange24h: number;
  signal: 'long' | 'short' | 'hold';
  signalReason: string;
  sma20: number;
  sma50: number;
  rsi: number;
  trend: 'strong_up' | 'up' | 'neutral' | 'down' | 'strong_down';
  volume: number;
  marketCap: number;
  timestamp: string;
}

interface PriceHistory {
  timestamp: number;
  price: number;
}

import { fetchWithRateLimit } from '@/utils/api';

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

// Cache for price history to avoid refetching
const priceHistoryCache: Record<string, PriceHistory[]> = {};

const fetchTopCryptos = async (): Promise<CryptoData[]> => {
  const url = `${COINGECKO_API_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=5&page=1&sparkline=false&price_change_percentage=24h`;
  
  try {
    const data = await fetchWithRateLimit<CryptoData[]>(
      url, 
      'topCryptos',
      2, // retries
      2000 // initial delay
    );
    
    if (!Array.isArray(data)) {
      throw new Error('Invalid response format from CoinGecko API');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching top cryptos:', error);
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Failed to fetch cryptocurrency data. Please try again later.'
    );
  }
};

const fetchPriceHistory = async (coinId: string): Promise<PriceHistory[]> => {
  // Check cache first
  if (priceHistoryCache[coinId]) {
    return priceHistoryCache[coinId];
  }

  const url = `${COINGECKO_API_BASE}/coins/${coinId}/market_chart?vs_currency=usd&days=30&interval=daily`;
  
  try {
    const response = await fetchWithRateLimit<{ prices: [number, number][] }>(
      url,
      `priceHistory_${coinId}`,
      2, // retries
      1500 // initial delay
    );
    
    if (!response?.prices) {
      throw new Error('Invalid price history data');
    }
    
    const history = response.prices.map(([timestamp, price]) => ({
      timestamp,
      price
    }));
    
    // Cache the result
    priceHistoryCache[coinId] = history;
    
    return history;
  } catch (error) {
    console.error(`Error fetching price history for ${coinId}:`, error);
    
    // Return cached data if available, even if it's stale
    if (priceHistoryCache[coinId]) {
      console.warn('Using cached price history due to API error');
      return priceHistoryCache[coinId];
    }
    
    throw new Error(
      error instanceof Error
        ? error.message
        : `Failed to load price history for ${coinId}. Please try again.`
    );
  }
};

const calculateSMA = (prices: number[], period: number): number => {
  if (prices.length < period) return prices[prices.length - 1] || 0;
  const sum = prices.slice(-period).reduce((acc, price) => acc + price, 0);
  return sum / period;
};

const calculateRSI = (prices: number[], period: number = 14): number => {
  if (prices.length < period + 1) return 50; // Default neutral RSI

  const changes = prices.slice(1).map((price, i) => price - prices[i]);
  const gains = changes.map(change => Math.max(0, change));
  const losses = changes.map(change => Math.max(0, -change));

  const avgGain = gains.slice(-period).reduce((acc, gain) => acc + gain, 0) / period;
  const avgLoss = losses.slice(-period).reduce((acc, loss) => acc + loss, 0) / period;

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
};

const analyzeSignal = (
  currentPrice: number,
  sma20: number,
  sma50: number,
  rsi: number,
  priceChange24h: number
): { signal: 'long' | 'short' | 'hold'; reason: string; trend: string } => {
  const priceAboveSMA20 = currentPrice > sma20;
  const priceAboveSMA50 = currentPrice > sma50;
  const sma20AboveSMA50 = sma20 > sma50;
  const isOverbought = rsi > 70;
  const isOversold = rsi < 30;

  // Determine trend
  let trend = 'neutral';
  if (priceAboveSMA20 && priceAboveSMA50 && sma20AboveSMA50 && priceChange24h > 5) {
    trend = 'strong_up';
  } else if (priceAboveSMA20 && sma20AboveSMA50) {
    trend = 'up';
  } else if (!priceAboveSMA20 && !priceAboveSMA50 && priceChange24h < -5) {
    trend = 'strong_down';
  } else if (!priceAboveSMA20 || !priceAboveSMA50) {
    trend = 'down';
  }

  // Generate signals
  if (isOversold && priceAboveSMA20 && sma20AboveSMA50) {
    return { signal: 'long', reason: 'Oversold bounce in uptrend', trend };
  }
  
  if (priceAboveSMA20 && priceAboveSMA50 && sma20AboveSMA50 && !isOverbought) {
    return { signal: 'long', reason: 'Strong uptrend momentum', trend };
  }
  
  if (isOverbought && (!priceAboveSMA20 || !priceAboveSMA50)) {
    return { signal: 'short', reason: 'Overbought in downtrend', trend };
  }
  
  if (!priceAboveSMA20 && !priceAboveSMA50 && !sma20AboveSMA50 && !isOversold) {
    return { signal: 'short', reason: 'Strong downtrend', trend };
  }

  return { signal: 'hold', reason: 'No clear signal', trend };
};

const RealTimeAnalysis = () => {
  const [selectedCrypto, setSelectedCrypto] = useState<string>('bitcoin');
  const [analysis, setAnalysis] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { 
    data: cryptos, 
    error: cryptosError, 
    isLoading: isLoadingCryptos,
    refetch: refetchCryptos 
  } = useQuery<CryptoData[]>({
    queryKey: ['topCryptos'],
    queryFn: fetchTopCryptos,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: (attempt) => Math.min(attempt * 1000, 3000),
  });

  useEffect(() => {
    if (cryptosError) {
      setError('Failed to load cryptocurrency data. Please try again.');
      setIsLoading(false);
      setIsRefreshing(false);
    } else if (cryptos) {
      setError(null);
      setIsLoading(false);
      setIsRefreshing(false);
      setLastUpdated(new Date());
    }
  }, [cryptos, cryptosError]);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    try {
      setIsRefreshing(true);
      setError(null);
      
      // Clear caches
      Object.keys(priceHistoryCache).forEach(key => {
        delete priceHistoryCache[key];
      });
      
      // Refetch data and re-run analysis
      await refetchCryptos();
      if (cryptos) {
        await performAnalysis();
      }
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error refreshing data:', error);
      setError('Failed to refresh data. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const performAnalysis = async () => {
    if (!cryptos || isAnalyzing) return;

    setIsAnalyzing(true);
    setError(null);
    
    try {
      const results: AnalysisResult[] = [];
      
      for (const crypto of cryptos) {
        try {
          const priceHistory = await fetchPriceHistory(crypto.id);
          const prices = priceHistory.map(item => item.price);
          
          if (prices.length < 50) {
            console.warn(`Insufficient price history for ${crypto.name}`);
            continue;
          }
          
          const sma20 = calculateSMA(prices, 20);
          const sma50 = calculateSMA(prices, 50);
          const rsi = calculateRSI(prices);
          
          const { signal, reason, trend } = analyzeSignal(
            crypto.current_price,
            sma20,
            sma50,
            rsi,
            crypto.price_change_percentage_24h || 0
          );
          
          results.push({
            coin: crypto.id,
            name: crypto.name,
            price: crypto.current_price,
            priceChange24h: crypto.price_change_percentage_24h || 0,
            signal,
            signalReason: reason,
            sma20,
            sma50,
            rsi,
            trend: trend as 'strong_up' | 'up' | 'neutral' | 'down' | 'strong_down',
            volume: crypto.total_volume,
            marketCap: crypto.market_cap,
            timestamp: new Date().toISOString()
          });
        } catch (err) {
          console.error(`Error analyzing ${crypto.name}:`, err);
        }
      }

      setAnalysis(results);
      setLastUpdated(new Date());
      setIsAnalyzing(false);
      
      return results;
    } catch (error) {
      console.error('Error in analysis:', error);
      setError('Failed to analyze cryptocurrency data. Please try again.');
      setIsAnalyzing(false);
      return [];
    }
  };

  useEffect(() => {
    if (cryptos && !isAnalyzing) {
      performAnalysis();
    }
  }, [cryptos]);

  const formatPrice = (price: number): string => {
    if (price >= 1000) return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (price >= 1) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(8)}`;
  };

  const formatChange = (change: number): string => {
    return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
  };

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'long': return <ArrowUpIcon className="w-4 h-4 text-success" />;
      case 'short': return <ArrowDownIcon className="w-4 h-4 text-warning" />;
      default: return <MinusIcon className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'long': return 'text-success';
      case 'short': return 'text-warning';
      default: return 'text-muted-foreground';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'strong_up': return '🚀';
      case 'up': return '📈';
      case 'strong_down': return '📉';
      case 'down': return '⬇️';
      default: return '➡️';
    }
  };

  const longSignals = analysis.filter(r => r?.signal === 'long');
  const shortSignals = analysis.filter(r => r?.signal === 'short');
  const holdSignals = analysis.filter(r => r?.signal === 'hold');

  if (isLoadingCryptos || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="text-gray-500">Loading market data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 rounded">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <XCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm text-red-700">{error}</p>
            <div className="mt-3">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${isRefreshing ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {isRefreshing ? (
                  <>
                    <RefreshCw className="animate-spin -ml-1 mr-2 h-3 w-3" />
                    Refreshing...
                  </>
                ) : (
                  'Try Again'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUpIcon className="w-5 h-5" />
              Real-Time Crypto Analysis
            </div>
            <div className="text-sm text-muted-foreground">
              Last Update: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{longSignals.length}</div>
              <div className="text-sm text-muted-foreground">Buy Signals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">{shortSignals.length}</div>
              <div className="text-sm text-muted-foreground">Sell Signals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">{holdSignals.length}</div>
              <div className="text-sm text-muted-foreground">Hold Signals</div>
            </div>
          </div>
          {isAnalyzing && (
            <div className="mt-4 text-center">
              <div className="animate-pulse text-primary">Analyzing cryptocurrencies...</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-muted-foreground border-b border-secondary">
                    <th className="pb-3">Coin</th>
                    <th className="pb-3">Price</th>
                    <th className="pb-3">24h Change</th>
                    <th className="pb-3">Signal</th>
                    <th className="pb-3">RSI</th>
                    <th className="pb-3">SMA 20</th>
                    <th className="pb-3">SMA 50</th>
                    <th className="pb-3">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.map((result, index) => (
                    <tr key={result.coin} className="border-b border-secondary/50">
                      <td className="py-3">
                        <div className="font-medium">{result.name}</div>
                        <div className="text-sm text-muted-foreground">{result.coin}</div>
                      </td>
                      <td className="py-3 font-mono">{formatPrice(result.price)}</td>
                      <td className="py-3">
                        <span className={result.priceChange24h >= 0 ? 'text-success' : 'text-warning'}>
                          {formatChange(result.priceChange24h)}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className={`flex items-center gap-2 ${getSignalColor(result.signal)}`}>
                          {getSignalIcon(result.signal)}
                          <span className="font-medium">{result.signal.toUpperCase()}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {result.signalReason}
                        </div>
                      </td>
                      <td className="py-3">
                        <span className={
                          result.rsi > 70 ? 'text-warning' : 
                          result.rsi < 30 ? 'text-success' : 
                          'text-muted-foreground'
                        }>
                          {result.rsi.toFixed(1)}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-sm">{formatPrice(result.sma20)}</td>
                      <td className="py-3 font-mono text-sm">{formatPrice(result.sma50)}</td>
                      <td className="py-3">
                        <span className="text-lg">{getTrendIcon(result.trend)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <Card className="glass-card border-warning/20">
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground">
            <strong>⚠️ Disclaimer:</strong> This analysis is for informational purposes only and not financial advice.
            Cryptocurrency markets are highly volatile. Always do your own research and consider your risk tolerance
            before making any investment decisions. Past performance is not indicative of future results.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeAnalysis;
