import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '@/actions/productActions';
import { Product } from '@/types';

// Hook for fetching products for a business
export const useProducts = (businessId: string) => {
  return useQuery({
    queryKey: ['products', businessId],
    queryFn: () => getProducts(businessId),
    select: (data) => data.success ? data.data : [],
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};

// Hook for creating a product
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ businessId, data }: { businessId: string; data: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> }) => 
      createProduct(businessId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products', variables.businessId] });
    },
  });
};

// Hook for updating a product
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>> }) => 
      updateProduct(id, data),
    onSuccess: (_, variables) => {
      // We don't know which business this product belongs to, so we invalidate all product queries
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

// Hook for deleting a product
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      // We don't know which business this product belongs to, so we invalidate all product queries
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};