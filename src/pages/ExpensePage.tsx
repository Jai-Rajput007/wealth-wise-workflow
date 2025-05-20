
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AddExpenseForm from '@/components/expenses/AddExpenseForm';
import ExpensesList from '@/components/expenses/ExpensesList';

const ExpensePage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Expenses</h1>
        
        <Tabs defaultValue="list" className="space-y-6">
          <TabsList>
            <TabsTrigger value="list">Expenses List</TabsTrigger>
            <TabsTrigger value="add">Add Expense</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="space-y-6">
            <ExpensesList />
          </TabsContent>
          
          <TabsContent value="add" className="space-y-6">
            <div className="max-w-2xl mx-auto">
              <AddExpenseForm />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ExpensePage;
