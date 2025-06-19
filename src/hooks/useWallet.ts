
import { useState, useEffect } from 'react';
import { createConfig, configureChains, useAccount, useConnect, useDisconnect } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { mainnet, polygon, optimism, arbitrum } from 'wagmi/chains';

export const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, polygon, optimism, arbitrum],
  [publicProvider()]
);

// Create a custom config with the required connectors
export const config = createConfig({
  autoConnect: true,
  connectors: [
    new InjectedConnector({ chains }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId: 'YOUR_WALLETCONNECT_PROJECT_ID', // Get this from WalletConnect Cloud
        showQrModal: true,
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
});

export interface WalletAsset {
  symbol: string;
  name: string;
  balance: number;
  value: number;
  price: number;
  change24h: number;
}

export const useWallet = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isLoading: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const [assets, setAssets] = useState<WalletAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const connectWallet = async () => {
    try {
      // Try to connect with the injected connector (MetaMask, etc.) first
      const injected = connectors.find((c) => c.id === 'injected');
      if (injected) {
        await connect({ connector: injected });
      } else if (connectors[0]) {
        // Fallback to the first available connector
        await connect({ connector: connectors[0] });
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
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
    try {
      disconnect();
      setAssets([]);
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  return {
    isConnected,
    address,
    assets,
    isLoading: isLoading || isConnecting,
    connectWallet,
    disconnectWallet
  };
};
