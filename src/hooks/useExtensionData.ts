import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getExtensionData, 
  saveExtensionData, 
  deleteExtensionData,
  getAllExtensionDataForBusiness
} from '@/actions/extensionDataActions';
import { useAuth } from '@/contexts/AuthContext';
import { useActiveBusiness } from '@/contexts/ActiveBusinessContext';
import { ActionResult } from '@/types';

// Hook pour récupérer les données d'une extension
export const useExtensionData = (extensionId: string, key: string) => {
  const { currentUser } = useAuth();
  const { activeBusiness } = useActiveBusiness();
  
  return useQuery({
    queryKey: ['extensionData', extensionId, activeBusiness?.id, key],
    queryFn: async () => {
      if (!activeBusiness?.id) {
        return null;
      }
      return await getExtensionData(extensionId, activeBusiness.id, key);
    },
    select: (data) => data?.success ? data.data : null,
    enabled: !!activeBusiness?.id && !!currentUser,
  });
};

// Hook pour sauvegarder les données d'une extension
export const useSaveExtensionData = () => {
  const queryClient = useQueryClient();
  const { activeBusiness } = useActiveBusiness();
  
  return useMutation({
    mutationFn: async ({ 
      extensionId, 
      key, 
      data,
      userId
    }: { 
      extensionId: string; 
      key: string; 
      data: any;
      userId?: string;
    }) => {
      if (!activeBusiness?.id) {
        throw new Error('No active business');
      }
      return await saveExtensionData(extensionId, activeBusiness.id, key, data, userId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['extensionData', variables.extensionId, activeBusiness?.id, variables.key] 
      });
    },
  });
};

// Hook pour supprimer les données d'une extension
export const useDeleteExtensionData = () => {
  const queryClient = useQueryClient();
  const { activeBusiness } = useActiveBusiness();
  
  return useMutation({
    mutationFn: async ({ extensionId, key }: { extensionId: string; key: string }) => {
      if (!activeBusiness?.id) {
        throw new Error('No active business');
      }
      return await deleteExtensionData(extensionId, activeBusiness.id, key);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['extensionData', variables.extensionId, activeBusiness?.id, variables.key] 
      });
    },
  });
};

// Hook pour récupérer toutes les données d'une extension pour une entreprise
export const useAllExtensionData = (extensionId: string) => {
  const { currentUser } = useAuth();
  const { activeBusiness } = useActiveBusiness();
  
  return useQuery({
    queryKey: ['allExtensionData', extensionId, activeBusiness?.id],
    queryFn: async () => {
      if (!activeBusiness?.id) {
        return { success: true, data: {} } as ActionResult<Record<string, any>>;
      }
      return await getAllExtensionDataForBusiness(extensionId, activeBusiness.id);
    },
    select: (data) => data?.success ? data.data : {},
    enabled: !!activeBusiness?.id && !!currentUser,
  });
};