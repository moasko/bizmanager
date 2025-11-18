// Types pour les intégrations
export type IntegrationType = 'accounting' | 'payment' | 'crm' | 'inventory' | 'analytics';
export type IntegrationStatus = 'connected' | 'disconnected' | 'error';

export interface Integration {
  id: string;
  businessId: string;
  type: IntegrationType;
  name: string;
  status: IntegrationStatus;
  apiKey?: string;
  webhookUrl?: string;
  connectedAt?: string;
  lastSync?: string;
  settings?: any;
}

// Service d'intégration
export class IntegrationService {
  // Obtenir toutes les intégrations pour une entreprise
  static async getIntegrations(businessId: string): Promise<Integration[]> {
    // Dans une vraie application, cela ferait un appel API
    // Pour cette démonstration, nous retournons des données simulées
    const mockIntegrations: Integration[] = [
      {
        id: '1',
        businessId: businessId,
        type: 'accounting',
        name: 'QuickBooks',
        status: 'connected',
        connectedAt: new Date().toISOString(),
        lastSync: new Date().toISOString(),
        settings: {
          autoSync: true,
          syncFrequency: 'daily'
        }
      },
      {
        id: '2',
        businessId: businessId,
        type: 'payment',
        name: 'Stripe',
        status: 'disconnected',
        settings: {
          autoSync: false
        }
      },
      {
        id: '3',
        businessId: businessId,
        type: 'crm',
        name: 'HubSpot',
        status: 'error',
        connectedAt: new Date().toISOString(),
        lastSync: new Date(Date.now() - 86400000).toISOString(), // Hier
        settings: {
          autoSync: true,
          syncFrequency: 'hourly'
        }
      }
    ];
    
    return Promise.resolve(mockIntegrations);
  }

  // Connecter une intégration
  static async connectIntegration(businessId: string, type: IntegrationType, apiKey: string): Promise<Integration> {
    // Dans une vraie application, cela ferait un appel API
    console.log(`Connexion de l'intégration ${type} pour l'entreprise ${businessId}`);
    
    // Simulation d'un délai de traitement
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Pour cette démonstration, nous simulons le succès
    const newIntegration: Integration = {
      id: `${businessId}-${type}-${Date.now()}`,
      businessId,
      type,
      name: this.getIntegrationName(type),
      status: 'connected',
      apiKey,
      connectedAt: new Date().toISOString(),
      lastSync: new Date().toISOString(),
      settings: {
        autoSync: true,
        syncFrequency: 'daily'
      }
    };
    
    return Promise.resolve(newIntegration);
  }

  // Déconnecter une intégration
  static async disconnectIntegration(integrationId: string): Promise<void> {
    // Dans une vraie application, cela ferait un appel API
    console.log(`Déconnexion de l'intégration ${integrationId}`);
    
    // Simulation d'un délai de traitement
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Pour cette démonstration, nous simulons le succès
    return Promise.resolve();
  }

  // Mettre à jour les paramètres d'une intégration
  static async updateIntegrationSettings(integrationId: string, settings: any): Promise<Integration> {
    // Dans une vraie application, cela ferait un appel API
    console.log(`Mise à jour des paramètres de l'intégration ${integrationId}`, settings);
    
    // Simulation d'un délai de traitement
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Pour cette démonstration, nous simulons le succès
    // Dans une vraie application, cela retournerait l'intégration mise à jour
    return Promise.resolve({
      id: integrationId,
      businessId: 'mock-business-id',
      type: 'accounting',
      name: 'QuickBooks',
      status: 'connected',
      connectedAt: new Date().toISOString(),
      lastSync: new Date().toISOString(),
      settings
    } as Integration);
  }

  // Synchroniser une intégration
  static async syncIntegration(integrationId: string): Promise<void> {
    // Dans une vraie application, cela ferait un appel API
    console.log(`Synchronisation de l'intégration ${integrationId}`);
    
    // Simulation d'un délai de traitement
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Pour cette démonstration, nous simulons le succès
    return Promise.resolve();
  }

  // Obtenir le nom d'une intégration par son type
  static getIntegrationName(type: IntegrationType): string {
    const names: Record<IntegrationType, string> = {
      accounting: 'Comptabilité',
      payment: 'Paiement',
      crm: 'CRM',
      inventory: 'Inventaire',
      analytics: 'Analytics'
    };
    
    return names[type] || type;
  }

  // Obtenir les options d'intégration disponibles
  static getAvailableIntegrations(): { type: IntegrationType; name: string; providers: { id: string; name: string }[] }[] {
    return [
      {
        type: 'accounting',
        name: 'Comptabilité',
        providers: [
          { id: 'quickbooks', name: 'QuickBooks' },
          { id: 'xero', name: 'Xero' },
          { id: 'wave', name: 'Wave' },
          { id: 'sage', name: 'Sage' }
        ]
      },
      {
        type: 'payment',
        name: 'Paiement',
        providers: [
          { id: 'stripe', name: 'Stripe' },
          { id: 'paypal', name: 'PayPal' },
          { id: 'mtn', name: 'MTN Mobile Money' },
          { id: 'orange', name: 'Orange Money' }
        ]
      },
      {
        type: 'crm',
        name: 'CRM',
        providers: [
          { id: 'hubspot', name: 'HubSpot' },
          { id: 'salesforce', name: 'Salesforce' },
          { id: 'zoho', name: 'Zoho CRM' }
        ]
      },
      {
        type: 'inventory',
        name: 'Inventaire',
        providers: [
          { id: 'tradegecko', name: 'TradeGecko' },
          { id: 'inventoria', name: 'Inventoria' }
        ]
      },
      {
        type: 'analytics',
        name: 'Analytics',
        providers: [
          { id: 'google-analytics', name: 'Google Analytics' },
          { id: 'mixpanel', name: 'Mixpanel' },
          { id: 'amplitude', name: 'Amplitude' }
        ]
      }
    ];
  }
}