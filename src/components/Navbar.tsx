
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import WalletConnect from '@/components/WalletConnect';
import { Home, TrendingUp } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold text-primary">
              Crypto Dashboard
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button 
                  variant={isActive('/') ? 'default' : 'ghost'} 
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              
              <Link to="/meme-coins">
                <Button 
                  variant={isActive('/meme-coins') ? 'default' : 'ghost'} 
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <TrendingUp className="h-4 w-4" />
                  🚀 Meme Coins
                </Button>
              </Link>
            </div>
          </div>
          
          <WalletConnect />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
