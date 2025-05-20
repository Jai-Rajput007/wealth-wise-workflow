
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from './UserContext';

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
  type: 'expense_split' | 'saving';
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
  addExpense: (expense: Omit<Expense, 'id' | 'isValidated'>) => string;
  addSaving: (saving: Omit<Saving, 'id' | 'isValidated'>) => string;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  validateItem: (id: string, isApproved: boolean) => void;
  getExpenseById: (id: string) => Expense | undefined;
  getSavingById: (id: string) => Saving | undefined;
}

const FinancialContext = createContext<FinancialContextProps | undefined>(undefined);

export const FinancialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { profile } = useUser();
  
  // Initialize state from localStorage or with empty arrays
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('expenses');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [savings, setSavings] = useState<Saving[]>(() => {
    const saved = localStorage.getItem('savings');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [validations, setValidations] = useState<ValidationItem[]>(() => {
    const saved = localStorage.getItem('validations');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Calculate remaining money
  const [remainingMoney, setRemainingMoney] = useState<number>(0);
  const [totalSaved, setTotalSaved] = useState<number>(0);
  
  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);
  
  useEffect(() => {
    localStorage.setItem('savings', JSON.stringify(savings));
  }, [savings]);
  
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);
  
  useEffect(() => {
    localStorage.setItem('validations', JSON.stringify(validations));
  }, [validations]);
  
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
    const remaining = profile.monthlySalary + additionalIncome - totalExpenses - totalSavingsAmount;
    setRemainingMoney(remaining);
  }, [profile, expenses, savings, transactions]);
  
  // Add new expense
  const addExpense = (newExpense: Omit<Expense, 'id' | 'isValidated'>): string => {
    const id = `exp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    const expense: Expense = {
      ...newExpense,
      id,
      isValidated: newExpense.type === 'temporary' // Temporary expenses are automatically validated
    };
    
    setExpenses(prev => [...prev, expense]);
    
    // Add to transactions if validated (temporary expenses)
    if (expense.isValidated) {
      addTransaction({
        title: expense.title,
        amount: expense.amount,
        date: expense.date,
        type: 'expense',
        category: expense.category,
        description: expense.description,
        relatedId: id
      });
    }
    
    // If it's a split expense, add to validations
    if (expense.isSplit && expense.splitWith) {
      const validationExpires = new Date();
      validationExpires.setDate(validationExpires.getDate() + 1); // 24 hours to validate
      
      const validationItem: ValidationItem = {
        id: `val-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title: `Split expense: ${expense.title}`,
        amount: expense.amount / 2, // Assuming equal split
        type: 'expense_split',
        date: expense.date,
        expiresAt: validationExpires.toISOString(),
        description: expense.description,
        relatedId: id,
        initiatedBy: 'currentUser' // In a real app, this would be the current user's ID
      };
      
      setValidations(prev => [...prev, validationItem]);
    }
    
    return id;
  };
  
  // Add new saving
  const addSaving = (newSaving: Omit<Saving, 'id' | 'isValidated'>): string => {
    const id = `sav-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    const saving: Saving = {
      ...newSaving,
      id,
      isValidated: false // Savings require validation
    };
    
    setSavings(prev => [...prev, saving]);
    
    // Add to validations
    const validationExpires = new Date();
    
    // Set expiration based on frequency
    switch (saving.frequency) {
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
    
    const validationItem: ValidationItem = {
      id: `val-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: `Validate saving: ${saving.title}`,
      amount: saving.amount,
      type: 'saving',
      date: saving.date,
      expiresAt: validationExpires.toISOString(),
      description: saving.description,
      relatedId: id
    };
    
    setValidations(prev => [...prev, validationItem]);
    
    return id;
  };
  
  // Add transaction
  const addTransaction = (newTransaction: Omit<Transaction, 'id'>) => {
    const transaction: Transaction = {
      ...newTransaction,
      id: `trx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    };
    
    setTransactions(prev => [...prev, transaction]);
  };
  
  // Validate an item (expense split or saving)
  const validateItem = (id: string, isApproved: boolean) => {
    const validation = validations.find(v => v.id === id);
    if (!validation) return;
    
    if (validation.type === 'expense_split') {
      // Handle expense split validation
      const expense = expenses.find(e => e.id === validation.relatedId);
      if (expense) {
        if (isApproved) {
          // Update the expense's split status
          setExpenses(prev => 
            prev.map(e => 
              e.id === expense.id 
                ? { ...e, splitStatus: 'approved' } 
                : e
            )
          );
          
          // Add a transaction for the split
          addTransaction({
            title: `Split: ${expense.title}`,
            amount: validation.amount,
            date: new Date().toISOString(),
            type: 'expense',
            category: expense.category,
            description: `Split payment for ${expense.title}`,
            relatedId: expense.id
          });
        } else {
          // Mark as rejected
          setExpenses(prev => 
            prev.map(e => 
              e.id === expense.id 
                ? { ...e, splitStatus: 'rejected' } 
                : e
            )
          );
        }
      }
    } else if (validation.type === 'saving') {
      // Handle saving validation
      const saving = savings.find(s => s.id === validation.relatedId);
      if (saving && isApproved) {
        // Mark saving as validated
        setSavings(prev => 
          prev.map(s => 
            s.id === saving.id 
              ? { ...s, isValidated: true } 
              : s
          )
        );
        
        // Add a transaction for the saving
        addTransaction({
          title: saving.title,
          amount: saving.amount,
          date: new Date().toISOString(),
          type: 'saving',
          category: saving.type,
          description: saving.description,
          relatedId: saving.id
        });
      }
    }
    
    // Remove the validation item
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
    getSavingById
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
