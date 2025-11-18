import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getBusinesses, 
  getBusinessById,
  createBusiness, 
  updateBusiness, 
  deleteBusiness 
} from '@/actions/businessActions';
import { Business } from '@/types';
import { DataTransferService } from '@/services/dataTransferService';

// Hook for fetching all businesses
export const useBusinesses = () => {
  return useQuery({
    queryKey: ['businesses'],
    queryFn: getBusinesses,
    select: (data) => data.success ? data.data : [],
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};

// Hook for fetching a single business by ID
export const useBusiness = (id: string) => {
  return useQuery({
    queryKey: ['business', id],
    queryFn: () => getBusinessById(id),
    select: (data) => data.success ? data.data : null,
    enabled: !!id, // Only run the query if id is truthy
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};

// Hook for creating a business
export const useCreateBusiness = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createBusiness,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
    },
  });
};

// Hook for updating a business
export const useUpdateBusiness = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Business> }) => 
      updateBusiness(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      if (data.success && data.data) {
        queryClient.invalidateQueries({ queryKey: ['business', data.data.id] });
      }
    },
  });
};

// Hook for deleting a business
export const useDeleteBusiness = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteBusiness,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
    },
  });
};

// Hook for transferring data between businesses
export const useTransferData = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      sourceBusiness, 
      targetBusiness, 
      dataTypes 
    }: { 
      sourceBusiness: Business; 
      targetBusiness: Business; 
      dataTypes: string[] 
    }) => {
      // Dans une vraie application, cela ferait un appel API
      // Pour cette démonstration, nous utilisons le service local
      await DataTransferService.transferData(sourceBusiness, targetBusiness, dataTypes);
      return { success: true };
    },
    onSuccess: () => {
      // Invalider les queries pour forcer un rechargement des données
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
    },
  });
};