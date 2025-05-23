import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from './UserContext';
import { useToast } from '@/hooks/use-toast';

// Export types to resolve TypeScript errors in other components
export type SavingsType = 'sip' | 'mutual_fund' | 'gullak' | 'fixed_deposit' | 'other';
export type ExpenseType = 'permanent' | 'temporary';
export type ExpenseCategory = 'rent' | 'food' | 'subscription' | 'recharge' | 'travel' | 
                             'bill' | 'emi' | 'entertainment' | 'shopping' | 'other';
export type Frequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'once';

export interface Expense {
  id: string;
  userId: string;
  title: string;
  amount: number;
  date: string;
  category: ExpenseCategory;
  type: ExpenseType;
  description?: string;
  frequency?: Frequency;
  isSplit: boolean;
  splitWith?: string;
  splitStatus?: string;
  isValidated: boolean;
  createdAt: string;
}

export interface Saving {
  id: string;
  userId: string;
  title: string;
  amount: number;
  date: string;
  type: SavingsType;
  description?: string;
  frequency: Frequency;
  returnRate?: number;
  returnFrequency?: Frequency;
  isValidated: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'expense' | 'income' | 'saving' | 'return';
  title: string;
  amount: number;
  date: string;
  category?: string;
  description?: string;
  relatedId?: string;
  createdAt: string;
}

export interface Validation {
  id: string;
  userId: string;
  type: string;
  title: string;
  amount: number;
  date: string;
  relatedId: string;
  description?: string;
  initiatedBy?: string;
  createdAt: string;
  expiresAt: string;
}

interface FinancialContextType {
  expenses: Expense[];
  savings: Saving[];
  transactions: Transaction[];
  validations: Validation[];
  remainingMoney: number;
  totalSaved: number;
  addExpense: (expense: Omit<Expense, 'id' | 'userId' | 'createdAt' | 'isValidated'>) => Promise<void>;
  addSaving: (saving: Omit<Saving, 'id' | 'userId' | 'createdAt' | 'isValidated'>) => Promise<void>;
  validateItem: (id: string, approved: boolean) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  deleteSaving: (id: string) => Promise<void>;
  addIncome: (amount: number, title: string, description?: string) => Promise<void>;
  loading: boolean;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

interface FinancialProviderProps {
  children: ReactNode;
}

export const FinancialProvider: React.FC<FinancialProviderProps> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [savings, setSavings] = useState<Saving[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [validations, setValidations] = useState<Validation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user, profile } = useUser();
  const { toast } = useToast();
  
  // Calculate remaining money based on salary and expenses
  const remainingMoney = React.useMemo(() => {
    const monthlySalary = profile?.monthlySalary || 0;
    
    // Ensure we're correctly summing up all income transactions
    const extraIncome = transactions
      .filter(t => t.type === 'income' || t.type === 'return')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = expenses
      .filter(e => e.isValidated)
      .reduce((sum, e) => sum + e.amount, 0);
      
    return monthlySalary + extraIncome - totalExpenses;
  }, [profile, expenses, transactions]);
  
  // Calculate total saved money
  const totalSaved = React.useMemo(() => {
    return savings
      .filter(s => s.isValidated)
      .reduce((sum, s) => sum + s.amount, 0);
  }, [savings]);
  
