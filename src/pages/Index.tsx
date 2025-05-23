
import React, { useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BalanceCard from '@/components/dashboard/BalanceCard';
import ExpensesChart from '@/components/dashboard/ExpensesChart';
import RecentTransactionsList from '@/components/dashboard/RecentTransactionsList';
import SavingsProgressCard from '@/components/dashboard/SavingsProgressCard';
import { useFinancial } from '@/contexts/FinancialContext';
import { useUser } from '@/contexts/UserContext';
import { motion } from 'framer-motion';

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  return (
    <DashboardLayout>
      <motion.div 
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 className="text-3xl font-bold text-blue-700" variants={itemVariants}>
          Dashboard
        </motion.h1>
        
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              <BalanceCard 
                remainingMoney={remainingMoney} 
                totalSaved={totalSaved}
                recentExpenses={recentExpensesTotal}
              />
            </div>
          </div>
        </motion.div>
        
        <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-6" variants={itemVariants}>
          <ExpensesChart />
          <SavingsProgressCard />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <RecentTransactionsList />
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Index;
