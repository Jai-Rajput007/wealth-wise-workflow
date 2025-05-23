
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User, BellRing, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';
import { useFinancial } from '@/contexts/FinancialContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AppHeader: React.FC = () => {
  const { user, logout, profile } = useUser();
  const { validations } = useFinancial();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white border-b border-gray-200 sticky top-0 z-10"
    >
      <div className="container mx-auto py-3 px-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link to={user ? '/dashboard' : '/auth'} className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-blue-600">FinFlow</span>
          </Link>

          {user && (
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="relative">
                    <BellRing className="w-5 h-5" />
                    {validations.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {validations.length}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="p-2 font-medium">Notifications</div>
                  <DropdownMenuSeparator />
                  {validations.length > 0 ? (
                    <>
                      {validations.slice(0, 3).map((item) => (
                        <DropdownMenuItem key={item.id} onClick={() => navigate('/validations')}>
                          <div className="flex flex-col gap-1">
                            <div className="font-medium">{item.title.substring(0, 25)}{item.title.length > 25 ? '...' : ''}</div>
                            <div className="text-xs text-muted-foreground">₹{item.amount}</div>
                          </div>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/validations')}>
                        <div className="w-full text-center text-blue-600">View all</div>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground">No notifications</div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative flex items-center gap-2">
                    <User className="h-5 w-5" />
                    <span className="hidden sm:inline-block font-medium">
                      {profile?.username || 'Profile'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <Link to="/profile">
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default AppHeader;
