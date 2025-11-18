import React, { useState } from 'react';
import type { Business } from '@/types';
import { Button } from '../shared/Button';
import { NotificationSettings } from './NotificationSettings';
import { IntegrationManager } from '../integrations/IntegrationManager';

interface AdvancedSettingsProps {
  business: Business;
  onSave: (settings: any) => void;
  onCancel: () => void;
}

export const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({ business, onSave, onCancel }) => {
  // États pour gérer les onglets
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'integrations'>('general');
  const [showIntegrationManager, setShowIntegrationManager] = useState(false);
  
  // Initialiser les paramètres à partir des paramètres existants de l'entreprise
  const [settings, setSettings] = useState({
    taxRate: business.settings?.taxRate || 0,
    invoicePrefix: business.settings?.invoicePrefix || '',
    lowStockThreshold: business.settings?.lowStockThreshold || 10,
    currencySymbol: business.settings?.currencySymbol || 'FCFA',
    timezone: business.settings?.timezone || 'Africa/Dakar',
    notifications: {
      lowStockThreshold: business.settings?.notifications?.lowStockThreshold || 5,
      salesTarget: business.settings?.notifications?.salesTarget || 1000000,
      expenseAlertThreshold: business.settings?.notifications?.expenseAlertThreshold || 100000,
      enableLowStockAlerts: business.settings?.notifications?.enableLowStockAlerts ?? true,
      enableSalesTargetAlerts: business.settings?.notifications?.enableSalesTargetAlerts ?? true,
      enableExpenseAlerts: business.settings?.notifications?.enableExpenseAlerts ?? true,
    },
    integrations: {
      accounting: business.settings?.integrations?.accounting || '',
      payment: business.settings?.integrations?.payment || '',
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      if (name.startsWith('notifications.')) {
        const notificationType = name.split('.')[1];
        setSettings(prev => ({
          ...prev,
          notifications: {
            ...prev.notifications,
            [notificationType]: checkbox.checked
          }
        }));
      }
    } else {
      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        setSettings(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent as keyof typeof prev],
            [child]: value
          }
        }));
      } else {
        setSettings(prev => ({
          ...prev,
          [name]: value
        }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(settings);
  };

  const handleNotificationSettingsSave = (notificationSettings: any) => {
    setSettings(prev => ({
      ...prev,
      ...notificationSettings
    }));
    // Sauvegarder automatiquement après la mise à jour des notifications
    onSave({
      ...settings,
      ...notificationSettings
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Paramètres Avancés</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Configuration détaillée pour l'entreprise {business.name}
        </p>
        
        {/* Onglets */}
        <div className="mt-4 border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('general')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'general'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Paramètres généraux
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'notifications'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('integrations')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'integrations'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Intégrations
            </button>
          </nav>
        </div>
      </div>
      
      {activeTab === 'general' ? (
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Paramètres fiscaux */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Paramètres Fiscaux</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Taux de TVA (%)
                  </label>
                  <input
                    type="number"
                    id="taxRate"
                    name="taxRate"
                    value={settings.taxRate}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="invoicePrefix" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Préfixe des factures
                  </label>
                  <input
                    type="text"
                    id="invoicePrefix"
                    name="invoicePrefix"
                    value={settings.invoicePrefix}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="FACT-"
                  />
                </div>
              </div>
            </div>
            
            {/* Paramètres de stock */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Paramètres de Stock</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="lowStockThreshold" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Seuil d'alerte de stock bas
                  </label>
                  <input
                    type="number"
                    id="lowStockThreshold"
                    name="lowStockThreshold"
                    value={settings.lowStockThreshold}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="currencySymbol" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Symbole de devise
                  </label>
                  <input
                    type="text"
                    id="currencySymbol"
                    name="currencySymbol"
                    value={settings.currencySymbol}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="FCFA"
                  />
                </div>
              </div>
            </div>
            
            {/* Paramètres régionaux */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Paramètres Régionaux</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fuseau horaire
                  </label>
                  <select
                    id="timezone"
                    name="timezone"
                    value={settings.timezone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Africa/Dakar">Afrique/Dakar</option>
                    <option value="Africa/Abidjan">Afrique/Abidjan</option>
                    <option value="Africa/Lagos">Afrique/Lagos</option>
                    <option value="Europe/Paris">Europe/Paris</option>
                    <option value="America/New_York">Amérique/New York</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Intégrations */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Intégrations</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="integrations.accounting" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Système comptable
                  </label>
                  <select
                    id="integrations.accounting"
                    name="integrations.accounting"
                    value={settings.integrations.accounting}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Aucun</option>
                    <option value="quickbooks">QuickBooks</option>
                    <option value="xero">Xero</option>
                    <option value="wave">Wave</option>
                    <option value="custom">Personnalisé</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="integrations.payment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Passerelle de paiement
                  </label>
                  <select
                    id="integrations.payment"
                    name="integrations.payment"
                    value={settings.integrations.payment}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Aucune</option>
                    <option value="stripe">Stripe</option>
                    <option value="paypal">PayPal</option>
                    <option value="mtn">MTN Mobile Money</option>
                    <option value="orange">Orange Money</option>
                    <option value="custom">Personnalisée</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setShowIntegrationManager(true)}
                >
                  Gérer les intégrations avancées
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="secondary" onClick={onCancel}>
              Annuler
            </Button>
            <Button type="submit">
              Enregistrer les paramètres
            </Button>
          </div>
        </form>
      ) : activeTab === 'notifications' ? (
        <div className="p-6">
          <NotificationSettings 
            business={business}
            onSave={handleNotificationSettingsSave}
            onCancel={onCancel}
          />
        </div>
      ) : (
        <div className="p-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Gestion des intégrations</h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Connectez votre entreprise à des services tiers pour automatiser vos processus.
            </p>
            <div className="mt-6">
              <Button onClick={() => setShowIntegrationManager(true)}>
                Gérer les intégrations
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Gestionnaire d'intégrations */}
      {showIntegrationManager && (
        <IntegrationManager 
          businessId={business.id}
          onClose={() => setShowIntegrationManager(false)}
        />
      )}
    </div>
  );
};