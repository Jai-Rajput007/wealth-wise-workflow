
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { useFinancial } from '@/contexts/FinancialContext';
import { Button } from '@/components/ui/button';
import {
  DollarSign,
  User,
  LogOut,
  Bell,
  ChevronDown,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AppHeader: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const { validations } = useFinancial();
  const { toast } = useToast();
  const [pendingCount, setPendingCount] = useState(0);
  
  useEffect(() => {
    if (validations && validations.length > 0) {
      setPendingCount(validations.length);
    } else {
      setPendingCount(0);
    }
  }, [validations]);
  
  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: "An error occurred while logging out.",
        variant: "destructive",
      });
    }
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
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="relative"
              onClick={() => navigate('/validations')}
            >
              <Bell className="h-5 w-5" />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <span className="hidden sm:inline">Profile</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <Button asChild size="sm">
            <Link to="/auth">Login</Link>
          </Button>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
