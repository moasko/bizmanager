"use client";

import React from 'react';
import { Expenses } from '@/components/expenses/Expenses';
import { MainLayout } from '@/components/layout/MainLayout';
import { useBusinesses } from '@/hooks/useBusiness';
import { useCreateExpense } from '@/hooks/useExpense';

export default function ExpensesPage() {
  const { data: businesses = [], isLoading: isBusinessesLoading } = useBusinesses();
  const { mutateAsync: createExpense } = useCreateExpense();
  
  if (isBusinessesLoading) {
    return <div className="flex justify-center items-center h-64">Chargement des dépenses...</div>;
  }
  
  // For now, we'll show the first business
  const activeBusiness = businesses[0];
  
  if (!activeBusiness) {
    return <div className="flex justify-center items-center h-64">Aucune entreprise trouvée.</div>;
  }
  
  const handleAddExpense = async (newExpense: any) => {
    try {
      await createExpense(newExpense);
    } catch (error) {
      console.error('Error creating expense:', error);
    }
  };

  return (
    <MainLayout businesses={businesses}>
      <div className="p-4 md:p-8">
        <Expenses business={activeBusiness} onAddExpense={handleAddExpense} />
      </div>
    </MainLayout>
  );
}