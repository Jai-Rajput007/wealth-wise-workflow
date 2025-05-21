
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  DollarSign, 
  PiggyBank, 
  History, 
  User, 
  LogOut, 
  CheckCircle 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AppHeader: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useUser();
  const { toast } = useToast();
  
  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: "An error occurred while logging out.",
        variant: "destructive",
      });
    }
  };
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  // Don't show navigation on auth page
  if (location.pathname === '/auth' || location.pathname === '/salary-setup') {
    return (
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <DollarSign className="h-6 w-6 text-primary mr-2" />
            <span className="font-bold text-lg">ExpenseChecker</span>
          </Link>
        </div>
      </header>
    );
  }
  
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <DollarSign className="h-6 w-6 text-primary mr-2" />
          <span className="font-bold text-lg">ExpenseChecker</span>
        </Link>
        
        {user ? (
          <nav className="hidden md:flex gap-1">
            <Button
              variant={isActive('/') ? "default" : "ghost"}
              size="sm"
              asChild
            >
              <Link to="/">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
            
            <Button
              variant={isActive('/expenses') ? "default" : "ghost"}
              size="sm"
              asChild
            >
              <Link to="/expenses">
                <DollarSign className="h-4 w-4 mr-2" />
                Expenses
              </Link>
            </Button>
            
            <Button
              variant={isActive('/savings') ? "default" : "ghost"}
              size="sm"
              asChild
            >
              <Link to="/savings">
                <PiggyBank className="h-4 w-4 mr-2" />
                Savings
              </Link>
            </Button>
            
            <Button
              variant={isActive('/history') ? "default" : "ghost"}
              size="sm"
              asChild
            >
              <Link to="/history">
                <History className="h-4 w-4 mr-2" />
                History
              </Link>
            </Button>
            
            <Button
              variant={isActive('/validations') ? "default" : "ghost"}
              size="sm"
              asChild
            >
              <Link to="/validations">
                <CheckCircle className="h-4 w-4 mr-2" />
                Validations
              </Link>
            </Button>
            
            <Button
              variant={isActive('/profile') ? "default" : "ghost"}
              size="sm"
              asChild
            >
              <Link to="/profile">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Link>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </nav>
        ) : (
          <Button asChild size="sm">
            <Link to="/auth">Login</Link>
          </Button>
        )}
        
        {/* Mobile menu button (implement mobile menu logic here) */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
        >
          <span className="sr-only">Open menu</span>
          {/* Icon for mobile menu */}
        </Button>
      </div>
    </header>
  );
};

export default AppHeader;
