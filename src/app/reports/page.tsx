"use client";

import React from 'react';
import { Reports } from '@/components/reports/Reports';
import { MainLayout } from '@/components/layout/MainLayout';
import { useBusinesses } from '@/hooks/useBusiness';

export default function ReportsPage() {
  const { data: businesses = [], isLoading: isBusinessesLoading } = useBusinesses();
  
  if (isBusinessesLoading) {
    return <div className="flex justify-center items-center h-64">Chargement des rapports...</div>;
  }
  
  // For now, we'll show the first business
  const activeBusiness = businesses[0];
  
  if (!activeBusiness) {
    return <div className="flex justify-center items-center h-64">Aucune entreprise trouvée.</div>;
  }

  return (
    <MainLayout businesses={businesses}>
      <div className="p-4 md:p-8">
        <Reports business={activeBusiness} />
      </div>
    </MainLayout>
  );
}