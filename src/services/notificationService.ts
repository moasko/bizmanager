import type { Business, Product, Sale, Expense, Notification } from '@/types';

// Générer des notifications basées sur les données de l'entreprise
export const generateNotifications = (business: Business): Notification[] => {
  const notifications: Notification[] = [];
  const now = new Date().toISOString();
  
  // Vérifier les stocks faibles
  if (business.settings?.notifications?.enableLowStockAlerts !== false) {
    const lowStockThreshold = business.settings?.notifications?.lowStockThreshold || 5;
    
    business.products?.forEach((product: Product) => {
      if (product.stock <= lowStockThreshold) {
        notifications.push({
          id: `low_stock_${product.id}_${Date.now()}`,
          businessId: business.id,
          type: 'LOW_STOCK',
          priority: 'HIGH',
          title: 'Stock faible',
          message: `Le produit "${product.name}" est presque en rupture de stock (${product.stock} unités restantes)`,
          read: false,
          createdAt: now,
          relatedEntityId: product.id
        });
      }
    });
  }
  
  // Vérifier les objectifs de ventes
  if (business.settings?.notifications?.enableSalesTargetAlerts !== false) {
    const salesTarget = business.settings?.notifications?.salesTarget || 1000000;
    const totalSales = business.sales?.reduce((sum, sale) => sum + sale.total, 0) || 0;
    
    // Calculer le pourcentage d'atteinte de l'objectif
    const percentage = (totalSales / salesTarget) * 100;
    
    // Envoyer des notifications à 50%, 80% et 100%
    if (percentage >= 50 && percentage < 51) {
      notifications.push({
        id: `sales_target_50_${business.id}_${Date.now()}`,
        businessId: business.id,
        type: 'SALES_TARGET',
        priority: 'MEDIUM',
        title: 'Objectif de ventes - 50% atteint',
        message: `Félicitations ! Vous avez atteint 50% de votre objectif mensuel de ventes (${totalSales.toLocaleString('fr-FR')} FCFA / ${salesTarget.toLocaleString('fr-FR')} FCFA)`,
        read: false,
        createdAt: now
      });
    }
    
    if (percentage >= 80 && percentage < 81) {
      notifications.push({
        id: `sales_target_80_${business.id}_${Date.now()}`,
        businessId: business.id,
        type: 'SALES_TARGET',
        priority: 'MEDIUM',
        title: 'Objectif de ventes - 80% atteint',
        message: `Félicitations ! Vous avez atteint 80% de votre objectif mensuel de ventes (${totalSales.toLocaleString('fr-FR')} FCFA / ${salesTarget.toLocaleString('fr-FR')} FCFA)`,
        read: false,
        createdAt: now
      });
    }
    
    if (percentage >= 100) {
      notifications.push({
        id: `sales_target_100_${business.id}_${Date.now()}`,
        businessId: business.id,
        type: 'SALES_TARGET',
        priority: 'HIGH',
        title: 'Objectif de ventes - 100% atteint !',
        message: `Félicitations ! Vous avez atteint votre objectif mensuel de ventes de ${salesTarget.toLocaleString('fr-FR')} FCFA`,
        read: false,
        createdAt: now
      });
    }
  }
  
  // Vérifier les dépenses importantes
  if (business.settings?.notifications?.enableExpenseAlerts !== false) {
    const expenseAlertThreshold = business.settings?.notifications?.expenseAlertThreshold || 100000;
    
    business.expenses?.forEach((expense: Expense) => {
      if (expense.amount >= expenseAlertThreshold) {
        notifications.push({
          id: `expense_alert_${expense.id}_${Date.now()}`,
          businessId: business.id,
          type: 'EXPENSE_ALERT',
          priority: 'URGENT',
          title: 'Dépense importante',
          message: `Une nouvelle dépense de ${expense.amount.toLocaleString('fr-FR')} FCFA a été enregistrée: ${expense.description}`,
          read: false,
          createdAt: now,
          relatedEntityId: expense.id
        });
      }
    });
  }
  
  return notifications;
};

// Générer une notification pour une nouvelle vente
export const generateNewSaleNotification = (businessId: string, sale: Sale): Notification => {
  return {
    id: `new_sale_${sale.id}_${Date.now()}`,
    businessId: businessId,
    type: 'NEW_SALE',
    priority: 'LOW',
    title: 'Nouvelle vente',
    message: `Une nouvelle vente de ${sale.total.toLocaleString('fr-FR')} FCFA a été enregistrée`,
    read: false,
    createdAt: new Date().toISOString(),
    relatedEntityId: sale.id
  };
};

// Générer une notification pour une nouvelle dépense
export const generateNewExpenseNotification = (businessId: string, expense: Expense): Notification => {
  return {
    id: `new_expense_${expense.id}_${Date.now()}`,
    businessId: businessId,
    type: 'NEW_EXPENSE',
    priority: 'LOW',
    title: 'Nouvelle dépense',
    message: `Une nouvelle dépense de ${expense.amount.toLocaleString('fr-FR')} FCFA a été enregistrée: ${expense.description}`,
    read: false,
    createdAt: new Date().toISOString(),
    relatedEntityId: expense.id
  };
};