
import React, { ReactNode } from 'react';
import AppHeader from './AppHeader';
import { useUser } from '@/contexts/UserContext';
import { Navigate } from 'react-router-dom';

interface DashboardLayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  requireAuth = true 
}) => {
  const { profile, isProfileComplete } = useUser();
  
  // If authentication is required but profile is not complete, redirect to profile page
  if (requireAuth && !isProfileComplete) {
    return <Navigate to="/profile" replace />;
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        {children}
      </main>
      <footer className="py-4 text-center text-sm text-muted-foreground border-t">
        <p>© 2025 WealthWise. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default DashboardLayout;
