import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from './UserContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Define types for our financial data
export type ExpenseType = 'permanent' | 'temporary';
export type ExpenseCategory = 
  'rent' | 'food' | 'subscription' | 'recharge' | 'travel' | 
  'bill' | 'emi' | 'entertainment' | 'shopping' | 'other';

export type SavingsType = 'sip' | 'mutual_fund' | 'gullak' | 'fixed_deposit' | 'other';
export type TransactionType = 'expense' | 'income' | 'saving' | 'return';
export type Frequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'once';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string;
  type: ExpenseType;
  category: ExpenseCategory;
  description?: string;
  frequency?: Frequency;
  isSplit?: boolean;
  splitWith?: string;
  splitStatus?: 'pending' | 'approved' | 'rejected';
  isValidated: boolean;
}

export interface Saving {
  id: string;
  title: string;
  amount: number;
  date: string;
  type: SavingsType;
  description?: string;
  frequency: Frequency;
  returnRate?: number;
  returnFrequency?: Frequency;
  isValidated: boolean;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  date: string;
  type: TransactionType;
  category?: ExpenseCategory | SavingsType;
  description?: string;
  relatedId?: string; // Reference to the related expense or saving
}

export interface ValidationItem {
  id: string;
  title: string;
  amount: number;
  type: 'expense_split' | 'saving' | 'future_expense';
  date: string;
  expiresAt: string;
  description?: string;
  relatedId: string;
  initiatedBy?: string;
}

interface FinancialContextProps {
  expenses: Expense[];
  savings: Saving[];
  transactions: Transaction[];
  validations: ValidationItem[];
  remainingMoney: number;
  totalSaved: number;
  addExpense: (expense: Omit<Expense, 'id' | 'isValidated'>) => Promise<string>;
  addSaving: (saving: Omit<Saving, 'id' | 'isValidated'>) => Promise<string>;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  validateItem: (id: string, isApproved: boolean) => Promise<void>;
  getExpenseById: (id: string) => Expense | undefined;
  getSavingById: (id: string) => Saving | undefined;
  loading: boolean;
}

const FinancialContext = createContext<FinancialContextProps | undefined>(undefined);

