
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface UserProfile {
  name: string;
  email: string;
  phoneNumber: string;
  username: string;
  monthlySalary: number;
}

interface UserContextType {
  profile: UserProfile | null;
  isProfileComplete: boolean;
  updateProfile: (profile: UserProfile) => void;
  addExtraIncome: (amount: number, description: string) => void;
  resetProfile: () => void;
}

const defaultProfile: UserProfile = {
  name: '',
  email: '',
  phoneNumber: '',
  username: '',
  monthlySalary: 0
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  useEffect(() => {
    // In a real app, this would load from an API or local storage
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, []);
  
  // Save profile to localStorage whenever it changes
  useEffect(() => {
    if (profile) {
      localStorage.setItem('userProfile', JSON.stringify(profile));
    }
  }, [profile]);
  
  const updateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
  };
  
  const addExtraIncome = (amount: number, description: string) => {
    if (!profile) return;
    
    // In a real app, this would also update the financial records
    // Here we're just updating the context
    // This would be integrated with the financial tracking system
    console.log(`Added extra income: ${amount} - ${description}`);
    
    // Add this to the FinancialContext in a real implementation
  };
  
  const resetProfile = () => {
    localStorage.removeItem('userProfile');
    setProfile(null);
  };
  
  const value = {
    profile,
    isProfileComplete: !!profile && !!profile.name && !!profile.email && !!profile.username && profile.monthlySalary > 0,
    updateProfile,
    addExtraIncome,
    resetProfile,
  };
  
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
