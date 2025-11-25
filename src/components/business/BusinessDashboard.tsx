"use client";

import React from 'react';
import type { Business } from '@/types';
import { StatCard } from '../dashboard/StatCard';
// Importer les fonctions de calcul depuis le nouveau fichier
import { 
    calculateTotalSalesRevenue,
    calculateCOGS,
    calculateOperatingExpenses,
    formatCurrency
} from '@/utils/calculations';

interface BusinessDashboardProps {
  business: Business;
}

export const BusinessDashboard: React.FC<BusinessDashboardProps> = ({ business }) => {
  // Calculate business statistics
  const totalSales = calculateTotalSalesRevenue(business.sales || []);
  const totalCOGS = calculateCOGS(business.sales || [], business.products || []);
  const totalOperationalExpenses = calculateOperatingExpenses(business.expenses || []);
  const netProfit = totalSales - totalCOGS - totalOperationalExpenses;
  const totalProducts = (business.products || []).length;
  const lowStockProducts = (business.products || []).filter(p => p.stock < 10).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{business.name}</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">{business.type}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Revenu Total" 
          value={formatCurrency(totalSales)} 
          change="+12.5%" 
          icon="revenue"
        />
        
        <StatCard 
          title="Coût des Marchandises" 
          value={formatCurrency(totalCOGS)} 
          change="-2.1%" 
          icon="expense"
        />
        
        <StatCard 
          title="Dépenses Opérationnelles" 
          value={formatCurrency(totalOperationalExpenses)} 
          change="-5.2%" 
          icon="expense"
        />
        
        <StatCard 
          title="Bénéfice Net" 
          value={formatCurrency(netProfit)} 
          change="+8.1%" 
          icon="profit"
        />
      </div>

      {/* Business Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Aperçu de l'entreprise</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Clients</h3>
            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{(business.clients || []).length}</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Fournisseurs</h3>
            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{(business.suppliers || []).length}</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Produits en stock</h3>
            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
              {(business.products || []).reduce((sum, product) => sum + product.stock, 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
