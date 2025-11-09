"use client";

import React from 'react';
import { Suppliers } from '@/components/suppliers/Suppliers';
import { MainLayout } from '@/components/layout/MainLayout';
import { useBusinesses } from '@/hooks/useBusiness';
import { useCreateSupplier } from '@/hooks/useSupplier';

export default function SuppliersPage() {
  const { data: businesses = [], isLoading: isBusinessesLoading } = useBusinesses();
  const { mutateAsync: createSupplier } = useCreateSupplier();
  
  if (isBusinessesLoading) {
    return <div className="flex justify-center items-center h-64">Chargement des fournisseurs...</div>;
  }
  
  // For now, we'll show the first business
  const activeBusiness = businesses[0];
  
  if (!activeBusiness) {
    return <div className="flex justify-center items-center h-64">Aucune entreprise trouvée.</div>;
  }
  
  const handleAddSupplier = async (newSupplier: any) => {
    try {
      await createSupplier(newSupplier);
    } catch (error) {
      console.error('Error creating supplier:', error);
    }
  };

  return (
    <MainLayout businesses={businesses}>
      <div className="p-4 md:p-8">
        <Suppliers business={activeBusiness} onAddSupplier={handleAddSupplier} />
      </div>
    </MainLayout>
  );
}