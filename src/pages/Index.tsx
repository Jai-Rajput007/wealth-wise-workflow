
import React, { useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BalanceCard from '@/components/dashboard/BalanceCard';
import ExpensesChart from '@/components/dashboard/ExpensesChart';
import RecentTransactionsList from '@/components/dashboard/RecentTransactionsList';
import SavingsProgressCard from '@/components/dashboard/SavingsProgressCard';
import ValidationList from '@/components/validation/ValidationList';
import { useFinancial } from '@/contexts/FinancialContext';
import { useUser } from '@/contexts/UserContext';

const Index = () => {
  const { expenses, transactions, remainingMoney, totalSaved, validations } = useFinancial();
  const { isProfileComplete } = useUser();
  
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
    return (
      <DashboardLayout requireAuth={false}>
        <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-md space-y-6">
            <h1 className="text-3xl font-bold text-foreground">Welcome to WealthWise</h1>
            <p className="text-lg text-muted-foreground">
              Start tracking your finances by setting up your profile.
            </p>
            <div className="animate-pulse-scale">
              <div className="bg-primary/10 rounded-full p-4 inline-block">
                <svg
                  className="w-16 h-16 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <BalanceCard 
              remainingMoney={remainingMoney} 
              totalSaved={totalSaved}
              recentExpenses={recentExpensesTotal}
            />
          </div>
          
          <div className="lg:col-span-2">
            <ValidationList />
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
