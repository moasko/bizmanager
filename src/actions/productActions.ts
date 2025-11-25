"use server";

import { prisma } from '@/lib/prisma';
import { Product } from '@/types';

// Fetch products for a business
export async function getProducts(businessId: string) {
  try {
    const products = await prisma.product.findMany({
      where: { businessId },
    });
    
    return { success: true, data: products };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { success: false, error: 'Failed to fetch products' };
  }
}

// Create a new product
export async function createProduct(businessId: string, productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>) {
  try {
    // Create the base product data
    const productDataToCreate: any = {
      id: `prod-${Date.now()}`,
      name: productData.name,
      description: productData.description,
      category: productData.category,
      stock: productData.stock,
      minStock: productData.minStock || 0,
      costPrice: productData.costPrice || 0,
      retailPrice: productData.retailPrice,
      wholesalePrice: productData.wholesalePrice,
      purchasePrice: productData.purchasePrice || 0,
      businessId: businessId,
    };
    
    // Add optional fields if they exist
    if (productData.sku) {
      productDataToCreate.sku = productData.sku;
    }
    
    if (productData.barcode) {
      productDataToCreate.barcode = productData.barcode;
    }
    
    if (productData.supplierId) {
      productDataToCreate.supplierId = productData.supplierId;
    }
    
    if (productData.images) {
      productDataToCreate.images = productData.images;
    }
    
    const product = await prisma.product.create({
      data: productDataToCreate,
    });
    
    return { success: true, data: product };
  } catch (error) {
    console.error('Error creating product:', error);
    return { success: false, error: 'Failed to create product' };
  }
}

// Update a product
export async function updateProduct(id: string, productData: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>) {
  try {
    // Create the update data object
    const updateData: any = {};
    
    // Add fields that are provided
    if (productData.name !== undefined) updateData.name = productData.name;
    if (productData.description !== undefined) updateData.description = productData.description;
    if (productData.category !== undefined) updateData.category = productData.category;
    if (productData.stock !== undefined) updateData.stock = productData.stock;
    if (productData.minStock !== undefined) updateData.minStock = productData.minStock;
    if (productData.costPrice !== undefined) updateData.costPrice = productData.costPrice;
    if (productData.retailPrice !== undefined) updateData.retailPrice = productData.retailPrice;
    if (productData.wholesalePrice !== undefined) updateData.wholesalePrice = productData.wholesalePrice;
    if (productData.purchasePrice !== undefined) updateData.purchasePrice = productData.purchasePrice;
    if (productData.sku !== undefined) updateData.sku = productData.sku;
    if (productData.barcode !== undefined) updateData.barcode = productData.barcode;
    if (productData.supplierId !== undefined) updateData.supplierId = productData.supplierId;
    if (productData.images !== undefined) updateData.images = productData.images;
    
    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });
    
    return { success: true, data: product };
  } catch (error) {
    console.error('Error updating product:', error);
    return { success: false, error: 'Failed to update product' };
  }
}

// Delete a product
export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({
      where: { id },
    });
    
    return { success: true, message: 'Product deleted successfully' };
  } catch (error) {
    console.error('Error deleting product:', error);
    return { success: false, error: 'Failed to delete product' };
  }
}