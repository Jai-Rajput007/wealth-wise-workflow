
import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import AppHeader from './AppHeader';
import { Toaster } from "@/components/ui/toaster";
import { useUser } from '@/contexts/UserContext';
import { Loader2 } from 'lucide-react';
import AppSidebar from './AppSidebar';

interface DashboardLayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
  showNav?: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  requireAuth = true,
  showNav = true
}) => {
  const { user, loading, profile, isProfileComplete } = useUser();

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

  // If the user is authenticated but doesn't have a salary set up, redirect to salary setup
  // Only redirect if not already on the salary setup page and not on the auth page
  if (user && profile && !profile.monthlySalary && window.location.pathname !== '/salary-setup' && window.location.pathname !== '/auth') {
    return <Navigate to="/salary-setup" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <AppHeader userName={profile?.username} />
      <div className="flex flex-1">
        {showNav && user && isProfileComplete && <AppSidebar />}
        <main className="flex-1 container mx-auto py-6 px-4 md:px-6">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
};

export default DashboardLayout;
