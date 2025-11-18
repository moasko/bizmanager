import React, { useState } from 'react';
import type { Business, Product, Client } from '@/types';
import { Button } from '../shared/Button';

interface DataTransferProps {
  businesses: Business[];
  onClose: () => void;
  onTransfer: (sourceBusinessId: string, targetBusinessId: string, dataTypes: string[]) => void;
}

export const DataTransfer: React.FC<DataTransferProps> = ({ businesses, onClose, onTransfer }) => {
  const [sourceBusinessId, setSourceBusinessId] = useState('');
  const [targetBusinessId, setTargetBusinessId] = useState('');
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>([]);
  const [isTransferring, setIsTransferring] = useState(false);

  const dataTypes = [
    { id: 'products', label: 'Produits' },
    { id: 'clients', label: 'Clients' },
    { id: 'suppliers', label: 'Fournisseurs' },
    { id: 'expenses', label: 'Dépenses' },
    { id: 'sales', label: 'Ventes' }
  ];

  const handleDataTypeChange = (dataType: string) => {
    if (selectedDataTypes.includes(dataType)) {
      setSelectedDataTypes(selectedDataTypes.filter(type => type !== dataType));
    } else {
      setSelectedDataTypes([...selectedDataTypes, dataType]);
    }
  };

  const handleTransfer = async () => {
    if (!sourceBusinessId || !targetBusinessId || selectedDataTypes.length === 0) {
      alert('Veuillez sélectionner les entreprises source et cible ainsi que les types de données à transférer.');
      return;
    }

    if (sourceBusinessId === targetBusinessId) {
      alert('Les entreprises source et cible doivent être différentes.');
      return;
    }

    setIsTransferring(true);
    try {
      await onTransfer(sourceBusinessId, targetBusinessId, selectedDataTypes);
      alert('Transfert de données effectué avec succès !');
      onClose();
    } catch (error) {
      alert('Erreur lors du transfert de données : ' + (error as Error).message);
    } finally {
      setIsTransferring(false);
    }
  };

  const sourceBusiness = businesses.find(b => b.id === sourceBusinessId);
  const targetBusiness = businesses.find(b => b.id === targetBusinessId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Transfert de données entre entreprises
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Transférez sélectivement des données d'une entreprise à une autre
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Entreprise source
              </label>
              <select
                value={sourceBusinessId}
                onChange={(e) => setSourceBusinessId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Sélectionnez une entreprise</option>
                {businesses.map(business => (
                  <option key={business.id} value={business.id}>
                    {business.name}
                  </option>
                ))}
              </select>
              {sourceBusiness && (
                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Produits:</span> {sourceBusiness.products?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Clients:</span> {sourceBusiness.clients?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Fournisseurs:</span> {sourceBusiness.suppliers?.length || 0}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Entreprise cible
              </label>
              <select
                value={targetBusinessId}
                onChange={(e) => setTargetBusinessId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Sélectionnez une entreprise</option>
                {businesses
                  .filter(b => b.id !== sourceBusinessId)
                  .map(business => (
                    <option key={business.id} value={business.id}>
                      {business.name}
                    </option>
                  ))}
              </select>
              {targetBusiness && (
                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Produits:</span> {targetBusiness.products?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Clients:</span> {targetBusiness.clients?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Fournisseurs:</span> {targetBusiness.suppliers?.length || 0}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Types de données à transférer
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {dataTypes.map(type => (
                <div key={type.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={type.id}
                    checked={selectedDataTypes.includes(type.id)}
                    onChange={() => handleDataTypeChange(type.id)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor={type.id} className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    {type.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={onClose}>
              Annuler
            </Button>
            <Button 
              onClick={handleTransfer} 
              disabled={isTransferring || !sourceBusinessId || !targetBusinessId || selectedDataTypes.length === 0}
            >
              {isTransferring ? 'Transfert en cours...' : 'Transférer les données'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};