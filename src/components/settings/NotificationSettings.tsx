import React, { useState } from 'react';
import type { Business } from '@/types';
import { Button } from '../shared/Button';

interface NotificationSettingsProps {
  business: Business;
  onSave: (settings: any) => void;
  onCancel: () => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ 
  business, 
  onSave, 
  onCancel 
}) => {
  // États pour les paramètres de notification
  const [lowStockThreshold, setLowStockThreshold] = useState(
    business.settings?.notifications?.lowStockThreshold || 5
  );
  
  const [salesTarget, setSalesTarget] = useState(
    business.settings?.notifications?.salesTarget || 1000000
  );
  
  const [expenseAlertThreshold, setExpenseAlertThreshold] = useState(
    business.settings?.notifications?.expenseAlertThreshold || 100000
  );
  
  const [enableLowStockAlerts, setEnableLowStockAlerts] = useState(
    business.settings?.notifications?.enableLowStockAlerts ?? true
  );
  
  const [enableSalesTargetAlerts, setEnableSalesTargetAlerts] = useState(
    business.settings?.notifications?.enableSalesTargetAlerts ?? true
  );
  
  const [enableExpenseAlerts, setEnableExpenseAlerts] = useState(
    business.settings?.notifications?.enableExpenseAlerts ?? true
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const notificationSettings = {
      notifications: {
        lowStockThreshold,
        salesTarget,
        expenseAlertThreshold,
        enableLowStockAlerts,
        enableSalesTargetAlerts,
        enableExpenseAlerts
      }
    };
    
    onSave(notificationSettings);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Paramètres de Notifications
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Configurez les alertes et notifications pour votre entreprise
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-6">
          {/* Alerte de stock faible */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Alerte de stock faible
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Recevoir une alerte lorsque le stock d'un produit atteint un seuil défini
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableLowStockAlerts}
                  onChange={(e) => setEnableLowStockAlerts(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            {enableLowStockAlerts && (
              <div className="mt-4">
                <label htmlFor="lowStockThreshold" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Seuil d'alerte de stock
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="lowStockThreshold"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400">unités</span>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Une alerte sera envoyée lorsque le stock d'un produit tombe en dessous de ce seuil
                </p>
              </div>
            )}
          </div>
          
          {/* Objectif de ventes */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Objectif de ventes
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Recevoir une notification lorsque vous atteignez un pourcentage de votre objectif
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableSalesTargetAlerts}
                  onChange={(e) => setEnableSalesTargetAlerts(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            {enableSalesTargetAlerts && (
              <div className="mt-4">
                <label htmlFor="salesTarget" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Objectif mensuel de ventes
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="salesTarget"
                    value={salesTarget}
                    onChange={(e) => setSalesTarget(Number(e.target.value))}
                    min="1000"
                    step="1000"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400">FCFA</span>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Vous recevrez des notifications à 50%, 80% et 100% de cet objectif
                </p>
              </div>
            )}
          </div>
          
          {/* Alerte de dépenses */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Alerte de dépenses importantes
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Recevoir une alerte lorsqu'une dépense dépasse un certain montant
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableExpenseAlerts}
                  onChange={(e) => setEnableExpenseAlerts(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            {enableExpenseAlerts && (
              <div className="mt-4">
                <label htmlFor="expenseAlertThreshold" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Seuil d'alerte de dépenses
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="expenseAlertThreshold"
                    value={expenseAlertThreshold}
                    onChange={(e) => setExpenseAlertThreshold(Number(e.target.value))}
                    min="1000"
                    step="1000"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400">FCFA</span>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Une alerte sera envoyée pour toute dépense supérieure à ce montant
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-8 flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
          >
            Annuler
          </Button>
          <Button
            type="submit"
          >
            Enregistrer les paramètres
          </Button>
        </div>
      </form>
    </div>
  );
};