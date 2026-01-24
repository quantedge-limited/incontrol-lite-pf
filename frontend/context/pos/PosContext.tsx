// context/pos/PosContext.tsx
"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { posApi, Sale } from '@/lib/api/sales';

interface PosContextType {
  sales: Sale[];
  loading: boolean;
  error: string | null;
  selectedSale: Sale | null;
  
  fetchSales: (params?: any) => Promise<void>;
  createSale: (data: any) => Promise<Sale>;
  cancelSale: (saleId: string) => Promise<void>;
  selectSale: (sale: Sale | null) => void;
}

const PosContext = createContext<PosContextType | undefined>(undefined);

export function PosProvider({ children }: { children: React.ReactNode }) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const fetchSales = useCallback(async (params?: any) => {
    setLoading(true);
    setError(null);
    try {
      const data = await posApi.getSales(params);
      setSales(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createSale = useCallback(async (saleData: any) => {
    setLoading(true);
    setError(null);
    try {
      const newSale = await posApi.createSale(saleData);
      setSales(prev => [newSale, ...prev]);
      return newSale;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelSale = useCallback(async (saleId: string) => {
    setLoading(true);
    setError(null);
    try {
      await posApi.cancelSale(saleId);
      setSales(prev => prev.filter(sale => sale.id !== saleId));
      if (selectedSale?.id === saleId) {
        setSelectedSale(null);
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedSale]);

  const selectSale = useCallback((sale: Sale | null) => {
    setSelectedSale(sale);
  }, []);

  return (
    <PosContext.Provider value={{
      sales,
      loading,
      error,
      selectedSale,
      fetchSales,
      createSale,
      cancelSale,
      selectSale,
    }}>
      {children}
    </PosContext.Provider>
  );
}

export function usePos() {
  const context = useContext(PosContext);
  if (!context) {
    throw new Error('usePos must be used within a PosProvider');
  }
  return context;
}