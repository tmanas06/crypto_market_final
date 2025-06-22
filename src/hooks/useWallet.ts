import React, { useState, useEffect, ReactNode } from 'react';
import { createConfig, http, useAccount, useConnect, useDisconnect } from 'wagmi';
import { WagmiConfig } from '@wagmi/core';
import { mainnet, polygon, optimism, arbitrum } from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Get WalletConnect project ID from environment variables
const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

if (!walletConnectProjectId) {
  console.warn('WalletConnect project ID is not set. WalletConnect will not work properly.');
}

// Configure chains
const chains = [mainnet, polygon, optimism, arbitrum] as const;

// Create a client for React Query
const queryClient = new QueryClient();

// Create a custom config with the required connectors
const config = createConfig(
  getDefaultConfig({
    appName: 'Crypto Markets',
    projectId: walletConnectProjectId || 'fallback-project-id',
    chains: chains as any,
    transports: {
      [mainnet.id]: http(),
      [polygon.id]: http(),
      [optimism.id]: http(),
      [arbitrum.id]: http(),
    },
    ssr: true,
  }) as any
);

// Create a provider component
type Web3ProviderProps = {
  children: ReactNode;
};

export const Web3Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiConfig>
  );
};

export interface WalletAsset {
  symbol: string;
  name: string;
  balance: number;
  value: number;
  price: number;
  change24h: number;
}

// Wallet connection hook
export const useWallet = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const [assets, setAssets] = useState<WalletAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState<number>(0);

  // Mock function to get wallet balance
  const fetchBalance = async (): Promise<number> => {
    if (!address) return 0;
    // In a real app, you would fetch this from your blockchain provider
    return Math.random() * 10;
  };

  // Mock function to get wallet assets
  const fetchAssets = async (): Promise<WalletAsset[]> => {
    if (!address) return [];
    
    // In a real app, you would fetch this from your blockchain provider
    return [
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
        symbol: 'USDC',
        name: 'USD Coin',
        balance: 1000,
        value: 1000,
        price: 1,
        change24h: 0
      }
    ];
  };

  const connectWallet = async (connector?: any) => {
    try {
      if (connector) {
        await connect({ connector });
      } else {
        // Try to connect with the injected connector (MetaMask, etc.) first
        const injected = connectors.find((c: any) => c.id === 'injected');
        if (injected) {
          await connect({ connector: injected });
        } else if (connectors[0]) {
          // Fallback to the first available connector
          await connect({ connector: connectors[0] });
        }
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  };

  const disconnectWallet = () => {
    try {
      disconnect();
      setAssets([]);
      setBalance(0);
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  // Fetch wallet data when connected
  useEffect(() => {
    const fetchWalletData = async () => {
      if (isConnected && address) {
        setIsLoading(true);
        try {
          const [balanceData, assetsData] = await Promise.all([
            fetchBalance(),
            fetchAssets()
          ]);
          setBalance(balanceData);
          setAssets(assetsData);
        } catch (error) {
          console.error('Error fetching wallet data:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setAssets([]);
        setBalance(0);
      }
    };

    fetchWalletData();
  }, [isConnected, address]);

  return {
    address,
    isConnected,
    balance,
    assets,
    connect: connectWallet,
    disconnect: disconnectWallet,
    connectors,
    isLoading: isConnecting || isLoading,
  };
};
