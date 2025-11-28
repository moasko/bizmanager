import { useState, useEffect } from 'react';
import { Extension } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

// Simuler un store d'extensions en mémoire
let extensionsStore: Extension[] = [
  {
    id: 'wifi-sales',
    name: 'Ventes Wi-Fi',
    description: 'Suivi et analyse des ventes de tickets Wi-Fi',
    version: '1.0.0',
    author: 'Équipe DevSongue',
    icon: 'Wifi',
    enabled: true,
    installed: true,
    settings: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Simuler les assignations d'extensions aux entreprises
let extensionAssignments: Record<string, string[]> = {
  'wifi-sales': ['business-1', 'business-2'] // Exemple d'assignation par entreprise
};

// Simuler les assignations d'extensions aux utilisateurs
let userExtensionAssignments: Record<string, string[]> = {
  'wifi-sales': ['admin-user-id', 'user-123'] // Exemple d'assignation par utilisateur
};

export const useExtensions = (activeBusiness: any = null) => {
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    // Simuler le chargement depuis un store
    setTimeout(() => {
      // Filtrer les extensions en fonction des permissions de l'utilisateur et de l'entreprise active
      let filteredExtensions = extensionsStore;
      
      // Si une entreprise est active, ne montrer que les extensions assignées à cette entreprise
      if (activeBusiness?.id) {
        filteredExtensions = filteredExtensions.filter(ext => 
          extensionAssignments[ext.id]?.includes(activeBusiness.id) || ext.id === 'wifi-sales'
        );
      }
      
      // Si l'utilisateur n'est pas admin, ne montrer que les extensions activées
      if (currentUser && currentUser.role !== 'ADMIN') {
        filteredExtensions = filteredExtensions.filter(ext => ext.enabled);
      }
      
      setExtensions(filteredExtensions);
      setLoading(false);
    }, 500);
  }, [currentUser, activeBusiness]);

  const toggleExtension = (id: string, businessId?: string) => {
    setExtensions(prev => {
      const updated = prev.map(ext => {
        if (ext.id === id) {
          const updatedExt = { ...ext, enabled: !ext.enabled, updatedAt: new Date().toISOString() };
          // Mettre à jour le store
          extensionsStore = extensionsStore.map(e => e.id === id ? updatedExt : e);
          
          // Si une entreprise est spécifiée, gérer l'assignation
          if (businessId && !ext.enabled) { // Si on active l'extension
            if (!extensionAssignments[id]) {
              extensionAssignments[id] = [];
            }
            if (!extensionAssignments[id].includes(businessId)) {
              extensionAssignments[id].push(businessId);
            }
          }
          
          return updatedExt;
        }
        return ext;
      });
      return updated;
    });
  };

  const installExtension = (extension: Omit<Extension, 'id' | 'installed' | 'enabled' | 'createdAt' | 'updatedAt'>) => {
    const newExtension: Extension = {
      ...extension,
      id: `${extensionsStore.length + 1}`,
      installed: true,
      enabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setExtensions(prev => [...prev, newExtension]);
    extensionsStore = [...extensionsStore, newExtension];
  };

  const uninstallExtension = (id: string) => {
    setExtensions(prev => {
      const updated = prev.filter(ext => ext.id !== id);
      // Mettre à jour le store
      extensionsStore = extensionsStore.filter(ext => ext.id !== id);
      return updated;
    });
  };

  // Assigner une extension à une entreprise
  const assignExtensionToBusiness = (extensionId: string, businessId: string) => {
    if (!extensionAssignments[extensionId]) {
      extensionAssignments[extensionId] = [];
    }
    
    if (!extensionAssignments[extensionId].includes(businessId)) {
      extensionAssignments[extensionId].push(businessId);
    }
  };

  // Retirer l'assignation d'une extension à une entreprise
  const unassignExtensionFromBusiness = (extensionId: string, businessId: string) => {
    if (extensionAssignments[extensionId]) {
      extensionAssignments[extensionId] = extensionAssignments[extensionId].filter(id => id !== businessId);
    }
  };

  // Assigner une extension à un utilisateur
  const assignExtensionToUser = (extensionId: string, userId: string) => {
    if (!userExtensionAssignments[extensionId]) {
      userExtensionAssignments[extensionId] = [];
    }
    
    if (!userExtensionAssignments[extensionId].includes(userId)) {
      userExtensionAssignments[extensionId].push(userId);
    }
  };

  // Retirer l'assignation d'une extension à un utilisateur
  const unassignExtensionFromUser = (extensionId: string, userId: string) => {
    if (userExtensionAssignments[extensionId]) {
      userExtensionAssignments[extensionId] = userExtensionAssignments[extensionId].filter(id => id !== userId);
    }
  };

  // Vérifier si une entreprise a accès à une extension
  const businessHasAccessToExtension = (extensionId: string, businessId: string) => {
    return extensionAssignments[extensionId]?.includes(businessId) || false;
  };

  // Vérifier si un utilisateur a accès à une extension
  const userHasAccessToExtension = (extensionId: string, userId: string) => {
    // L'admin a toujours accès
    if (currentUser?.role === 'ADMIN') return true;
    
    // Vérifier si l'extension est assignée à l'utilisateur
    return userExtensionAssignments[extensionId]?.includes(userId) || false;
  };

  // Récupérer les entreprises assignées à une extension
  const getBusinessesAssignedToExtension = (extensionId: string) => {
    return extensionAssignments[extensionId] || [];
  };

  // Récupérer les utilisateurs assignés à une extension
  const getUsersAssignedToExtension = (extensionId: string) => {
    return userExtensionAssignments[extensionId] || [];
  };

  return {
    extensions,
    loading,
    toggleExtension,
    installExtension,
    uninstallExtension,
    assignExtensionToBusiness,
    unassignExtensionFromBusiness,
    assignExtensionToUser,
    unassignExtensionFromUser,
    businessHasAccessToExtension,
    userHasAccessToExtension,
    getBusinessesAssignedToExtension,
    getUsersAssignedToExtension,
    activeBusiness
  };
};