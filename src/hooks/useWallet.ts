
import { useState, useEffect } from 'react';

export interface WalletAsset {
  symbol: string;
  name: string;
  balance: number;
  value: number;
  price: number;
  change24h: number;
}

export const useWallet = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [assets, setAssets] = useState<WalletAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const connectWallet = async () => {
    try {
      setIsLoading(true);
      // Check if MetaMask is installed
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({
          method: 'eth_request_accounts'
        });
        
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
          await fetchWalletAssets(accounts[0]);
        }
      } else {
        alert('Please install MetaMask to connect your wallet');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWalletAssets = async (walletAddress: string) => {
    try {
      // Mock wallet assets for demo purposes
      // In a real app, you'd fetch from blockchain APIs or wallet APIs
      const mockAssets: WalletAsset[] = [
        {
          symbol: 'ETH',
          name: 'Ethereum',
          balance: 2.5,
          value: 6250.75,
          price: 2500.30,
          change24h: -0.42
        },
        {
          symbol: 'BTC',
          name: 'Bitcoin',
          balance: 0.1,
          value: 10473.80,
          price: 104738.00,
          change24h: -0.41
        },
        {
          symbol: 'DOGE',
          name: 'Dogecoin',
          balance: 1000,
          value: 170.21,
          price: 0.17021,
          change24h: -0.21
        }
      ];
      
      setAssets(mockAssets);
    } catch (error) {
      console.error('Error fetching wallet assets:', error);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress(null);
    setAssets([]);
  };

  return {
    isConnected,
    address,
    assets,
    isLoading,
    connectWallet,
    disconnectWallet
  };
};