export const FinancialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, profile } = useUser();
  const { toast } = useToast();
  
  // Initialize state
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [savings, setSavings] = useState<Saving[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [validations, setValidations] = useState<ValidationItem[]>([]);
  const [remainingMoney, setRemainingMoney] = useState<number>(0);
  const [totalSaved, setTotalSaved] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Load data from Supabase when user changes
  useEffect(() => {
    if (user) {
      fetchExpenses();
      fetchSavings();
      fetchTransactions();
      fetchValidations();
    } else {
      setExpenses([]);
      setSavings([]);
      setTransactions([]);
      setValidations([]);
      setRemainingMoney(0);
      setTotalSaved(0);
    }
  }, [user]);
  
  // Fetch functions for getting data from Supabase
  const fetchExpenses = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id);
      
    if (error) {
      console.error('Error fetching expenses:', error);
      return;
    }
    
    if (data) {
      const mappedExpenses = data.map(item => ({
        id: item.id,
        title: item.title,
        amount: item.amount,
        date: item.date,
        type: item.type as ExpenseType,
        category: item.category as ExpenseCategory,
        description: item.description,
        frequency: item.frequency as Frequency | undefined,
        isSplit: item.is_split,
        splitWith: item.split_with,
        splitStatus: item.split_status as 'pending' | 'approved' | 'rejected' | undefined,
        isValidated: item.is_validated
      }));
      setExpenses(mappedExpenses);
    }
    setLoading(false);
  };
  
  const fetchSavings = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('savings')
      .select('*')
      .eq('user_id', user.id);
      
    if (error) {
      console.error('Error fetching savings:', error);
      return;
    }
    
    if (data) {
      const mappedSavings = data.map(item => ({
        id: item.id,
        title: item.title,
        amount: item.amount,
        date: item.date,
        type: item.type as SavingsType,
        description: item.description,
        frequency: item.frequency as Frequency,
        returnRate: item.return_rate,
        returnFrequency: item.return_frequency as Frequency | undefined,
        isValidated: item.is_validated
      }));
      setSavings(mappedSavings);
    }
    setLoading(false);
  };
  
  const fetchTransactions = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id);
      
    if (error) {
      console.error('Error fetching transactions:', error);
      return;
    }
    
    if (data) {
      const mappedTransactions = data.map(item => ({
        id: item.id,
        title: item.title,
        amount: item.amount,
        date: item.date,
        type: item.type as TransactionType,
        category: item.category as (ExpenseCategory | SavingsType) | undefined,
        description: item.description,
        relatedId: item.related_id
      }));
      setTransactions(mappedTransactions);
    }
    setLoading(false);
  };
  
  const fetchValidations = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('validations')
      .select('*')
      .eq('user_id', user.id);
      
    if (error) {
      console.error('Error fetching validations:', error);
      return;
    }
    
    if (data) {
      const mappedValidations = data.map(item => ({
        id: item.id,
        title: item.title,
        amount: item.amount,
        type: item.type as 'expense_split' | 'saving' | 'future_expense',
        date: item.date,
        expiresAt: item.expires_at,
        description: item.description,
        relatedId: item.related_id,
        initiatedBy: item.initiated_by
      }));
      setValidations(mappedValidations);
    }
    setLoading(false);
  };
  
  // Calculate financial summaries
  useEffect(() => {
    if (!profile) {
      setRemainingMoney(0);
      return;
    }
    
    // Calculate total expenses
    const totalExpenses = expenses
      .filter(expense => expense.isValidated)
      .reduce((sum, expense) => sum + expense.amount, 0);
    
    // Calculate total savings
    const totalSavingsAmount = savings
      .filter(saving => saving.isValidated)
      .reduce((sum, saving) => sum + saving.amount, 0);
    
    setTotalSaved(totalSavingsAmount);
    
    // Calculate additional income from transactions
    const additionalIncome = transactions
      .filter(transaction => transaction.type === 'income' || transaction.type === 'return')
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    
    // Calculate remaining money
    const remaining = (profile?.monthlySalary || 0) + additionalIncome - totalExpenses - totalSavingsAmount;
    setRemainingMoney(remaining);
  }, [profile, expenses, savings, transactions]);
  
  // Add new expense
  const addExpense = async (newExpense: Omit<Expense, 'id' | 'isValidated'>): Promise<string> => {
    if (!user) throw new Error('User not authenticated');
    
    // Check if expense date is in the future
    const expenseDate = new Date(newExpense.date);
    const currentDate = new Date();
    const isFutureExpense = expenseDate > currentDate;
    
    // Calculate the effective amount based on split
    let effectiveAmount = newExpense.amount;
    if (newExpense.isSplit && newExpense.splitWith) {
      // If expense is split, only half of it affects this user
      effectiveAmount = newExpense.amount / 2;
    }
    
    // If it's a future expense, add to validations instead
    if (isFutureExpense && newExpense.type === 'temporary') {
      // Add to expenses but mark as not validated
      const { data: expenseData, error: expenseError } = await supabase
        .from('expenses')
        .insert([{
          user_id: user.id,
          title: newExpense.title,
          amount: effectiveAmount, // Use the effective amount
          date: newExpense.date,
          type: newExpense.type,
          category: newExpense.category,
          description: newExpense.description,
          frequency: newExpense.frequency,
          is_split: newExpense.isSplit || false,
          split_with: newExpense.splitWith,
          split_status: newExpense.splitStatus,
          is_validated: false
        }])
        .select('id')
        .single();
        
      if (expenseError) {
        console.error('Error creating expense:', expenseError);
        throw expenseError;
      }
      
      // Also add to validations
      const validationExpires = expenseDate;
      const { data: validationData, error: validationError } = await supabase
        .from('validations')
        .insert([{
          user_id: user.id,
          title: `Future expense: ${newExpense.title}`,
          amount: effectiveAmount, // Use the effective amount
          type: 'future_expense',
          date: newExpense.date,
          expires_at: expenseDate.toISOString(),
          description: newExpense.description,
          related_id: expenseData!.id
        }])
        .select('id')
        .single();
        
      if (validationError) {
        console.error('Error creating validation:', validationError);
        throw validationError;
      }
      
      // Update local state
      const expense: Expense = {
        ...newExpense,
        id: expenseData!.id,
        isValidated: false
      };
      
      setExpenses(prev => [...prev, expense]);
      
      const validationItem: ValidationItem = {
        id: validationData!.id,
        title: `Future expense: ${newExpense.title}`,
        amount: effectiveAmount, // Use the effective amount
        type: 'future_expense',
        date: newExpense.date,
        expiresAt: expenseDate.toISOString(),
        description: newExpense.description,
        relatedId: expenseData!.id
      };
      
      setValidations(prev => [...prev, validationItem]);
      
      toast({
        title: "Future expense added",
        description: "This expense will appear in your validations section until the scheduled date.",
      });
      
      return expenseData!.id;
    }
    
    // If it's a regular expense (temporary and not future, or permanent)
    const { data, error } = await supabase
      .from('expenses')
      .insert([{
        user_id: user.id,
        title: newExpense.title,
        amount: effectiveAmount, // Use the effective amount
        date: newExpense.date,
        type: newExpense.type,
        category: newExpense.category,
        description: newExpense.description,
        frequency: newExpense.frequency,
        is_split: newExpense.isSplit || false,
        split_with: newExpense.splitWith,
        split_status: newExpense.isSplit ? 'pending' : undefined,
        is_validated: newExpense.type === 'temporary' && !isFutureExpense // Only temporary expenses that are not in the future are auto-validated
      }])
      .select('id')
      .single();
      
    if (error) {
      console.error('Error creating expense:', error);
      throw error;
    }
    
    const expense: Expense = {
      ...newExpense,
      amount: effectiveAmount, // Use the effective amount
      id: data!.id,
      isValidated: newExpense.type === 'temporary' && !isFutureExpense
    };
    
    setExpenses(prev => [...prev, expense]);
    
    // Add to transactions if validated (temporary expenses that are not future)
    if (newExpense.type === 'temporary' && !isFutureExpense) {
      await addTransaction({
        title: newExpense.title,
        amount: effectiveAmount, // Use the effective amount
        date: newExpense.date,
        type: 'expense',
        category: newExpense.category,
        description: newExpense.description,
        relatedId: data!.id
      });
    }
    
    // If it's a split expense, add to validations for the other user
    if (newExpense.isSplit && newExpense.splitWith) {
      const validationExpires = new Date();
      validationExpires.setDate(validationExpires.getDate() + 1); // 24 hours to validate
      
      // Find the user with the provided username
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', newExpense.splitWith)
        .single();
        
      if (userError || !userData) {
        console.error('Error finding user for split:', userError);
        toast({
          title: "User not found",
          description: `Could not find user with username ${newExpense.splitWith}`,
          variant: "destructive"
        });
      } else {
        // Add validation for the other user
        const { data: validationData, error: validationError } = await supabase
          .from('validations')
          .insert([{
            user_id: userData.id, // The other user's ID
            title: `Split expense: ${newExpense.title}`,
            amount: effectiveAmount, // This is already half the total
            type: 'expense_split',
            date: newExpense.date,
            expires_at: validationExpires.toISOString(),
            description: newExpense.description,
            related_id: data!.id,
            initiated_by: user.id
          }])
          .select('id')
          .single();
          
        if (validationError) {
          console.error('Error creating validation for other user:', validationError);
          toast({
            title: "Split notification failed",
            description: `Failed to notify ${newExpense.splitWith} about the split expense.`,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Split expense added",
            description: `${newExpense.splitWith} has been notified to approve this split expense.`,
          });
        }
      }
    }
    
    return data!.id;
  };
  
  // Add new saving
  const addSaving = async (newSaving: Omit<Saving, 'id' | 'isValidated'>): Promise<string> => {
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('savings')
      .insert([{
        user_id: user.id,
        title: newSaving.title,
        amount: newSaving.amount,
        date: newSaving.date,
        type: newSaving.type,
        description: newSaving.description,
        frequency: newSaving.frequency,
        return_rate: newSaving.returnRate,
        return_frequency: newSaving.returnFrequency,
        is_validated: false
      }])
      .select('id')
      .single();
      
    if (error) {
      console.error('Error creating saving:', error);
      throw error;
    }
    
    const saving: Saving = {
      ...newSaving,
      id: data!.id,
      isValidated: false
    };
    
    setSavings(prev => [...prev, saving]);
    
    // Add to validations
    const validationExpires = new Date();
    
    // Set expiration based on frequency
    switch (newSaving.frequency) {
      case 'daily':
        validationExpires.setDate(validationExpires.getDate() + 1);
        break;
      case 'weekly':
        validationExpires.setDate(validationExpires.getDate() + 7);
        break;
      case 'monthly':
        validationExpires.setMonth(validationExpires.getMonth() + 1);
        break;
      default:
        validationExpires.setDate(validationExpires.getDate() + 1);
    }
    
    const { data: validationData, error: validationError } = await supabase
      .from('validations')
      .insert([{
        user_id: user.id,
        title: `Validate saving: ${newSaving.title}`,
        amount: newSaving.amount,
        type: 'saving',
        date: newSaving.date,
        expires_at: validationExpires.toISOString(),
        description: newSaving.description,
        related_id: data!.id
      }])
      .select('id')
      .single();
    
    if (validationError) {
      console.error('Error creating validation:', validationError);
      throw validationError;
    }
    
    const validationItem: ValidationItem = {
      id: validationData!.id,
      title: `Validate saving: ${newSaving.title}`,
      amount: newSaving.amount,
      type: 'saving',
      date: newSaving.date,
      expiresAt: validationExpires.toISOString(),
      description: newSaving.description,
      relatedId: data!.id
    };
    
    setValidations(prev => [...prev, validationItem]);
    
    return data!.id;
  };
  
  // Add transaction
  const addTransaction = async (newTransaction: Omit<Transaction, 'id'>): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        user_id: user.id,
        title: newTransaction.title,
        amount: newTransaction.amount,
        date: newTransaction.date,
        type: newTransaction.type,
        category: newTransaction.category,
        description: newTransaction.description,
        related_id: newTransaction.relatedId
      }])
      .select('id')
      .single();
      
    if (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
    
    const transaction: Transaction = {
      ...newTransaction,
      id: data!.id
    };
    
    setTransactions(prev => [...prev, transaction]);
  };
  
  // Validate an item (expense split, saving, or future expense)
  const validateItem = async (id: string, isApproved: boolean): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    const validation = validations.find(v => v.id === id);
    if (!validation) return;
    
    if (validation.type === 'expense_split') {
      // Handle expense split validation
      // Get the original expense details
      const { data: originalExpense, error: fetchError } = await supabase
        .from('expenses')
        .select('*')
        .eq('id', validation.relatedId)
        .single();
        
      if (fetchError || !originalExpense) {
        console.error('Error fetching original expense:', fetchError);
        throw fetchError;
      }
      
      if (isApproved) {
        // Update the expense's split status
        const { error } = await supabase
          .from('expenses')
          .update({ split_status: 'approved' })
          .eq('id', validation.relatedId);
          
        if (error) {
          console.error('Error updating expense:', error);
          throw error;
        }
        
        // Add a new expense for the current user (the one who approved)
        const { error: createError } = await supabase
          .from('expenses')
          .insert([{
            user_id: user.id,
            title: `Split: ${originalExpense.title}`,
            amount: validation.amount,
            date: new Date().toISOString(),
            type: originalExpense.type,
            category: originalExpense.category,
            description: `Split payment for ${originalExpense.title}`,
            is_validated: true
          }]);
          
        if (createError) {
          console.error('Error creating expense for split:', createError);
          throw createError;
        }
        
        // Reload expenses
        fetchExpenses();
        
        // Add a transaction for the split
        await addTransaction({
          title: `Split: ${originalExpense.title}`,
          amount: validation.amount,
          date: new Date().toISOString(),
          type: 'expense',
          category: originalExpense.category as ExpenseCategory,
          description: `Split payment for ${originalExpense.title}`,
          relatedId: validation.relatedId
        });
        
        toast({
          title: "Split expense approved",
          description: `You have approved to pay ${validation.amount.toLocaleString()} for this split expense.`,
        });
      } else {
        // Mark as rejected
        const { error } = await supabase
          .from('expenses')
          .update({ split_status: 'rejected' })
          .eq('id', validation.relatedId);
          
        if (error) {
          console.error('Error updating expense:', error);
          throw error;
        }
        
        toast({
          title: "Split expense rejected",
          description: `You have rejected this split expense.`,
        });
        
        // Notify the original creator
        // This would be better implemented with a proper notification system
        console.log(`User ${user.id} rejected split expense ${validation.relatedId}`);
      }
    } else if (validation.type === 'saving') {
      // Handle saving validation
      const saving = savings.find(s => s.id === validation.relatedId);
      if (saving && isApproved) {
        // Mark saving as validated
        const { error } = await supabase
          .from('savings')
          .update({ is_validated: true })
          .eq('id', saving.id);
          
        if (error) {
          console.error('Error updating saving:', error);
          throw error;
        }
        
        setSavings(prev => 
          prev.map(s => 
            s.id === saving.id 
              ? { ...s, isValidated: true } 
              : s
          )
        );
        
        // Add a transaction for the saving
        await addTransaction({
          title: saving.title,
          amount: saving.amount,
          date: new Date().toISOString(),
          type: 'saving',
          category: saving.type,
          description: saving.description,
          relatedId: saving.id
        });
      }
    } else if (validation.type === 'future_expense') {
      // Handle future expense validation
      const expense = expenses.find(e => e.id === validation.relatedId);
      if (expense) {
        if (isApproved) {
          // Mark expense as validated
          const { error } = await supabase
            .from('expenses')
            .update({ is_validated: true })
            .eq('id', expense.id);
            
          if (error) {
            console.error('Error updating expense:', error);
            throw error;
          }
          
          setExpenses(prev => 
            prev.map(e => 
              e.id === expense.id 
                ? { ...e, isValidated: true } 
                : e
            )
          );
          
          // Add a transaction for the expense
          await addTransaction({
            title: expense.title,
            amount: expense.amount,
            date: new Date().toISOString(),
            type: 'expense',
            category: expense.category,
            description: expense.description,
            relatedId: expense.id
          });
        } else {
          // Delete the expense if rejected
          const { error: deleteError } = await supabase
            .from('expenses')
            .delete()
            .eq('id', expense.id);
            
          if (deleteError) {
            console.error('Error deleting expense:', deleteError);
            throw deleteError;
          }
          
          setExpenses(prev => prev.filter(e => e.id !== expense.id));
        }
      }
    }
    
    // Remove the validation item
    const { error } = await supabase
      .from('validations')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting validation:', error);
      throw error;
    }
    
    setValidations(prev => prev.filter(v => v.id !== id));
  };
  
  // Utility functions to get expenses and savings by ID
  const getExpenseById = (id: string): Expense | undefined => {
    return expenses.find(e => e.id === id);
  };
  
  const getSavingById = (id: string): Saving | undefined => {
    return savings.find(s => s.id === id);
  };
  
  const contextValue: FinancialContextProps = {
    expenses,
    savings,
    transactions,
    validations,
    remainingMoney,
    totalSaved,
    addExpense,
    addSaving,
    addTransaction,
    validateItem,
    getExpenseById,
    getSavingById,
    loading
  };
  
  return (
    <FinancialContext.Provider value={contextValue}>
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = (): FinancialContextProps => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};
