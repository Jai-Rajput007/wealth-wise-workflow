
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
  updateProfile: (profile: UserProfile) => Promise<void>;
  addExtraIncome: (amount: number, description: string) => void;
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
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
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
    } else {
      setProfile(null);
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
  };
  
  const addExtraIncome = (amount: number, description: string) => {
    if (!user) return;
    
    // This will be integrated with the FinancialContext
    console.log(`Added extra income: ${amount} - ${description}`);
  };
  
  const resetProfile = () => {
    localStorage.removeItem('userProfile');
    setProfile(null);
  };
  
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
    }
    setProfile(null);
    setUser(null);
    setSession(null);
  };
  
  const value = {
    user,
    session,
    profile,
    isProfileComplete: !!profile && !!profile.name && !!profile.email && !!profile.username && profile.monthlySalary > 0,
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
