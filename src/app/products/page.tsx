"use client";

import React from 'react';
import { Products } from '@/components/products/Products';
import { MainLayout } from '@/components/layout/MainLayout';
import { useBusinesses } from '@/hooks/useBusiness';
import { useCreateProduct, useUpdateProduct } from '@/hooks/useProduct';

export default function ProductsPage() {
  const { data: businesses = [], isLoading: isBusinessesLoading } = useBusinesses();
  const { mutateAsync: createProduct } = useCreateProduct();
  const { mutateAsync: updateProduct } = useUpdateProduct();
  
  if (isBusinessesLoading) {
    return <div className="flex justify-center items-center h-64">Chargement des produits...</div>;
  }
  
  // For now, we'll show the first business
  const activeBusiness = businesses[0];
  
  if (!activeBusiness) {
    return <div className="flex justify-center items-center h-64">Aucune entreprise trouvée.</div>;
  }
  
  const handleAddProduct = async (newProduct: any) => {
    try {
      await createProduct(newProduct);
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };
  
  const handleUpdateProduct = async (updatedProduct: any) => {
    try {
      await updateProduct(updatedProduct);
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  return (
    <MainLayout businesses={businesses}>
      <div className="p-4 md:p-8">
        <Products 
          business={activeBusiness} 
          onAddProduct={handleAddProduct} 
          onUpdateProduct={handleUpdateProduct} 
        />
      </div>
    </MainLayout>
  );
}