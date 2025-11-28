"use server";

import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

// Récupérer les données d'une extension pour une entreprise
export async function getExtensionData(extensionId: string, businessId: string, key: string) {
  try {
    const data = await prisma.extensionData.findUnique({
      where: {
        extensionId_businessId_key: {
          extensionId,
          businessId,
          key
        }
      }
    });
    
    return { success: true, data: data?.data || null };
  } catch (error) {
    console.error('Error fetching extension data:', error);
    return { success: false, error: 'Failed to fetch extension data' };
  }
}

// Sauvegarder ou mettre à jour les données d'une extension pour une entreprise
export async function saveExtensionData(
  extensionId: string, 
  businessId: string, 
  key: string, 
  data: any,
  userId?: string
) {
  try {
    const extensionData = await prisma.extensionData.upsert({
      where: {
        extensionId_businessId_key: {
          extensionId,
          businessId,
          key
        }
      },
      update: {
        data,
        userId,
        updatedAt: new Date()
      },
      create: {
        extensionId,
        businessId,
        key,
        data,
        userId
      }
    });
    
    return { success: true, data: extensionData };
  } catch (error) {
    console.error('Error saving extension data:', error);
    return { success: false, error: 'Failed to save extension data' };
  }
}

// Supprimer les données d'une extension pour une entreprise
export async function deleteExtensionData(extensionId: string, businessId: string, key: string) {
  try {
    await prisma.extensionData.delete({
      where: {
        extensionId_businessId_key: {
          extensionId,
          businessId,
          key
        }
      }
    });
    
    return { success: true, message: 'Extension data deleted successfully' };
  } catch (error) {
    console.error('Error deleting extension data:', error);
    return { success: false, error: 'Failed to delete extension data' };
  }
}

// Récupérer toutes les données d'une extension pour une entreprise
export async function getAllExtensionDataForBusiness(extensionId: string, businessId: string) {
  try {
    const data = await prisma.extensionData.findMany({
      where: {
        extensionId,
        businessId
      }
    });
    
    // Convertir en objet avec les clés comme propriétés
    const result: Record<string, any> = {};
    data.forEach((item: any) => {
      result[item.key] = item.data;
    });
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Error fetching all extension data:', error);
    return { success: false, error: 'Failed to fetch extension data' };
  }
}