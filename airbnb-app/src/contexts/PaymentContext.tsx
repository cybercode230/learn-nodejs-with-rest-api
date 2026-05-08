/**
 * File: PaymentContext.tsx
 * What it is doing: Manages simulated payment methods and user balances using localStorage.
 * Responsibility: Providing a central state for payment operations (adding methods, simulating payroll, processing payments).
 * Outcomes: Allows components to access payment methods, current balance, and perform simulated financial transactions.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

export interface PaymentMethod {
  id: string;
  type: 'CARD' | 'MOBILE_MONEY' | 'PAYPAL';
  provider: string;
  lastFour?: string;
  email?: string;
  phone?: string;
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  description: string;
  timestamp: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
}

interface PaymentContextType {
  balance: number;
  paymentMethods: PaymentMethod[];
  transactions: Transaction[];
  addPaymentMethod: (method: Omit<PaymentMethod, 'id'>) => void;
  removePaymentMethod: (id: string) => void;
  setDefaultMethod: (id: string) => void;
  processPayment: (amount: number, description: string) => Promise<boolean>;
  addFunds: (amount: number, description: string) => void;
  isLoading: boolean;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from localStorage on mount or user change
  useEffect(() => {
    if (user) {
      const storageKey = `payment_data_${user.id}`;
      const savedData = localStorage.getItem(storageKey);
      
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setBalance(parsed.balance || 0);
        setPaymentMethods(parsed.paymentMethods || []);
        setTransactions(parsed.transactions || []);
      } else {
        // Initial state for new user
        setBalance(1000); // Give them some starter "money"
        setPaymentMethods([]);
        setTransactions([]);
      }
    }
    setIsLoading(false);
  }, [user]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      const storageKey = `payment_data_${user.id}`;
      const dataToSave = {
        balance,
        paymentMethods,
        transactions
      };
      localStorage.setItem(storageKey, JSON.stringify(dataToSave));
    }
  }, [balance, paymentMethods, transactions, user]);

  const addPaymentMethod = useCallback((method: Omit<PaymentMethod, 'id'>) => {
    const newMethod: PaymentMethod = {
      ...method,
      id: Math.random().toString(36).substr(2, 9)
    };
    
    setPaymentMethods(prev => {
      // If this is the first method or set as default, update others
      if (prev.length === 0 || newMethod.isDefault) {
        return [...prev.map(m => ({ ...m, isDefault: false })), newMethod];
      }
      return [...prev, newMethod];
    });
  }, []);

  const removePaymentMethod = useCallback((id: string) => {
    setPaymentMethods(prev => prev.filter(m => m.id !== id));
  }, []);

  const setDefaultMethod = useCallback((id: string) => {
    setPaymentMethods(prev => prev.map(m => ({
      ...m,
      isDefault: m.id === id
    })));
  }, []);

  const addFunds = useCallback((amount: number, description: string) => {
    setBalance(prev => prev + amount);
    setTransactions(prev => [
      {
        id: Math.random().toString(36).substr(2, 9),
        amount,
        type: 'CREDIT',
        description,
        timestamp: new Date().toISOString(),
        status: 'COMPLETED'
      },
      ...prev
    ]);
  }, []);

  const processPayment = useCallback(async (amount: number, description: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (balance >= amount) {
      setBalance(prev => prev - amount);
      setTransactions(prev => [
        {
          id: Math.random().toString(36).substr(2, 9),
          amount,
          type: 'DEBIT',
          description,
          timestamp: new Date().toISOString(),
          status: 'COMPLETED'
        },
        ...prev
      ]);
      return true;
    }
    
    return false;
  }, [balance]);

  return (
    <PaymentContext.Provider
      value={{
        balance,
        paymentMethods,
        transactions,
        addPaymentMethod,
        removePaymentMethod,
        setDefaultMethod,
        processPayment,
        addFunds,
        isLoading
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};
