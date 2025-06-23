import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { Web3Provider } from './hooks/useWallet';
import '@rainbow-me/rainbowkit/styles.css';

createRoot(document.getElementById("root")!).render(
  <Web3Provider>
    <RainbowKitProvider theme={darkTheme()}>
      <App />
    </RainbowKitProvider>
  </Web3Provider>
);
