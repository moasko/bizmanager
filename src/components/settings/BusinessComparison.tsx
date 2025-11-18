import React, { useState } from 'react';
import type { Business } from '@/types';
import { Button } from '../shared/Button';
import { formatCurrency } from '@/utils/formatters';

interface BusinessComparisonProps {
  businesses: Business[];
  onClose: () => void;
}

export const BusinessComparison: React.FC<BusinessComparisonProps> = ({ businesses, onClose }) => {
  const [selectedBusinesses, setSelectedBusinesses] = useState<string[]>([]);

  // Calculer les statistiques pour chaque entreprise
  const getBusinessStats = (business: Business) => {
    const totalSales = business.sales?.reduce((sum, sale) => sum + sale.total, 0) || 0;
    const totalExpenses = business.expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
    const totalProducts = business.products?.length || 0;
    const totalClients = business.clients?.length || 0;
    const totalSuppliers = business.suppliers?.length || 0;
    const netProfit = totalSales - totalExpenses;
    
    return {
      totalSales,
      totalExpenses,
      totalProducts,
      totalClients,
      totalSuppliers,
      netProfit
    };
  };

  // Gérer la sélection/déselection d'une entreprise
  const toggleBusinessSelection = (businessId: string) => {
    if (selectedBusinesses.includes(businessId)) {
      setSelectedBusinesses(selectedBusinesses.filter(id => id !== businessId));
    } else {
      if (selectedBusinesses.length < 3) {
        setSelectedBusinesses([...selectedBusinesses, businessId]);
      }
    }
  };

  // Obtenir les entreprises sélectionnées
  const selectedBusinessObjects = businesses.filter(b => selectedBusinesses.includes(b.id));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Comparaison des Entreprises</h2>
            <Button variant="secondary" onClick={onClose}>Fermer</Button>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Sélectionnez jusqu'à 3 entreprises pour les comparer
          </p>
        </div>
        
        <div className="flex-1 overflow-auto">
          {/* Sélection des entreprises */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Sélection des entreprises</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {businesses.map(business => (
                <div 
                  key={business.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedBusinesses.includes(business.id)
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => toggleBusinessSelection(business.id)}
                >
                  <div className="flex items-center">
                    {business.logoUrl ? (
                      <img 
                        src={business.logoUrl} 
                        alt={`${business.name} logo`} 
                        className="w-10 h-10 object-contain rounded-md mr-3"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center mr-3">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                        </svg>
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium text-gray-800 dark:text-white">{business.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {business.type.toLowerCase() === 'shop' && 'Boutique'}
                        {business.type.toLowerCase() === 'restaurant' && 'Restaurant'}
                        {business.type.toLowerCase() === 'pharmacy' && 'Pharmacie'}
                        {business.type.toLowerCase() === 'service' && 'Services'}
                        {business.type.toLowerCase() === 'other' && 'Autre'}
                      </p>
                    </div>
                  </div>
                  {selectedBusinesses.includes(business.id) && (
                    <div className="mt-2 text-xs text-primary-600 dark:text-primary-400 font-medium">
                      Sélectionné
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Tableau de comparaison */}
          {selectedBusinessObjects.length > 0 && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Comparaison détaillée</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Métrique
                      </th>
                      {selectedBusinessObjects.map(business => (
                        <th key={business.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          <div className="flex items-center">
                            {business.logoUrl ? (
                              <img 
                                src={business.logoUrl} 
                                alt={`${business.name} logo`} 
                                className="w-6 h-6 object-contain rounded-md mr-2"
                              />
                            ) : (
                              <div className="w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded-md flex items-center justify-center mr-2">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                </svg>
                              </div>
                            )}
                            <span className="truncate max-w-[100px]">{business.name}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        Ventes
                      </td>
                      {selectedBusinessObjects.map(business => {
                        const stats = getBusinessStats(business);
                        return (
                          <td key={business.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex flex-col">
                              <span className="font-medium">{business.sales?.length || 0}</span>
                              <span className="text-xs">{formatCurrency(stats.totalSales)}</span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        Dépenses
                      </td>
                      {selectedBusinessObjects.map(business => {
                        const stats = getBusinessStats(business);
                        return (
                          <td key={business.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex flex-col">
                              <span className="font-medium">{business.expenses?.length || 0}</span>
                              <span className="text-xs">{formatCurrency(stats.totalExpenses)}</span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        Produits
                      </td>
                      {selectedBusinessObjects.map(business => {
                        const stats = getBusinessStats(business);
                        return (
                          <td key={business.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex flex-col">
                              <span className="font-medium">{stats.totalProducts}</span>
                              <span className="text-xs">
                                {business.products?.filter(p => p.stock > 0).length || 0} en stock
                              </span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        Clients
                      </td>
                      {selectedBusinessObjects.map(business => {
                        const stats = getBusinessStats(business);
                        return (
                          <td key={business.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-medium">{stats.totalClients}</span>
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        Fournisseurs
                      </td>
                      {selectedBusinessObjects.map(business => {
                        const stats = getBusinessStats(business);
                        return (
                          <td key={business.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-medium">{stats.totalSuppliers}</span>
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        Bénéfice Net
                      </td>
                      {selectedBusinessObjects.map(business => {
                        const stats = getBusinessStats(business);
                        return (
                          <td key={business.id} className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`font-medium ${stats.netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {formatCurrency(stats.netProfit)}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
              
              {/* Indicateurs clés */}
              <div className="mt-8">
                <h4 className="text-md font-medium text-gray-800 dark:text-white mb-4">Indicateurs clés</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Meilleure performance</h5>
                    {(() => {
                      const bestPerforming = selectedBusinessObjects.reduce((best, current) => {
                        const currentStats = getBusinessStats(current);
                        const bestStats = getBusinessStats(best);
                        return currentStats.netProfit > bestStats.netProfit ? current : best;
                      }, selectedBusinessObjects[0]);
                      
                      return (
                        <div className="flex items-center">
                          {bestPerforming.logoUrl ? (
                            <img 
                              src={bestPerforming.logoUrl} 
                              alt={`${bestPerforming.name} logo`} 
                              className="w-8 h-8 object-contain rounded-md mr-2"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-md flex items-center justify-center mr-2">
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                              </svg>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-800 dark:text-white">{bestPerforming.name}</p>
                            <p className="text-sm text-green-600 dark:text-green-400">
                              {formatCurrency(getBusinessStats(bestPerforming).netProfit)}
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Plus de ventes</h5>
                    {(() => {
                      const mostSales = selectedBusinessObjects.reduce((best, current) => {
                        return current.sales?.length > best.sales?.length ? current : best;
                      }, selectedBusinessObjects[0]);
                      
                      return (
                        <div className="flex items-center">
                          {mostSales.logoUrl ? (
                            <img 
                              src={mostSales.logoUrl} 
                              alt={`${mostSales.name} logo`} 
                              className="w-8 h-8 object-contain rounded-md mr-2"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-md flex items-center justify-center mr-2">
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                              </svg>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-800 dark:text-white">{mostSales.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {mostSales.sales?.length || 0} ventes
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Plus de produits</h5>
                    {(() => {
                      const mostProducts = selectedBusinessObjects.reduce((best, current) => {
                        const currentStats = getBusinessStats(current);
                        const bestStats = getBusinessStats(best);
                        return currentStats.totalProducts > bestStats.totalProducts ? current : best;
                      }, selectedBusinessObjects[0]);
                      
                      return (
                        <div className="flex items-center">
                          {mostProducts.logoUrl ? (
                            <img 
                              src={mostProducts.logoUrl} 
                              alt={`${mostProducts.name} logo`} 
                              className="w-8 h-8 object-contain rounded-md mr-2"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-md flex items-center justify-center mr-2">
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                              </svg>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-800 dark:text-white">{mostProducts.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {getBusinessStats(mostProducts).totalProducts} produits
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};