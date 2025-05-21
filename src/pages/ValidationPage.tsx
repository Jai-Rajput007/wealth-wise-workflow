
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ValidationList from '@/components/validation/ValidationList';

const ValidationPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Pending Validations</h1>
        <p className="text-muted-foreground">Review and approve expense splits and other pending validations.</p>
        
        <ValidationList />
      </div>
    </DashboardLayout>
  );
};

export default ValidationPage;
