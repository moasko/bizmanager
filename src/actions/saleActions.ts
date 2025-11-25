"use server";

import { prisma } from '@/lib/prisma';
import { Sale } from '@/types';
import { headers } from 'next/headers';

// Fetch sales for a business
export async function getSales(businessId: string) {
  try {
    const sales = await prisma.sale.findMany({
      where: { businessId },
    });
    
    return { success: true, data: sales };
  } catch (error) {
    console.error('Error fetching sales:', error);
    return { success: false, error: 'Failed to fetch sales' };
  }
}

// Create a new sale
export async function createSale(businessId: string, saleData: Omit<Sale, 'id' | 'reference' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'businessId'>) {
  try {
    // Generate a unique reference
    const reference = `REF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Si clientId est une chaîne vide, le définir comme null
    const clientId = saleData.clientId === '' ? null : saleData.clientId;
    
    // Récupérer le produit pour calculer le profit de manière fiable
    let profit = saleData.profit || 0;
    
    if (saleData.productId) {
      const product = await prisma.product.findUnique({
        where: { id: saleData.productId }
      });
      
      if (product) {
        // Recalculer le profit en utilisant le prix d'achat réel du produit
        const costPrice = product.costPrice > 0 ? product.costPrice : product.wholesalePrice;
        const totalCost = costPrice * saleData.quantity;
        profit = saleData.total - totalCost;
      }
    }
    
    const sale = await prisma.sale.create({
      data: {
        id: `sale-${Date.now()}`,
        reference: reference,
        date: new Date(saleData.date),
        clientId: clientId,
        productId: saleData.productId,
        productName: saleData.productName,
        quantity: saleData.quantity,
        unitPrice: saleData.unitPrice,
        discount: saleData.discount || 0,
        tax: saleData.tax || 0,
        total: saleData.total,
        profit: profit,
        saleType: saleData.saleType,
        paymentStatus: saleData.paymentStatus,
        paymentMethod: saleData.paymentMethod,
        businessId: businessId,
        userId: saleData.userId,
      },
    });
    
    // Mettre à jour le solde du client si un client est associé à la vente
    if (clientId) {
      // Récupérer le client
      const client = await prisma.client.findUnique({
        where: { id: clientId }
      });
      
      if (client) {
        // Mettre à jour le solde du client (ajouter le montant de la vente)
        await prisma.client.update({
          where: { id: clientId },
          data: {
            balance: client.balance + saleData.total,
            lastPurchaseDate: new Date()
          }
        });
      }
    }
    
    return { success: true, data: sale };
  } catch (error) {
    console.error('Error creating sale:', error);
    return { success: false, error: 'Failed to create sale' };
  }
}

// Update a sale
export async function updateSale(id: string, saleData: Partial<Omit<Sale, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>) {
  try {
    // Vérifier les autorisations - seul un admin peut modifier une vente
    const headersList = await headers();
    const userRole = headersList.get('x-user-role');
    
    if (userRole !== 'ADMIN') {
      return { success: false, error: 'Seuls les administrateurs peuvent modifier les ventes' };
    }
    
    const sale = await prisma.sale.update({
      where: { id },
      data: saleData,
    });
    
    return { success: true, data: sale };
  } catch (error) {
    console.error('Error updating sale:', error);
    return { success: false, error: 'Failed to update sale' };
  }
}

// Delete a sale
export async function deleteSale(id: string) {
  try {
    // Vérifier les autorisations - seul un admin peut supprimer une vente
    const headersList = await headers();
    const userRole = headersList.get('x-user-role');
    
    if (userRole !== 'ADMIN') {
      return { success: false, error: 'Seuls les administrateurs peuvent supprimer les ventes' };
    }
    
    await prisma.sale.delete({
      where: { id },
    });
    
    return { success: true, message: 'Sale deleted successfully' };
  } catch (error) {
    console.error('Error deleting sale:', error);
    return { success: false, error: 'Failed to delete sale' };
  }
}
