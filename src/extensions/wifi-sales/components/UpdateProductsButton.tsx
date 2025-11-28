import React, { useState } from 'react';
import { Button } from '@/components/shared/Button';
import { useActiveBusiness } from '@/contexts/ActiveBusinessContext';
import { prisma } from '@/lib/prisma';

const UpdateProductsButton: React.FC = () => {
  const { activeBusiness } = useActiveBusiness();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const updateProducts = async () => {
    if (!activeBusiness?.id) {
      setMessage('Aucune entreprise active');
      return;
    }

    setLoading(true);
    setMessage('Mise à jour en cours...');
    
    try {
      // Appeler l'API pour mettre à jour les produits
      const response = await fetch('/api/wifi-sales/update-products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ businessId: activeBusiness.id }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setMessage('Produits et ventes mis à jour avec succès!');
      } else {
        setMessage(`Erreur: ${result.error}`);
      }
    } catch (error) {
      console.error('Error updating products:', error);
      setMessage('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
      <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Mise à jour des produits</h3>
      <p className="text-yellow-700 dark:text-yellow-300 text-sm mb-3">
        Si vos ventes n'apparaissent pas, cliquez sur le bouton ci-dessous pour mettre à jour les produits et ventes existants.
      </p>
      <Button
        onClick={updateProducts}
        disabled={loading}
        className="bg-yellow-500 hover:bg-yellow-600 text-white"
      >
        {loading ? 'Mise à jour...' : 'Mettre à jour les produits'}
      </Button>
      {message && (
        <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">{message}</p>
      )}
    </div>
  );
};

export default UpdateProductsButton;