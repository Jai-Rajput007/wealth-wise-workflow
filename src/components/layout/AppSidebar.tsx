
import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Receipt, 
  Wallet, 
  History,
  BellRing,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/contexts/UserContext';
import { useFinancial } from '@/contexts/FinancialContext';

const AppSidebar: React.FC = () => {
  const { validations } = useFinancial();
  const { profile } = useUser();
  
  const navLinks = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      to: '/expenses',
      label: 'Expenses',
      icon: <Receipt className="w-5 h-5" />
    },
    {
      to: '/savings',
      label: 'Savings',
      icon: <Wallet className="w-5 h-5" />
    },
    {
      to: '/history',
      label: 'History',
      icon: <History className="w-5 h-5" />
    },
    {
      to: '/validations',
      label: 'Validations',
      icon: <BellRing className="w-5 h-5" />,
      badge: validations.length > 0 ? validations.length : undefined
    },
    {
      to: '/profile',
      label: 'Profile',
      icon: <User className="w-5 h-5" />
    }
  ];

  return (
    <motion.div 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="hidden md:flex flex-col min-h-screen w-64 bg-white border-r border-gray-200 py-6 px-3 shadow-sm"
    >
      <div className="flex flex-col flex-1 space-y-2">
        {/* User info */}
        {profile && (
          <div className="px-4 py-4 mb-4 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-700">Welcome to ExpenseChecker,</p>
            <p className="font-bold text-blue-700">{profile.username}</p>
          </div>
        )}
        
        <div className="space-y-1.5">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all",
                "hover:bg-blue-50 hover:text-blue-700",
                "hover:scale-[1.02] transform-gpu transition-transform duration-200",
                isActive 
                  ? "bg-blue-100 text-blue-700 shadow-sm" 
                  : "text-gray-600"
              )}
            >
              <div className="mr-3">{link.icon}</div>
              <span>{link.label}</span>
              
              {link.badge && (
                <div className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {link.badge}
                </div>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default AppSidebar;
