
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AddSavingForm from '@/components/savings/AddSavingForm';
import SavingsList from '@/components/savings/SavingsList';

const SavingsPage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Savings</h1>
        
        <Tabs defaultValue="list" className="space-y-6">
          <TabsList>
            <TabsTrigger value="list">Savings List</TabsTrigger>
            <TabsTrigger value="add">Add Saving Plan</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="space-y-6">
            <SavingsList />
          </TabsContent>
          
          <TabsContent value="add" className="space-y-6">
            <div className="max-w-2xl mx-auto">
              <AddSavingForm />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SavingsPage;
