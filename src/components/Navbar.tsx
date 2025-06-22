
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import WalletConnect from '@/components/WalletConnect';
import { Home, TrendingUp, ArrowRightLeft, BarChart2, Link2 } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  const navItems = [
    { path: '/', icon: <Home className="h-4 w-4" />, label: 'Dashboard' },
    { path: '/meme-coins', icon: <TrendingUp className="h-4 w-4" />, label: '🚀 Meme Coins' },
    { path: '/swap', icon: <ArrowRightLeft className="h-4 w-4" />, label: 'Swap' },
    { path: '/trade', icon: <BarChart2 className="h-4 w-4" />, label: 'Trade' },
    { path: '/bridge', icon: <Link2 className="h-4 w-4" />, label: 'Bridge' },
  ];

  return (
    <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold text-primary">
              Crypto Dashboard
            </Link>
            
            <div className="flex items-center space-x-1">
              {navItems.map((item) => (
                <Link to={item.path} key={item.path}>
                  <Button 
                    variant={isActive(item.path) ? 'default' : 'ghost'} 
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    {item.icon}
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
          
          <WalletConnect />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
