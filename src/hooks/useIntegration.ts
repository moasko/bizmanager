import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Integration, IntegrationService } from '@/services/integrationService';

// Hook pour récupérer les intégrations d'une entreprise
export const useIntegrations = (businessId: string) => {
  return useQuery({
    queryKey: ['integrations', businessId],
    queryFn: () => IntegrationService.getIntegrations(businessId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook pour connecter une intégration
export const useConnectIntegration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ businessId, type, apiKey }: { businessId: string; type: any; apiKey: string }) => 
      IntegrationService.connectIntegration(businessId, type, apiKey),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['integrations', variables.businessId] });
    },
  });
};

// Hook pour déconnecter une intégration
export const useDisconnectIntegration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (integrationId: string) => IntegrationService.disconnectIntegration(integrationId),
    onSuccess: (_, integrationId) => {
      // Trouver l'ID de l'entreprise à partir de l'ID d'intégration
      // Dans une vraie application, cela serait plus propre
      const businessId = integrationId.split('-')[0];
      queryClient.invalidateQueries({ queryKey: ['integrations', businessId] });
    },
  });
};

// Hook pour mettre à jour les paramètres d'une intégration
export const useUpdateIntegrationSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ integrationId, settings }: { integrationId: string; settings: any }) => 
      IntegrationService.updateIntegrationSettings(integrationId, settings),
    onSuccess: (data) => {
      // Trouver l'ID de l'entreprise à partir de l'intégration
      // Dans une vraie application, cela serait plus propre
      const businessId = data.businessId;
      queryClient.invalidateQueries({ queryKey: ['integrations', businessId] });
    },
  });
};

// Hook pour synchroniser une intégration
export const useSyncIntegration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (integrationId: string) => IntegrationService.syncIntegration(integrationId),
    onSuccess: (_, integrationId) => {
      // Trouver l'ID de l'entreprise à partir de l'ID d'intégration
      // Dans une vraie application, cela serait plus propre
      const businessId = integrationId.split('-')[0];
      queryClient.invalidateQueries({ queryKey: ['integrations', businessId] });
    },
  });
};