import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { WagmiConfig } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { config, chains } from './hooks/useWallet';
import '@rainbow-me/rainbowkit/styles.css';

createRoot(document.getElementById("root")!).render(
  <WagmiConfig config={config}>
    <RainbowKitProvider chains={chains} theme={darkTheme()}>
      <App />
    </RainbowKitProvider>
  </WagmiConfig>
);
