
import React, { useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BalanceCard from '@/components/dashboard/BalanceCard';
import ExpensesChart from '@/components/dashboard/ExpensesChart';
import RecentTransactionsList from '@/components/dashboard/RecentTransactionsList';
import SavingsProgressCard from '@/components/dashboard/SavingsProgressCard';
import { useFinancial } from '@/contexts/FinancialContext';
import { useUser } from '@/contexts/UserContext';

const Index = () => {
  const { expenses, transactions, remainingMoney, totalSaved } = useFinancial();
  const { user, isProfileComplete } = useUser();
  
  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  // Calculate recent expenses total (last 30 days)
  const recentExpensesTotal = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return expenses
      .filter(expense => 
        expense.isValidated && 
        new Date(expense.date) >= thirtyDaysAgo
      )
      .reduce((total, expense) => total + expense.amount, 0);
  }, [expenses]);
  
  if (!isProfileComplete) {
    return <Navigate to="/salary-setup" replace />;
  }
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="col-span-1 md:col-span-2 lg:col-span-3">
            <BalanceCard 
              remainingMoney={remainingMoney} 
              totalSaved={totalSaved}
              recentExpenses={recentExpensesTotal}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ExpensesChart />
          <SavingsProgressCard />
        </div>
        
        <div>
          <RecentTransactionsList />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
