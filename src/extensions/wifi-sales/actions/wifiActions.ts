"use server";

import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { Product, Sale } from '@/types';

// Créer un ticket Wi-Fi comme produit
export async function createWifiTicket(businessId: string, name: string, unitPrice: number, stock: number = 999999) {
  try {
    // Vérifier si un ticket avec le même nom existe déjà
    const existingProduct = await prisma.product.findFirst({
      where: {
        businessId,
        name,
        category: 'Wi-Fi'
      }
    });
    
    if (existingProduct) {
      return { success: true, data: existingProduct };
    }
    
    // S'assurer que le nom du produit contient "Wi-Fi"
    const formattedName = name.includes('Wi-Fi') ? name : `Wi-Fi ${name}`;
    
    const product = await prisma.product.create({
      data: {
        name: formattedName,
        description: `Ticket Wi-Fi ${name}`,
        category: 'Wi-Fi',
        stock: stock, // Utiliser le stock fourni ou la valeur par défaut
        minStock: 0,
        costPrice: 0,
        retailPrice: unitPrice,
        wholesalePrice: unitPrice,
        purchasePrice: 0,
        businessId,
      }
    });
    
    return { success: true, data: product };
  } catch (error) {
    console.error('Error creating Wi-Fi ticket:', error);
    return { success: false, error: 'Failed to create Wi-Fi ticket' };
  }
}

// Mettre à jour un ticket Wi-Fi
export async function updateWifiTicket(productId: string, businessId: string, name: string, unitPrice: number) {
  try {
    const product = await prisma.product.update({
      where: {
        id: productId,
        businessId
      },
      data: {
        name,
        retailPrice: unitPrice,
        wholesalePrice: unitPrice,
        updatedAt: new Date()
      }
    });
    
    return { success: true, data: product };
  } catch (error) {
    console.error('Error updating Wi-Fi ticket:', error);
    return { success: false, error: 'Failed to update Wi-Fi ticket' };
  }
}

// Supprimer un ticket Wi-Fi
export async function deleteWifiTicket(productId: string, businessId: string) {
  try {
    await prisma.product.delete({
      where: {
        id: productId,
        businessId
      }
    });
    
    return { success: true, message: 'Wi-Fi ticket deleted successfully' };
  } catch (error) {
    console.error('Error deleting Wi-Fi ticket:', error);
    return { success: false, error: 'Failed to delete Wi-Fi ticket' };
  }
}

// Créer une vente de ticket Wi-Fi
export async function createWifiSale(businessId: string, ticketId: string, ticketName: string, unitPrice: number, quantitySold: number, userId?: string) {
  try {
    const totalAmount = unitPrice * quantitySold;
    
    // Utiliser le nom du ticket tel quel (il devrait déjà contenir "Wi-Fi")
    const formattedTicketName = ticketName;
    
    // Créer la vente dans la table Sale existante
    const sale = await prisma.sale.create({
      data: {
        reference: `WIFI-${Date.now()}`,
        date: new Date(), // Utiliser un objet Date directement
        productName: formattedTicketName,
        quantity: quantitySold,
        unitPrice,
        discount: 0,
        tax: 0,
        total: totalAmount,
        profit: totalAmount, // Pour les tickets numériques, le profit est égal au total
        saleType: 'RETAIL',
        paymentStatus: 'PAID',
        paymentMethod: 'CASH',
        businessId,
        userId,
        productId: ticketId || null // Permettre null si le ticketId n'est pas fourni
      }
    });
    
    // Mettre à jour le stock du produit si l'ID du produit est fourni
    if (ticketId) {
      const product = await prisma.product.findUnique({
        where: {
          id: ticketId,
          businessId
        }
      });
      
      if (product && product.stock > 0) {
        // Mettre à jour le stock (décrémenter par la quantité vendue)
        await prisma.product.update({
          where: {
            id: ticketId,
            businessId
          },
          data: {
            stock: {
              decrement: quantitySold
            },
            updatedAt: new Date()
          }
        });
      }
    }
    
    return { success: true, data: sale };
  } catch (error) {
    console.error('Error creating Wi-Fi sale:', error);
    return { success: false, error: 'Failed to create Wi-Fi sale' };
  }
}

// Récupérer tous les tickets Wi-Fi d'une entreprise
export async function getWifiTickets(businessId: string) {
  try {
    const products = await prisma.product.findMany({
      where: {
        businessId,
        category: 'Wi-Fi'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return { success: true, data: products };
  } catch (error) {
    console.error('Error fetching Wi-Fi tickets:', error);
    return { success: false, error: 'Failed to fetch Wi-Fi tickets' };
  }
}

// Récupérer toutes les ventes Wi-Fi d'une entreprise
export async function getWifiSales(businessId: string) {
  try {
    // Récupérer d'abord les produits Wi-Fi pour obtenir leurs IDs
    const wifiProducts = await prisma.product.findMany({
      where: {
        businessId,
        category: 'Wi-Fi'
      }
    });
    
    // Si nous avons des produits Wi-Fi, récupérer les ventes associées
    let sales = [];
    if (wifiProducts.length > 0) {
      const productIds = wifiProducts.map(p => p.id);
      
      sales = await prisma.sale.findMany({
        where: {
          businessId,
          OR: [
            {
              productId: {
                in: productIds
              }
            },
            {
              productName: {
                contains: 'Wi-Fi'
              }
            }
          ]
        },
        orderBy: {
          date: 'desc'
        }
      });
    } else {
      // Si aucun produit Wi-Fi n'existe, chercher par nom de produit
      sales = await prisma.sale.findMany({
        where: {
          businessId,
          productName: {
            contains: 'Wi-Fi'
          }
        },
        orderBy: {
          date: 'desc'
        }
      });
    }
    
    return { success: true, data: sales };
  } catch (error) {
    console.error('Error fetching Wi-Fi sales:', error);
    return { success: false, error: 'Failed to fetch Wi-Fi sales' };
  }
}
