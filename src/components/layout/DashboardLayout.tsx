
import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import AppHeader from './AppHeader';
import { Toaster } from "@/components/ui/toaster";
import { useUser } from '@/contexts/UserContext';
import { Loader2 } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  requireAuth = true 
}) => {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
        <Toaster />
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <AppHeader />
      <main className="flex-1 container mx-auto py-6 px-4 md:px-6">
        {children}
      </main>
      <Toaster />
    </div>
  );
};

export default DashboardLayout;
