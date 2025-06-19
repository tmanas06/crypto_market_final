
import { useWallet } from '@/hooks/useWallet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

const WalletAssets = () => {
  const { isConnected, assets } = useWallet();

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wallet Assets</CardTitle>
          <CardDescription>
            Connect your wallet to view your cryptocurrency holdings
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Wallet Assets</CardTitle>
        <CardDescription>
          Total Portfolio Value: ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {assets.map((asset) => (
            <div key={asset.symbol} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="font-semibold">{asset.symbol}</h3>
                  <p className="text-sm text-gray-500">{asset.name}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">
                  {asset.balance.toLocaleString()} {asset.symbol}
                </div>
                <div className="text-sm">
                  ${asset.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  asset.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {asset.change24h >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {Math.abs(asset.change24h).toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletAssets;
