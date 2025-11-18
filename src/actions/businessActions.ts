"use server";

import { prisma } from '@/lib/prisma';
import { Business, Sale, Expense, Product, Client, Supplier } from '@/types';

// Helper function to convert Prisma model to TypeScript interface
function serializeBusinessData(business: any): Business {
  return {
    id: business.id,
    name: business.name,
    type: business.type,
    country: business.country ?? undefined,
    city: business.city ?? undefined,
    currency: business.currency ?? undefined,
    logoUrl: business.logoUrl ?? undefined,
    settings: business.settings ?? undefined,
    sales: business.sales.map((sale: any) => ({
      id: sale.id,
      reference: sale.reference,
      date: sale.date instanceof Date ? sale.date.toISOString() : sale.date,
      clientId: sale.clientId ?? undefined,
      clientName: sale.clientName ?? undefined,
      productId: sale.productId ?? undefined,
      productName: sale.productName,
      quantity: sale.quantity,
      unitPrice: sale.unitPrice,
      discount: sale.discount,
      tax: sale.tax,
      total: sale.total,
      profit: sale.profit,
      saleType: sale.saleType,
      paymentStatus: sale.paymentStatus,
      paymentMethod: sale.paymentMethod,
      businessId: sale.businessId,
      userId: sale.userId ?? undefined,
      createdAt: sale.createdAt instanceof Date ? sale.createdAt.toISOString() : sale.createdAt,
      updatedAt: sale.updatedAt instanceof Date ? sale.updatedAt.toISOString() : sale.updatedAt,
      deletedAt: sale.deletedAt ? (sale.deletedAt instanceof Date ? sale.deletedAt.toISOString() : sale.deletedAt) : undefined,
    })),
    expenses: business.expenses.map((expense: any) => ({
      id: expense.id,
      reference: expense.reference ?? undefined,
      date: expense.date instanceof Date ? expense.date.toISOString() : expense.date,
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      paymentMethod: expense.paymentMethod,
      receiptUrl: expense.receiptUrl ?? undefined,
      approvedById: expense.approvedById ?? undefined,
      businessId: expense.businessId,
      createdAt: expense.createdAt instanceof Date ? expense.createdAt.toISOString() : expense.createdAt,
      updatedAt: expense.updatedAt instanceof Date ? expense.updatedAt.toISOString() : expense.updatedAt,
      deletedAt: expense.deletedAt ? (expense.deletedAt instanceof Date ? expense.deletedAt.toISOString() : expense.deletedAt) : undefined,
    })),
    products: business.products.map((product: any) => ({
      id: product.id,
      name: product.name,
      category: product.category,
      sku: product.sku ?? undefined,
      barcode: product.barcode ?? undefined,
      stock: product.stock,
      minStock: product.minStock,
      costPrice: product.costPrice,
      retailPrice: product.retailPrice,
      wholesalePrice: product.wholesalePrice,
      images: product.images ?? undefined,
      supplierId: product.supplierId ?? undefined,
      businessId: product.businessId,
      createdAt: product.createdAt instanceof Date ? product.createdAt.toISOString() : product.createdAt,
      updatedAt: product.updatedAt instanceof Date ? product.updatedAt.toISOString() : product.updatedAt,
      deletedAt: product.deletedAt ? (product.deletedAt instanceof Date ? product.deletedAt.toISOString() : product.deletedAt) : undefined,
    })),
    clients: business.clients.map((client: any) => ({
      id: client.id,
      name: client.name,
      contact: client.contact,
      telephone: client.telephone ?? undefined,
      balance: client.balance,
      email: client.email ?? undefined,
      address: client.address ?? undefined,
      company: client.company ?? undefined,
      notes: client.notes ?? undefined,
      loyaltyPoints: client.loyaltyPoints,
      lastPurchaseDate: client.lastPurchaseDate ? (client.lastPurchaseDate instanceof Date ? client.lastPurchaseDate.toISOString() : client.lastPurchaseDate) : undefined,
      businessId: client.businessId,
      createdAt: client.createdAt instanceof Date ? client.createdAt.toISOString() : client.createdAt,
      updatedAt: client.updatedAt instanceof Date ? client.updatedAt.toISOString() : client.updatedAt,
      deletedAt: client.deletedAt ? (client.deletedAt instanceof Date ? client.deletedAt.toISOString() : client.deletedAt) : undefined,
    })),
    suppliers: business.suppliers.map((supplier: any) => ({
      id: supplier.id,
      name: supplier.name,
      product: supplier.product,
      contacts: supplier.contacts ?? undefined,
      email: supplier.email ?? undefined,
      telephone: supplier.telephone ?? undefined,
      address: supplier.address ?? undefined,
      description: supplier.description ?? undefined,
      productTypes: supplier.productTypes ?? undefined,
      rating: supplier.rating ?? undefined,
      notes: supplier.notes ?? undefined,
      businessId: supplier.businessId,
      createdAt: supplier.createdAt instanceof Date ? supplier.createdAt.toISOString() : supplier.createdAt,
      updatedAt: supplier.updatedAt instanceof Date ? supplier.updatedAt.toISOString() : supplier.updatedAt,
      deletedAt: supplier.deletedAt ? (supplier.deletedAt instanceof Date ? supplier.deletedAt.toISOString() : supplier.deletedAt) : undefined,
    })),
    createdAt: business.createdAt instanceof Date ? business.createdAt.toISOString() : business.createdAt,
    updatedAt: business.updatedAt instanceof Date ? business.updatedAt.toISOString() : business.updatedAt,
    deletedAt: business.deletedAt ? (business.deletedAt instanceof Date ? business.deletedAt.toISOString() : business.deletedAt) : undefined,
  };
}

