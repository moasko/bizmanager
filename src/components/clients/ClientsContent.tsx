"use client";

import React from 'react';
import { Clients } from '@/components/clients/Clients';
import { useCreateClient, useUpdateClient } from '@/hooks/useClient'; // Ajout de useUpdateClient
import { getClients } from '@/actions/clientActions'; // Ajout de getClients
import { useActiveBusiness } from '@/contexts/ActiveBusinessContext';
import type { Business } from '@/types';

interface ClientsContentProps {
  activeBusiness?: Business;
}

export const ClientsContent: React.FC<ClientsContentProps> = ({ activeBusiness }) => {
  const { mutateAsync: createClient } = useCreateClient();
  const { mutateAsync: updateClient } = useUpdateClient(); // Ajout du hook pour mettre à jour les clients
  
  // Use context if no prop is provided (for backward compatibility)
  const { activeBusiness: contextBusiness } = useActiveBusiness();
  const business = activeBusiness || contextBusiness;
  
  if (!business) {
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
    try {
      // Récupérer le client actuel
      const response = await getClients(business.id);
      if (response.success && response.data) {
        const client = response.data.find((c: any) => c.id === clientId);
        if (client) {
          // Mettre à jour le solde du client (soustraire le montant du paiement)
          await updateClient({ 
            id: clientId, 
            data: { 
              balance: client.balance - amount 
            } 
          });
        }
      }
    } catch (error) {
      console.error('Error recording payment:', error);
    }
  };

  return (
    <Clients 
      business={business} 
      onAddClient={handleAddClient} 
      onRecordPayment={handleRecordPayment} 
    />
  );
};