  // Fetch financial data when user is authenticated
  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      setExpenses([]);
      setSavings([]);
      setTransactions([]);
      setValidations([]);
      setLoading(false);
    }
  }, [user]);
  
  // Fetch all financial data from the database
  const fetchData = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      await Promise.all([
        fetchExpenses(),
        fetchSavings(),
        fetchTransactions(),
        fetchValidations()
      ]);
    } catch (error) {
      console.error("Error fetching financial data:", error);
      toast({
        title: "Error fetching data",
        description: "Could not load your financial information.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch expenses from the database
  const fetchExpenses = async () => {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user!.id)
      .order('date', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    if (data) {
      const formattedExpenses: Expense[] = data.map(item => ({
        id: item.id,
        userId: item.user_id,
        title: item.title,
        amount: item.amount,
        date: item.date,
        category: item.category as ExpenseCategory,
        type: item.type as ExpenseType,
        description: item.description,
        frequency: item.frequency as Frequency,
        isSplit: item.is_split || false,
        splitWith: item.split_with,
        splitStatus: item.split_status,
        isValidated: item.is_validated,
        createdAt: item.created_at
      }));
      
      setExpenses(formattedExpenses);
    }
  };
  
  // Fetch savings from the database
  const fetchSavings = async () => {
    const { data, error } = await supabase
      .from('savings')
      .select('*')
      .eq('user_id', user!.id)
      .order('date', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    if (data) {
      const formattedSavings: Saving[] = data.map(item => ({
        id: item.id,
        userId: item.user_id,
        title: item.title,
        amount: item.amount,
        date: item.date,
        type: item.type as SavingsType,
        description: item.description,
        frequency: item.frequency as Frequency,
        returnRate: item.return_rate,
        returnFrequency: item.return_frequency as Frequency,
        isValidated: item.is_validated,
        createdAt: item.created_at
      }));
      
      setSavings(formattedSavings);
    }
  };
  
  // Fetch transactions from the database
  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user!.id)
      .order('date', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    if (data) {
      const formattedTransactions: Transaction[] = data.map(item => ({
        id: item.id,
        userId: item.user_id,
        type: item.type as 'expense' | 'income' | 'saving' | 'return',
        title: item.title,
        amount: item.amount,
        date: item.date,
        category: item.category,
        description: item.description,
        relatedId: item.related_id,
        createdAt: item.created_at
      }));
      
      setTransactions(formattedTransactions);
    }
  };
  
  // Fetch validations from the database
  const fetchValidations = async () => {
    const { data, error } = await supabase
      .from('validations')
      .select('*')
      .eq('user_id', user!.id)
      .order('date', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    if (data) {
      const formattedValidations: Validation[] = data.map(item => ({
        id: item.id,
        userId: item.user_id,
        type: item.type,
        title: item.title,
        amount: item.amount,
        date: item.date,
        relatedId: item.related_id,
        description: item.description,
        initiatedBy: item.initiated_by,
        createdAt: item.created_at,
        expiresAt: item.expires_at
      }));
      
      setValidations(formattedValidations);
    }
  };

  // Add a new expense to the database
  const addExpense = async (expense: Omit<Expense, 'id' | 'userId' | 'createdAt' | 'isValidated'>) => {
    if (!user) return;
    
    try {
      const expenseDate = new Date(expense.date);
      const currentDate = new Date();
      
      // Check if this is a future expense (scheduled for future date)
      const isFutureExpense = expenseDate > currentDate;
      
      // If this is a split expense, we need to handle it differently
      if (expense.isSplit && expense.splitWith) {
        return await handleSplitExpense(expense);
      }
      
      // For future expenses, create a validation request
      if (isFutureExpense) {
        const { data, error } = await supabase
          .from('validations')
          .insert({
            user_id: user.id,
            type: 'future_expense',
            title: expense.title,
            amount: expense.amount,
            date: expense.date,
            related_id: user.id, // Using user.id as placeholder since we don't have an expense id yet
            description: expense.description || 'Scheduled expense',
            expires_at: expense.date // Expires on the scheduled date
          })
          .select();
          
        if (error) throw error;
        
        toast({
          title: "Expense scheduled",
          description: `Your expense has been scheduled for ${new Date(expense.date).toLocaleDateString()}`
        });
        
        await fetchData();
        return;
      }
      
      // Regular expense
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          user_id: user.id,
          title: expense.title,
          amount: expense.amount,
          date: expense.date,
          category: expense.category,
          type: expense.type,
          description: expense.description,
          frequency: expense.frequency,
          is_split: expense.isSplit || false,
          is_validated: true
        })
        .select();
      
      if (error) throw error;
      
      // Record transaction
      await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'expense',
          title: expense.title,
          amount: expense.amount,
          date: expense.date,
          category: expense.category,
          description: expense.description,
          related_id: data?.[0]?.id
        });
      
      await fetchData();
      
      toast({
        title: "Expense added",
        description: "Your expense has been recorded."
      });
    } catch (error) {
      console.error("Error adding expense:", error);
      toast({
        title: "Error adding expense",
        description: "Failed to add your expense.",
        variant: "destructive"
      });
    }
  };

  // Handle split expense functionality
  const handleSplitExpense = async (expense: Omit<Expense, 'id' | 'userId' | 'createdAt' | 'isValidated'>) => {
    if (!user || !expense.splitWith) return;
    
    try {
      // Find the other user by username
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', expense.splitWith.trim())
        .maybeSingle();
      
      if (userError) {
        console.error("Error finding user:", userError);
        toast({
          title: "Error finding user",
          description: `Could not find user "${expense.splitWith}"`,
          variant: "destructive"
        });
        return;
      }
      
      if (!userData) {
        toast({
          title: "User not found",
          description: `User "${expense.splitWith}" does not exist.`,
          variant: "destructive"
        });
        return;
      }
      
      const otherUserId = userData.id;
      
      // Calculate split amount (50/50 split)
      const splitAmount = expense.amount / 2;
      
      // Insert the expense for the current user (already validated)
      const { data: currentUserExpense, error: expenseError } = await supabase
        .from('expenses')
        .insert({
          user_id: user.id,
          title: expense.title,
          amount: splitAmount, // Half of the total
          date: expense.date,
          category: expense.category,
          type: expense.type,
          description: expense.description,
          frequency: expense.frequency,
          is_split: true,
          split_with: expense.splitWith,
          split_status: 'initiated',
          is_validated: true
        })
        .select();
      
      if (expenseError) throw expenseError;
      
      // Create a validation request for the other user
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + 7); // Expires in 7 days
      
      await supabase
        .from('validations')
        .insert({
          user_id: otherUserId,
          type: 'split_expense',
          title: `Split expense: ${expense.title}`,
          amount: splitAmount,
          date: expense.date,
          related_id: currentUserExpense[0].id,
          description: `${profile?.username || 'Someone'} wants to split this expense with you.`,
          initiated_by: profile?.username || user.id,
          expires_at: expireDate.toISOString()
        });
      
      // Record transaction for current user
      await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'expense',
          title: `${expense.title} (Split)`,
          amount: splitAmount,
          date: expense.date,
          category: expense.category,
          description: `Split with ${expense.splitWith}`,
          related_id: currentUserExpense[0].id
        });
      
      await fetchData();
      
      toast({
        title: "Split expense added",
        description: `A split request has been sent to ${expense.splitWith}.`
      });
    } catch (error) {
      console.error("Error with split expense:", error);
      toast({
        title: "Error with split expense",
        description: "Failed to process split expense.",
        variant: "destructive"
      });
    }
  };

  // Add a new saving to the database
  const addSaving = async (saving: Omit<Saving, 'id' | 'userId' | 'createdAt' | 'isValidated'>) => {
    if (!user) return;
    
    try {
      // Always create a validated savings entry
      const { data, error } = await supabase
        .from('savings')
        .insert({
          user_id: user.id,
          title: saving.title,
          amount: saving.amount,
          date: saving.date,
          type: saving.type,
          description: saving.description,
          frequency: saving.frequency,
          return_rate: saving.returnRate,
          return_frequency: saving.returnFrequency,
          is_validated: true
        })
        .select();
      
      if (error) throw error;
      
      // Record transaction
      await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'saving',
          title: saving.title,
          amount: saving.amount,
          date: saving.date,
          category: saving.type,
          description: saving.description,
          related_id: data?.[0]?.id
        });

      // If saving has a return rate and frequency, calculate potential returns
      if (saving.returnRate && saving.returnFrequency) {
        await handleSavingsReturns(saving, data?.[0]?.id);
      }
      
      await fetchData();
      
      toast({
        title: "Saving added",
        description: "Your saving has been recorded."
      });
    } catch (error) {
      console.error("Error adding saving:", error);
      toast({
        title: "Error adding saving",
        description: "Failed to add your saving.",
        variant: "destructive"
      });
    }
  };

  // Handle savings returns calculations
  const handleSavingsReturns = async (saving: Omit<Saving, 'id' | 'userId' | 'createdAt' | 'isValidated'>, savingId: string) => {
    if (!saving.returnRate || !saving.returnFrequency || !user) return;
    
    try {
      // Calculate return amount based on frequency
      const returnAmount = saving.amount * (saving.returnRate / 100);
      const returnDate = new Date(saving.date);
      
      // Depending on return frequency, set appropriate date for the return
      switch (saving.returnFrequency) {
        case 'daily':
          returnDate.setDate(returnDate.getDate() + 1);
          break;
        case 'weekly':
          returnDate.setDate(returnDate.getDate() + 7);
          break;
        case 'monthly':
          returnDate.setMonth(returnDate.getMonth() + 1);
          break;
        case 'quarterly':
          returnDate.setMonth(returnDate.getMonth() + 3);
          break;
        case 'yearly':
          returnDate.setFullYear(returnDate.getFullYear() + 1);
          break;
        default:
          // If unknown frequency, don't create a return
          return;
      }
      
      // Create a validation request for the return
      const { data, error } = await supabase
        .from('validations')
        .insert({
          user_id: user.id,
          type: 'saving_return',
          title: `Return on ${saving.title}`,
          amount: returnAmount,
          date: returnDate.toISOString(),
          related_id: savingId,
          description: `${saving.returnRate}% return on your ${saving.title} investment`,
          expires_at: new Date(returnDate.getTime() + 24 * 60 * 60 * 1000).toISOString() // Expires 1 day after return date
        })
        .select();
      
      if (error) {
        console.error("Error creating return validation:", error);
      }
    } catch (error) {
      console.error("Error processing savings returns:", error);
    }
  };

  // Add extra income
  const addIncome = async (amount: number, title: string, description?: string) => {
    if (!user) return;
    
    try {
      // Record transaction for the income
      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'income',
          title: title,
          amount: amount,
          date: new Date().toISOString(),
          category: 'extra_income',
          description: description || 'Extra income'
        });
      
      if (error) {
        console.error("Error adding income to database:", error);
        throw error;
      }
      
      // Refetch transactions to update the UI
      await fetchTransactions();
      
      toast({
        title: "Income added",
        description: `Added ₹${amount} to your balance.`
      });
    } catch (error) {
      console.error("Error adding income:", error);
      toast({
        title: "Error adding income",
        description: "Failed to add your income.",
        variant: "destructive"
      });
      throw error; // Re-throw to handle in the form
    }
  };

  // Validate or reject a pending validation item
  const validateItem = async (id: string, approved: boolean) => {
    if (!user) return;
    
    try {
      // Get the validation item first
      const { data: validationData, error: validationError } = await supabase
        .from('validations')
        .select('*')
        .eq('id', id)
        .single();
      
      if (validationError) throw validationError;
      if (!validationData) {
        toast({
          title: "Validation not found",
          description: "The validation item could not be found.",
          variant: "destructive"
        });
        return;
      }
      
      // Handle different validation types
      switch (validationData.type) {
        case 'split_expense':
          await handleSplitExpenseValidation(validationData, approved);
          break;
        case 'future_expense':
          await handleFutureExpenseValidation(validationData, approved);
          break;
        case 'saving_return':
          await handleSavingReturnValidation(validationData, approved);
          break;
        default:
          // Unknown validation type
          console.warn("Unknown validation type:", validationData.type);
      }
      
      // Delete the validation item
      await supabase
        .from('validations')
        .delete()
        .eq('id', id);
      
      await fetchData();
      
      toast({
        title: approved ? "Request approved" : "Request rejected",
        description: approved ? "The request has been approved." : "The request has been rejected."
      });
    } catch (error) {
      console.error("Error validating item:", error);
      toast({
        title: "Error processing validation",
        description: "Failed to process the validation.",
        variant: "destructive"
      });
    }
  };

  // Handle split expense validation logic
  const handleSplitExpenseValidation = async (validation: any, approved: boolean) => {
    if (!user) return;
    
    try {
      if (approved) {
        // Get the original expense to update its status
        const { data: originalExpense, error: expenseError } = await supabase
          .from('expenses')
          .select('*')
          .eq('id', validation.related_id)
          .single();
        
        if (expenseError) throw expenseError;
        
        // Create a new expense for the current user
        const { data: newExpense, error: newExpenseError } = await supabase
          .from('expenses')
          .insert({
            user_id: user.id,
            title: validation.title.replace('Split expense: ', ''),
            amount: validation.amount,
            date: validation.date,
            category: originalExpense?.category || 'other',
            type: originalExpense?.type || 'temporary',
            description: `Split expense with ${validation.initiated_by || 'someone'}`,
            is_split: true,
            split_with: validation.initiated_by,
            split_status: 'accepted',
            is_validated: true
          })
          .select();
        
        if (newExpenseError) throw newExpenseError;
        
        // Update the original expense status
        await supabase
          .from('expenses')
          .update({
            split_status: 'accepted'
          })
          .eq('id', validation.related_id);
        
        // Record transaction for the current user
        await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            type: 'expense',
            title: validation.title.replace('Split expense: ', ''),
            amount: validation.amount,
            date: validation.date,
            category: originalExpense?.category || 'other',
            description: `Split expense with ${validation.initiated_by || 'someone'}`,
            related_id: newExpense?.[0]?.id
          });
      } else {
        // Rejected split - update the original expense status
        await supabase
          .from('expenses')
          .update({
            split_status: 'rejected'
          })
          .eq('id', validation.related_id);
      }
    } catch (error) {
      console.error("Error handling split expense validation:", error);
      throw error;
    }
  };

  // Handle future expense validation logic
  const handleFutureExpenseValidation = async (validation: any, approved: boolean) => {
    if (!user) return;
    
    try {
      if (approved) {
        // Create the expense now that it's approved
        const { data: newExpense, error: expenseError } = await supabase
          .from('expenses')
          .insert({
            user_id: user.id,
            title: validation.title,
            amount: validation.amount,
            date: validation.date,
            category: 'other', // Default category
            type: 'temporary', // Default type
            description: validation.description,
            is_validated: true
          })
          .select();
        
        if (expenseError) throw expenseError;
        
        // Record transaction
        await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            type: 'expense',
            title: validation.title,
            amount: validation.amount,
            date: validation.date,
            description: validation.description,
            related_id: newExpense?.[0]?.id
          });
      }
    } catch (error) {
      console.error("Error handling future expense validation:", error);
      throw error;
    }
  };

  // Handle saving return validation logic
  const handleSavingReturnValidation = async (validation: any, approved: boolean) => {
    if (!user) return;
    
    try {
      if (approved) {
        // Add the return as income
        await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            type: 'return',
            title: validation.title,
            amount: validation.amount,
            date: new Date().toISOString(),
            category: 'investment_return',
            description: validation.description,
            related_id: validation.related_id
          });
      }
    } catch (error) {
      console.error("Error handling saving return validation:", error);
      throw error;
    }
  };

  // Delete an expense
  const deleteExpense = async (id: string) => {
    if (!user) return;
    
    try {
      // Delete the expense
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Delete associated transactions
      await supabase
        .from('transactions')
        .delete()
        .eq('related_id', id);
      
      await fetchData();
      
      toast({
        title: "Expense deleted",
        description: "Your expense has been removed."
      });
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast({
        title: "Error deleting expense",
        description: "Failed to delete the expense.",
        variant: "destructive"
      });
    }
  };

  // Delete a saving
  const deleteSaving = async (id: string) => {
    if (!user) return;
    
    try {
      // Delete the saving
      const { error } = await supabase
        .from('savings')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Delete associated transactions
      await supabase
        .from('transactions')
        .delete()
        .eq('related_id', id);
      
      await fetchData();
      
      toast({
        title: "Saving deleted",
        description: "Your saving has been removed."
      });
    } catch (error) {
      console.error("Error deleting saving:", error);
      toast({
        title: "Error deleting saving",
        description: "Failed to delete the saving.",
        variant: "destructive"
      });
    }
  };

  const value = {
    expenses,
    savings,
    transactions,
    validations,
    remainingMoney,
    totalSaved,
    addExpense,
    addSaving,
    validateItem,
    deleteExpense,
    deleteSaving,
    addIncome,
    loading
  };

  return (
    <FinancialContext.Provider value={value}>
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = (): FinancialContextType => {
  const context = useContext(FinancialContext);
  if (context === undefined) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};
