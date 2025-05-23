
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  name: string;
  email: string;
  phoneNumber: string;
  username: string;
  monthlySalary: number;
}

interface UserContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isProfileComplete: boolean;
  hasSalarySetup: boolean;
  updateProfile: (profile: UserProfile) => Promise<void>;
  addExtraIncome: (amount: number, description: string) => Promise<void>;
  resetProfile: () => void;
  logout: () => Promise<void>;
  loading: boolean;
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
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasSalarySetup, setHasSalarySetup] = useState<boolean>(false);
  
  // Helper function to clean up auth tokens
  const cleanupAuthState = () => {
    // Remove standard auth tokens
    localStorage.removeItem('supabase.auth.token');
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
  };
  
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setHasSalarySetup(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);
  
  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
      setHasSalarySetup(false);
      setLoading(false);
      return;
    }
    
    if (data) {
      const userProfile: UserProfile = {
        name: data.name || '',
        email: data.email || '',
        phoneNumber: data.phone_number || '',
        username: data.username || '',
        monthlySalary: data.monthly_salary || 0
      };
      setProfile(userProfile);
      setHasSalarySetup(data.monthly_salary > 0);
    } else {
      setProfile(null);
      setHasSalarySetup(false);
    }
    
    setLoading(false);
  };
  
  const updateProfile = async (newProfile: UserProfile) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('profiles')
      .update({
        name: newProfile.name,
        email: newProfile.email,
        phone_number: newProfile.phoneNumber,
        username: newProfile.username,
        monthly_salary: newProfile.monthlySalary
      })
      .eq('id', user.id);
    
    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
    
    setProfile(newProfile);
    setHasSalarySetup(newProfile.monthlySalary > 0);
  };
  
  const addExtraIncome = async (amount: number, description: string) => {
    if (!user) return;
    
    // Add the extra income as a transaction
    const { error } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'income',
        category: 'extra_income',
        amount: amount,
        title: 'Extra Income',
        description: description,
        date: new Date().toISOString()
      });
    
    if (error) {
      console.error('Error adding extra income:', error);
      throw error;
    }
  };
  
  const resetProfile = () => {
    localStorage.removeItem('userProfile');
    setProfile(null);
    setHasSalarySetup(false);
  };
  
  const logout = async () => {
    cleanupAuthState();
    
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    if (error) {
      console.error('Error logging out:', error);
    }
    
    setProfile(null);
    setUser(null);
    setSession(null);
    setHasSalarySetup(false);
    
    // Force page reload for clean state
    window.location.href = '/auth';
  };
  
  const value = {
    user,
    session,
    profile,
    isProfileComplete: !!profile && !!profile.name && !!profile.email && !!profile.username,
    hasSalarySetup,
    updateProfile,
    addExtraIncome,
    resetProfile,
    logout,
    loading
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
