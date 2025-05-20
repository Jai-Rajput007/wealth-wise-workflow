
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFinancial, Transaction } from '@/contexts/FinancialContext';
import { ArrowDown, ArrowUp, PiggyBank, Wallet } from 'lucide-react';

const RecentTransactionsList: React.FC = () => {
  const { transactions } = useFinancial();
  
  // Get 5 most recent transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'expense':
        return <ArrowDown className="w-4 h-4 text-money-negative" />;
      case 'income':
        return <ArrowUp className="w-4 h-4 text-money-positive" />;
      case 'saving':
        return <PiggyBank className="w-4 h-4 text-money-savings" />;
      case 'return':
        return <Wallet className="w-4 h-4 text-money-neutral" />;
      default:
        return <ArrowDown className="w-4 h-4" />;
    }
  };
  
  const getAmountClass = (type: Transaction['type']) => {
    switch (type) {
      case 'expense':
        return 'expense-amount';
      case 'income':
        return 'income-amount';
      case 'saving':
        return 'savings-amount';
      case 'return':
        return 'neutral-amount';
      default:
        return '';
    }
  };
  
  const getAmountPrefix = (type: Transaction['type']) => {
    switch (type) {
      case 'expense':
      case 'saving':
        return '-';
      case 'income':
      case 'return':
        return '+';
      default:
        return '';
    }
  };
  
  // Show a placeholder when there's no data
  if (recentTransactions.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground py-4 text-center">No transactions yet</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y">
          {recentTransactions.map((transaction) => (
            <li key={transaction.id} className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-muted">
                  {getTransactionIcon(transaction.type)}
                </div>
                <div>
                  <p className="font-medium">{transaction.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(transaction.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span className={getAmountClass(transaction.type)}>
                {getAmountPrefix(transaction.type)}₹{transaction.amount.toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default RecentTransactionsList;
