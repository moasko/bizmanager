import React, { useState, useEffect } from 'react';
import type { Business, User, AuditLog } from '@/types';
import { Button } from '../shared/Button';
import { formatCurrency } from '@/utils/formatters';
import { AssignedEmployees } from './AssignedEmployees';
import { ActivityHistory } from './ActivityHistory';
import { AdvancedSettings } from './AdvancedSettings';
import { Bell, BarChart } from 'lucide-react';
import { DetailedReports } from '../reports/DetailedReports';

interface BusinessDetailsProps {
  business: Business;
  onEdit: () => void;
  onDelete: () => void;
  businessesCount: number;
  assignedEmployees: User[];
  onRemoveEmployee: (employeeId: string) => void;
  auditLogs: AuditLog[];
  onUpdateSettings: (businessId: string, settings: any) => void;
}

export const BusinessDetails: React.FC<BusinessDetailsProps> = ({ 
  business, 
  onEdit, 
  onDelete, 
  businessesCount,
  assignedEmployees,
  onRemoveEmployee,
  auditLogs,
  onUpdateSettings
}) => {
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [showReports, setShowReports] = useState(false);
  
  // Calculer les statistiques
  const totalSales = business.sales?.reduce((sum, sale) => sum + sale.total, 0) || 0;
  const totalExpenses = business.expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
  const totalProducts = business.products?.length || 0;
  const totalClients = business.clients?.length || 0;
  const totalSuppliers = business.suppliers?.length || 0;
  
  // Calculer le bénéfice net
  const netProfit = totalSales - totalExpenses;

  const handleSaveSettings = async (settings: any) => {
    await onUpdateSettings(business.id, settings);
    setShowAdvancedSettings(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div className="flex items-start space-x-4">
            {business.logoUrl ? (
              <img 
                src={business.logoUrl} 
                alt={`${business.name} logo`} 
                className="w-16 h-16 object-contain rounded-md"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{business.name}</h2>
              <p className="text-gray-600 dark:text-gray-400 capitalize">
                {business.type.toLowerCase() === 'shop' && 'Boutique'}
                {business.type.toLowerCase() === 'restaurant' && 'Restaurant'}
                {business.type.toLowerCase() === 'pharmacy' && 'Pharmacie'}
                {business.type.toLowerCase() === 'service' && 'Services'}
                {business.type.toLowerCase() === 'other' && 'Autre'}
              </p>
              <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
                {business.city && <span>{business.city}</span>}
                {business.city && business.country && <span className="mx-1">•</span>}
                {business.country && <span>{business.country}</span>}
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="secondary" onClick={() => setShowReports(true)}>
              <BarChart className="h-4 w-4 mr-2" />
              Rapports
            </Button>
            <Button variant="secondary" onClick={() => setShowAdvancedSettings(true)}>
              Paramètres avancés
            </Button>
            <Button variant="secondary" onClick={onEdit}>
              Modifier
            </Button>
            <Button 
              variant="danger" 
              onClick={onDelete}
              disabled={businessesCount <= 1}
            >
              Supprimer
            </Button>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Ventes</h3>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {business.sales?.length || 0}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Total: {formatCurrency(totalSales)}
            </p>
          </div>
          
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Dépenses</h3>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {business.expenses?.length || 0}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Total: {formatCurrency(totalExpenses)}
            </p>
          </div>
          
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Produits</h3>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {totalProducts}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              En stock: {business.products?.filter(p => p.stock > 0).length || 0}
            </p>
          </div>
          
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Bénéfice Net</h3>
            <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatCurrency(netProfit)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {netProfit >= 0 ? 'Bénéfice' : 'Perte'}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Clients</h3>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{totalClients}</p>
          </div>
          
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Fournisseurs</h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalSuppliers}</p>
          </div>
          
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Devise</h3>
            <p className="text-3xl font-bold text-gray-600 dark:text-gray-300">{business.currency || 'XOF'}</p>
          </div>
        </div>
        
        {/* Section des employés assignés */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Employés Assignés</h3>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
              {assignedEmployees.length} employé{assignedEmployees.length > 1 ? 's' : ''}
            </span>
          </div>
          <AssignedEmployees 
            employees={assignedEmployees} 
            onRemove={onRemoveEmployee} 
          />
        </div>
        
        {/* Historique des activités */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Historique des Activités</h3>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              {auditLogs.length} événement{auditLogs.length > 1 ? 's' : ''}
            </span>
          </div>
          <ActivityHistory activities={auditLogs} />
        </div>
      </div>
      
      {/* Paramètres avancés */}
      {showAdvancedSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-auto">
            <AdvancedSettings 
              business={business}
              onSave={handleSaveSettings}
              onCancel={() => setShowAdvancedSettings(false)}
            />
          </div>
        </div>
      )}
      
      {/* Rapports détaillés */}
      {showReports && (
        <DetailedReports 
          business={business}
          onClose={() => setShowReports(false)}
        />
      )}
    </div>
  );
};