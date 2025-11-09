"use client";

import React from 'react';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { MainLayout } from '@/components/layout/MainLayout';
import { useBusinesses } from '@/hooks/useBusiness';

export default function DashboardPage() {
  const { data: businesses = [], isLoading } = useBusinesses();
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Chargement du tableau de bord...</div>;
  }
  
  // For now, we'll show the first business
  const activeBusiness = businesses[0];
  
  if (!activeBusiness) {
    return <div className="flex justify-center items-center h-64">Aucune entreprise trouvée.</div>;
  }
  
  return (
    <MainLayout businesses={businesses}>
      <div className="p-4 md:p-8">
        <Dashboard business={activeBusiness} />
      </div>
    </MainLayout>
  );
}