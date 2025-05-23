
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDown, ArrowUp, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

interface BalanceCardProps {
  remainingMoney: number;
  totalSaved: number;
  recentExpenses: number;
}

const BalanceCard: React.FC<BalanceCardProps> = ({
  remainingMoney,
  totalSaved,
  recentExpenses,
}) => {
  const formattedMoney = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(remainingMoney);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-400 text-white pb-2">
          <CardTitle className="text-xl flex justify-between items-center">
            <span className="flex items-center">
              <Wallet className="mr-2 h-5 w-5" /> ExpenseChecker Balance
            </span>
            <span className="text-lg opacity-75 font-normal">Today</span>
          </CardTitle>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="text-4xl font-bold mt-2"
          >
            {formattedMoney}
          </motion.div>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 pt-6">
          <motion.div 
            className="flex flex-col" 
            whileHover={{ translateY: -2 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-sm text-muted-foreground mb-1">Recent Expenses</span>
            <div className="flex items-center space-x-1">
              <ArrowDown className="w-4 h-4 text-red-500" />
              <span className="text-red-500 font-medium">₹{recentExpenses.toLocaleString()}</span>
            </div>
          </motion.div>
          <motion.div 
            className="flex flex-col"
            whileHover={{ translateY: -2 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-sm text-muted-foreground mb-1">Total Saved</span>
            <div className="flex items-center space-x-1">
              <ArrowUp className="w-4 h-4 text-green-500" />
              <span className="text-green-500 font-medium">₹{totalSaved.toLocaleString()}</span>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BalanceCard;
