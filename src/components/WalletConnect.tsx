
import { Wallet, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/useWallet';

const WalletConnect = () => {
  const { isConnected, address, connectWallet, disconnectWallet, isLoading } = useWallet();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg">
          <Wallet className="h-4 w-4" />
          <span className="font-mono text-sm">{formatAddress(address)}</span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={disconnectWallet}
          className="flex items-center gap-1"
        >
          <LogOut className="h-4 w-4" />
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button 
      onClick={connectWallet} 
      disabled={isLoading}
      className="flex items-center gap-2"
    >
      <Wallet className="h-4 w-4" />
      {isLoading ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  );
};

export default WalletConnect;
