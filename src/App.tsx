
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Index from "./pages/Index";
import MemeCoins from "./pages/MemeCoins";
import SwapPage from "./pages/swap/SwapPage";
import TradePage from "./pages/trade/TradePage";
import BridgePage from "./pages/bridge/BridgePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Navbar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/meme-coins" element={<MemeCoins />} />
            <Route path="/swap" element={<SwapPage />} />
            <Route path="/trade" element={<TradePage />} />
            <Route path="/bridge" element={<BridgePage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
