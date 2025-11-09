"use client";

import React from 'react';
import { Sales } from '@/components/sales/Sales';
import { MainLayout } from '@/components/layout/MainLayout';
import { useBusinesses } from '@/hooks/useBusiness';
import { useCreateSale } from '@/hooks/useSale';

export default function SalesPage() {
  const { data: businesses = [], isLoading: isBusinessesLoading } = useBusinesses();
  const { mutateAsync: createSale } = useCreateSale();
  
  if (isBusinessesLoading) {
    return <div className="flex justify-center items-center h-64">Chargement des ventes...</div>;
  }
  
  // For now, we'll show the first business
  const activeBusiness = businesses[0];
  
  if (!activeBusiness) {
    return <div className="flex justify-center items-center h-64">Aucune entreprise trouvée.</div>;
  }
  
  const handleAddSale = async (newSale: any) => {
    try {
      await createSale(newSale);
    } catch (error) {
      console.error('Error creating sale:', error);
    }
  };

  return (
    <MainLayout businesses={businesses}>
      <div className="p-4 md:p-8">
        <Sales business={activeBusiness} onAddSale={handleAddSale} />
      </div>
    </MainLayout>
  );
}