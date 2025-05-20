
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDown, ArrowUp } from 'lucide-react';

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
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary text-primary-foreground pb-2">
        <CardTitle className="text-xl flex justify-between items-center">
          <span>Available Balance</span>
          <span className="text-lg opacity-75 font-normal">Today</span>
        </CardTitle>
        <div className="text-3xl font-bold mt-2">{formattedMoney}</div>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 pt-6">
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground mb-1">Recent Expenses</span>
          <div className="flex items-center space-x-1">
            <ArrowDown className="w-4 h-4 text-money-negative" />
            <span className="expense-amount">₹{recentExpenses.toLocaleString()}</span>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground mb-1">Total Saved</span>
          <div className="flex items-center space-x-1">
            <ArrowUp className="w-4 h-4 text-money-savings" />
            <span className="savings-amount">₹{totalSaved.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BalanceCard;
