import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getSales, 
  createSale, 
  updateSale, 
  deleteSale 
} from '@/actions/saleActions';
import { Sale } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useCallback } from 'react';

// Hook for fetching sales for a business
export const useSales = (businessId: string) => {
  return useQuery({
    queryKey: ['sales', businessId],
    queryFn: () => getSales(businessId),
    select: (data) => data.success ? data.data : [],
  });
};

// Hook for creating a sale
export const useCreateSale = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ businessId, data }: { businessId: string; data: Omit<Sale, 'id' | 'reference' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'businessId'> }) => 
      createSale(businessId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sales', variables.businessId] });
      // Also invalidate products and clients as they may have been updated
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};

// Hook for updating a sale
export const useUpdateSale = () => {
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';
  
  const updateSaleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Sale> }) => 
      updateSale(id, data),
    onSuccess: () => {
      // We don't know which business this sale belongs to, so we invalidate all queries
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
  
  // Wrapper function to check permissions before updating
  const updateSaleWithPermissionCheck = useCallback((params: { id: string; data: Partial<Sale> }) => {
    if (!isAdmin) {
      throw new Error('Seuls les administrateurs peuvent modifier les ventes');
    }
    return updateSaleMutation.mutateAsync(params);
  }, [isAdmin, updateSaleMutation]);
  
  return {
    ...updateSaleMutation,
    mutate: updateSaleWithPermissionCheck,
    mutateAsync: updateSaleWithPermissionCheck
  };
};

// Hook for deleting a sale
export const useDeleteSale = () => {
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';
  
  const deleteSaleMutation = useMutation({
    mutationFn: deleteSale,
    onSuccess: () => {
      // We don't know which business this sale belongs to, so we invalidate all queries
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
  
  // Wrapper function to check permissions before deleting
  const deleteSaleWithPermissionCheck = useCallback((id: string) => {
    if (!isAdmin) {
      throw new Error('Seuls les administrateurs peuvent supprimer les ventes');
    }
    return deleteSaleMutation.mutateAsync(id);
  }, [isAdmin, deleteSaleMutation]);
  
  return {
    ...deleteSaleMutation,
    mutate: deleteSaleWithPermissionCheck,
    mutateAsync: deleteSaleWithPermissionCheck
  };
};