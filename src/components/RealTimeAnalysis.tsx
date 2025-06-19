
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, MinusIcon } from 'lucide-react';

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

const fetchTopCryptos = async (): Promise<CryptoData[]> => {
  const response = await fetch(
    'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false'
  );
  if (!response.ok) throw new Error('Failed to fetch crypto data');
  return response.json();
};

const fetchPriceHistory = async (coinId: string): Promise<PriceHistory[]> => {
  const response = await fetch(
    `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=30&interval=daily`
  );
  if (!response.ok) throw new Error(`Failed to fetch price history for ${coinId}`);
  const data = await response.json();
  return data.prices.map(([timestamp, price]: [number, number]) => ({
    timestamp,
    price
  }));
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
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const { data: cryptos, isLoading } = useQuery({
    queryKey: ['topCryptos'],
    queryFn: fetchTopCryptos,
    refetchInterval: 60000, // Refetch every minute
  });

  const performAnalysis = async () => {
    if (!cryptos || isAnalyzing) return;

    setIsAnalyzing(true);
    const results: AnalysisResult[] = [];

    for (const crypto of cryptos.slice(0, 5)) { // Analyze top 5 to avoid rate limits
      try {
        console.log(`Analyzing ${crypto.name}...`);
        
        // Fetch price history
        const priceHistory = await fetchPriceHistory(crypto.id);
        const prices = priceHistory.map(p => p.price);

        if (prices.length < 20) {
          console.warn(`Insufficient data for ${crypto.name}`);
          continue;
        }

        // Calculate technical indicators
        const sma20 = calculateSMA(prices, 20);
        const sma50 = calculateSMA(prices, 50);
        const rsi = calculateRSI(prices);

        // Analyze signal
        const analysis = analyzeSignal(
          crypto.current_price,
          sma20,
          sma50,
          rsi,
          crypto.price_change_percentage_24h
        );

        const result: AnalysisResult = {
          coin: crypto.id.toUpperCase(),
          name: crypto.name,
          price: crypto.current_price,
          priceChange24h: crypto.price_change_percentage_24h,
          signal: analysis.signal,
          signalReason: analysis.reason,
          sma20,
          sma50,
          rsi,
          trend: analysis.trend as any,
          volume: crypto.total_volume,
          marketCap: crypto.market_cap,
          timestamp: new Date().toISOString()
        };

        results.push(result);
        
        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`Error analyzing ${crypto.name}:`, error);
      }
    }

    setAnalysisResults(results);
    setLastUpdate(new Date().toLocaleTimeString());
    setIsAnalyzing(false);
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

  const longSignals = analysisResults.filter(r => r.signal === 'long');
  const shortSignals = analysisResults.filter(r => r.signal === 'short');
  const holdSignals = analysisResults.filter(r => r.signal === 'hold');

  if (isLoading) {
    return (
      <Card className="glass-card animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUpIcon className="w-5 h-5" />
            Real-Time Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-pulse text-muted-foreground">Loading market data...</div>
          </div>
        </CardContent>
      </Card>
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
              Last Update: {lastUpdate}
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
      {analysisResults.length > 0 && (
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
                  {analysisResults.map((result, index) => (
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
