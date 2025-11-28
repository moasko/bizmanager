// Script pour mettre à jour les produits Wi-Fi existants
import { prisma } from '@/lib/prisma';

async function updateExistingWifiProducts(businessId: string) {
  try {
    console.log('=== Mise à jour des produits Wi-Fi ===');
    
    // Récupérer tous les produits Wi-Fi qui n'ont pas "Wi-Fi" dans le nom
    const wifiProducts = await prisma.product.findMany({
      where: {
        businessId,
        category: 'Wi-Fi',
        name: {
          not: {
            contains: 'Wi-Fi'
          }
        }
      }
    });
    
    console.log(`Trouvé ${wifiProducts.length} produits à mettre à jour`);
    
    // Mettre à jour chaque produit
    for (const product of wifiProducts) {
      const newName = `Wi-Fi ${product.name}`;
      console.log(`Mise à jour du produit: "${product.name}" -> "${newName}"`);
      
      await prisma.product.update({
        where: {
          id: product.id
        },
        data: {
          name: newName,
          description: `Ticket Wi-Fi ${product.name}`
        }
      });
    }
    
    console.log('Mise à jour terminée!');
    
    // Vérifier les ventes associées et les mettre à jour si nécessaire
    const wifiSales = await prisma.sale.findMany({
      where: {
        businessId,
        productName: {
          not: {
            contains: 'Wi-Fi'
          }
        },
        OR: [
          {
            productName: {
              contains: 'journee'
            }
          },
          {
            productName: {
              contains: 'heure'
            }
          }
        ]
      }
    });
    
    console.log(`Trouvé ${wifiSales.length} ventes à mettre à jour`);
    
    // Mettre à jour chaque vente
    for (const sale of wifiSales) {
      const newProductName = `Wi-Fi ${sale.productName}`;
      console.log(`Mise à jour de la vente: "${sale.productName}" -> "${newProductName}"`);
      
      await prisma.sale.update({
        where: {
          id: sale.id
        },
        data: {
          productName: newProductName
        }
      });
    }
    
    console.log('Mise à jour des ventes terminée!');
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
  }
}

// Exemple d'utilisation:
// updateExistingWifiProducts('biz-1763477176793');

export default updateExistingWifiProducts;