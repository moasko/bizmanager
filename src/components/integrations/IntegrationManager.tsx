import React, { useState } from 'react';
import type { Integration, IntegrationType } from '@/services/integrationService';
import { Button } from '../shared/Button';
import { 
  useIntegrations, 
  useConnectIntegration, 
  useDisconnectIntegration, 
  useUpdateIntegrationSettings,
  useSyncIntegration
} from '@/hooks/useIntegration';
import { IntegrationService } from '@/services/integrationService';

interface IntegrationManagerProps {
  businessId: string;
  onClose: () => void;
}

export const IntegrationManager: React.FC<IntegrationManagerProps> = ({ businessId, onClose }) => {
  const { data: integrations = [], isLoading, refetch } = useIntegrations(businessId);
  const connectIntegrationMutation = useConnectIntegration();
  const disconnectIntegrationMutation = useDisconnectIntegration();
  const updateSettingsMutation = useUpdateIntegrationSettings();
  const syncIntegrationMutation = useSyncIntegration();
  
  const [showConnectForm, setShowConnectForm] = useState(false);
  const [selectedType, setSelectedType] = useState<IntegrationType>('accounting');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  const [editSettings, setEditSettings] = useState<any>({});

  // Obtenir les fournisseurs disponibles pour le type sélectionné
  const availableProviders = IntegrationService.getAvailableIntegrations()
    .find(integration => integration.type === selectedType)?.providers || [];

  // Gérer la connexion d'une intégration
  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProvider || !apiKey) {
      alert('Veuillez sélectionner un fournisseur et entrer une clé API');
      return;
    }
    
    try {
      await connectIntegrationMutation.mutateAsync({
        businessId,
        type: selectedType,
        apiKey
      });
      
      // Réinitialiser le formulaire
      setSelectedProvider('');
      setApiKey('');
      setShowConnectForm(false);
      
      // Rafraîchir les données
      refetch();
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      alert('Erreur lors de la connexion à l\'intégration');
    }
  };

  // Gérer la déconnexion d'une intégration
  const handleDisconnect = async (integrationId: string) => {
    if (confirm('Êtes-vous sûr de vouloir déconnecter cette intégration ?')) {
      try {
        await disconnectIntegrationMutation.mutateAsync(integrationId);
        refetch();
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
        alert('Erreur lors de la déconnexion de l\'intégration');
      }
    }
  };

  // Gérer la synchronisation d'une intégration
  const handleSync = async (integrationId: string) => {
    try {
      await syncIntegrationMutation.mutateAsync(integrationId);
      refetch();
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      alert('Erreur lors de la synchronisation de l\'intégration');
    }
  };

  // Commencer l'édition des paramètres
  const startEditing = (integration: Integration) => {
    setEditingIntegration(integration);
    setEditSettings(integration.settings || {});
  };

  // Sauvegarder les paramètres modifiés
  const saveSettings = async () => {
    if (!editingIntegration) return;
    
    try {
      await updateSettingsMutation.mutateAsync({
        integrationId: editingIntegration.id,
        settings: editSettings
      });
      
      setEditingIntegration(null);
      refetch();
    } catch (error) {
      console.error('Erreur lors de la mise à jour des paramètres:', error);
      alert('Erreur lors de la mise à jour des paramètres');
    }
  };

  // Obtenir la couleur du statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'disconnected':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col rounded-xl shadow-xl">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Intégrations externes
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Connectez votre entreprise à des services tiers
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : (
            <>
              {/* Bouton pour ajouter une intégration */}
              <div className="mb-6">
                <Button onClick={() => setShowConnectForm(true)}>
                  Ajouter une intégration
                </Button>
              </div>

              {/* Formulaire d'ajout d'intégration */}
              {showConnectForm && (
                <div className="mb-8 p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                    Connecter un nouveau service
                  </h3>
                  
                  <form onSubmit={handleConnect} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Type d'intégration
                        </label>
                        <select
                          value={selectedType}
                          onChange={(e) => {
                            setSelectedType(e.target.value as IntegrationType);
                            setSelectedProvider('');
                          }}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                          {IntegrationService.getAvailableIntegrations().map(integration => (
                            <option key={integration.type} value={integration.type}>
                              {integration.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Fournisseur
                        </label>
                        <select
                          value={selectedProvider}
                          onChange={(e) => setSelectedProvider(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                          <option value="">Sélectionnez un fournisseur</option>
                          {availableProviders.map(provider => (
                            <option key={provider.id} value={provider.id}>
                              {provider.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Clé API
                      </label>
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="Entrez votre clé API"
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setShowConnectForm(false)}
                      >
                        Annuler
                      </Button>
                      <Button
                        type="submit"
                        disabled={connectIntegrationMutation.isPending}
                      >
                        {connectIntegrationMutation.isPending ? 'Connexion...' : 'Connecter'}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Liste des intégrations */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
                  Intégrations actives
                </h3>
                
                {integrations.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucune intégration</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Commencez par connecter un service tiers à votre entreprise.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {integrations.map(integration => (
                      <div 
                        key={integration.id} 
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-800 dark:text-white">
                              {integration.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {IntegrationService.getIntegrationName(integration.type)}
                            </p>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(integration.status)}`}>
                            {integration.status === 'connected' && 'Connecté'}
                            {integration.status === 'disconnected' && 'Déconnecté'}
                            {integration.status === 'error' && 'Erreur'}
                          </span>
                        </div>
                        
                        <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                          {integration.connectedAt && (
                            <p>
                              Connecté le: {new Date(integration.connectedAt).toLocaleDateString('fr-FR')}
                            </p>
                          )}
                          {integration.lastSync && (
                            <p>
                              Dernière synchro: {new Date(integration.lastSync).toLocaleDateString('fr-FR')}
                            </p>
                          )}
                        </div>
                        
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button
                            className="px-3 py-1 text-sm"
                            onClick={() => handleSync(integration.id)}
                            disabled={syncIntegrationMutation.isPending}
                          >
                            {syncIntegrationMutation.isPending ? 'Synchronisation...' : 'Synchroniser'}
                          </Button>
                          
                          <Button
                            className="px-3 py-1 text-sm"
                            variant="secondary"
                            onClick={() => startEditing(integration)}
                          >
                            Paramètres
                          </Button>
                          
                          <Button
                            className="px-3 py-1 text-sm"
                            variant="danger"
                            onClick={() => handleDisconnect(integration.id)}
                            disabled={disconnectIntegrationMutation.isPending}
                          >
                            {disconnectIntegrationMutation.isPending ? 'Déconnexion...' : 'Déconnecter'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        
        {/* Formulaire d'édition des paramètres */}
        {editingIntegration && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-700">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
              Paramètres de {editingIntegration.name}
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoSync"
                  checked={editSettings.autoSync || false}
                  onChange={(e) => setEditSettings({
                    ...editSettings,
                    autoSync: e.target.checked
                  })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="autoSync" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Synchronisation automatique
                </label>
              </div>
              
              {editSettings.autoSync && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fréquence de synchronisation
                  </label>
                  <select
                    value={editSettings.syncFrequency || 'daily'}
                    onChange={(e) => setEditSettings({
                      ...editSettings,
                      syncFrequency: e.target.value
                    })}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="hourly">Toutes les heures</option>
                    <option value="daily">Quotidienne</option>
                    <option value="weekly">Hebdomadaire</option>
                  </select>
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => setEditingIntegration(null)}
                >
                  Annuler
                </Button>
                <Button
                  onClick={saveSettings}
                  disabled={updateSettingsMutation.isPending}
                >
                  {updateSettingsMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};