// Fetch all businesses
export async function getBusinesses() {
  try {
    const businesses = await prisma.business.findMany({
      include: {
        sales: true,
        expenses: true,
        products: true,
        clients: true,
        suppliers: true,
      },
    });
    
    // Convert Date objects to strings
    const serializedBusinesses = businesses.map(serializeBusinessData);
    
    return { success: true, data: serializedBusinesses };
  } catch (error) {
    console.error('Error fetching businesses:', error);
    return { success: false, error: 'Failed to fetch businesses' };
  }
}

// Fetch a single business by ID with all related data
export async function getBusinessById(id: string) {
  try {
    const business = await prisma.business.findUnique({
      where: { id },
      include: {
        sales: true,
        expenses: true,
        products: true,
        clients: true,
        suppliers: true,
      },
    });
    
    if (!business) {
      return { success: false, error: 'Business not found' };
    }
    
    // Convert Date objects to strings
    const serializedBusiness = serializeBusinessData(business);
    
    return { success: true, data: serializedBusiness };
  } catch (error) {
    console.error('Error fetching business:', error);
    return { success: false, error: 'Failed to fetch business' };
  }
}

// Create a new business
export async function createBusiness(businessData: Omit<Business, 'id' | 'sales' | 'expenses' | 'products' | 'clients' | 'suppliers' | 'createdAt' | 'updatedAt' | 'deletedAt'>) {
  try {
    const business = await prisma.business.create({
      data: {
        id: `biz-${Date.now()}`,
        name: businessData.name,
        type: businessData.type,
        country: businessData.country,
        city: businessData.city,
        currency: businessData.currency,
        logoUrl: businessData.logoUrl,
        settings: businessData.settings,
      },
    });
    
    return { success: true, data: business };
  } catch (error) {
    console.error('Error creating business:', error);
    return { success: false, error: 'Failed to create business' };
  }
}

// Update a business (only basic fields, not relations)
export async function updateBusiness(id: string, businessData: Partial<Omit<Business, 'id' | 'sales' | 'expenses' | 'products' | 'clients' | 'suppliers' | 'createdAt' | 'updatedAt' | 'deletedAt'>>) {
  try {
    const business = await prisma.business.update({
      where: { id },
      data: {
        name: businessData.name,
        type: businessData.type,
        country: businessData.country,
        city: businessData.city,
        currency: businessData.currency,
        logoUrl: businessData.logoUrl,
        settings: businessData.settings,
      },
    });
    
    return { success: true, data: business };
  } catch (error) {
    console.error('Error updating business:', error);
    return { success: false, error: 'Failed to update business' };
  }
}

// Delete a business
export async function deleteBusiness(id: string) {
  try {
    await prisma.business.delete({
      where: { id },
    });
    
    return { success: true, message: 'Business deleted successfully' };
  } catch (error) {
    console.error('Error deleting business:', error);
    return { success: false, error: 'Failed to delete business' };
  }
}