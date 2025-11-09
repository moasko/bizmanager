"use client";

import React from 'react';
import { Clients } from '@/components/clients/Clients';
import { MainLayout } from '@/components/layout/MainLayout';
import { useBusinesses } from '@/hooks/useBusiness';
import { useCreateClient } from '@/hooks/useClient';

export default function ClientsPage() {
  const { data: businesses = [], isLoading: isBusinessesLoading } = useBusinesses();
  const { mutateAsync: createClient } = useCreateClient();
  
  if (isBusinessesLoading) {
    return <div className="flex justify-center items-center h-64">Chargement des clients...</div>;
  }
  
  // For now, we'll show the first business
  const activeBusiness = businesses[0];
  
  if (!activeBusiness) {
    return <div className="flex justify-center items-center h-64">Aucune entreprise trouvée.</div>;
  }
  
  const handleAddClient = async (newClient: any) => {
    try {
      await createClient(newClient);
    } catch (error) {
      console.error('Error creating client:', error);
    }
  };
  
  const handleRecordPayment = async (clientId: string, amount: number) => {
    // Implementation would go here
    console.log('Recording payment for client:', clientId, 'Amount:', amount);
  };

  return (
    <MainLayout businesses={businesses}>
      <div className="p-4 md:p-8">
        <Clients 
          business={activeBusiness} 
          onAddClient={handleAddClient} 
          onRecordPayment={handleRecordPayment} 
        />
      </div>
    </MainLayout>
  );
}