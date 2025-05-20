
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Receipt, PiggyBank, FileText, User, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFinancial } from '@/contexts/FinancialContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

const AppHeader: React.FC = () => {
  const location = useLocation();
  const { validations } = useFinancial();
  
  const navigation = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Expenses', path: '/expenses', icon: Receipt },
    { name: 'Savings', path: '/savings', icon: PiggyBank },
    { name: 'History', path: '/history', icon: FileText },
    { name: 'Profile', path: '/profile', icon: User }
  ];
  
  const isActiveRoute = (path: string) => {
    if (path === '/' && location.pathname === '/') {
      return true;
    }
    if (path !== '/' && location.pathname.startsWith(path)) {
      return true;
    }
    return false;
  };
  
  const hasValidations = validations.length > 0;
  
  return (
    <header className="sticky top-0 z-30 w-full bg-background border-b border-border">
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold text-primary">
            <Link to="/">WealthWise</Link>
          </h1>
        </div>
        
        <nav className="hidden md:flex space-x-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                  isActiveRoute(item.path)
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent/50'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Bell />
                {hasValidations && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center"
                  >
                    {validations.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[300px]">
              {validations.length > 0 ? (
                validations.map((item) => (
                  <DropdownMenuItem key={item.id} className="flex flex-col items-start">
                    <span className="font-medium">{item.title}</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled>No pending validations</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <nav className="md:hidden flex justify-between px-4 py-2 border-t">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center px-2 py-1 rounded-md ${
                isActiveRoute(item.path)
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
};

export default AppHeader;
