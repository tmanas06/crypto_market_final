# Jupiter API Integration

This project integrates with Jupiter's API to provide the following features:

## Features

### 1. Swap
- Token swapping functionality with price impact calculation
- Slippage tolerance settings
- Best route calculation
- Real-time price updates

### 2. Trade
- Multiple order types (Market, Limit)
- Order book visualization (coming soon)
- Trade history
- Advanced charting (coming soon)

### 3. Bridge
- Cross-chain token transfers
- Supported chains:
  - Solana
  - Ethereum
  - Binance Smart Chain
  - Polygon
  - Avalanche
- Real-time bridge fee calculation

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Solana wallet (Phantom, Solflare, etc.)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory with your configuration:
   ```
   VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
   VITE_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

- `VITE_SOLANA_RPC_URL`: Solana RPC endpoint
- `VITE_WALLET_CONNECT_PROJECT_ID`: WalletConnect project ID

## API Reference

### Jupiter API
- [Jupiter API Documentation](https://docs.jup.ag/)
- [Jupiter SDK](https://github.com/jup-ag/jupiter-core)

### Solana Web3.js
- [@solana/web3.js](https://solana-labs.github.io/solana-web3.js/)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
