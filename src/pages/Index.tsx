
import { useState } from "react";
import MarketStats from "@/components/MarketStats";
import CryptoChart from "@/components/CryptoChart";
import PortfolioCard from "@/components/PortfolioCard";
import CryptoList from "@/components/CryptoList";
import RealTimeAnalysis from "@/components/RealTimeAnalysis";
import WalletConnect from "@/components/WalletConnect";
import WalletAssets from "@/components/WalletAssets";
import CoinSelector from "@/components/CoinSelector";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  const [selectedCoin, setSelectedCoin] = useState("bitcoin");

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Crypto Dashboard</h1>
              <p className="text-muted-foreground">Welcome back to your portfolio</p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/meme-coins">
                <Button variant="outline">🚀 Meme Coins</Button>
              </Link>
              <WalletConnect />
            </div>
          </div>
          
          <div className="flex items-center gap-4 mb-4">
            <CoinSelector 
              selectedCoin={selectedCoin} 
              onCoinChange={setSelectedCoin} 
            />
          </div>
        </header>
        
        <MarketStats />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <CryptoChart />
          </div>
          <div className="space-y-6">
            <PortfolioCard />
            <WalletAssets />
          </div>
        </div>
        
        <div className="mb-8">
          <RealTimeAnalysis />
        </div>
        
        <CryptoList />
      </div>
    </div>
  );
};

export default Index;
