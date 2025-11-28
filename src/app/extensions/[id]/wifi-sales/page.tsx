'use client';

import React, { useState } from 'react';
import { Wifi, Plus, TrendingUp, DollarSign, Calendar, Activity } from 'lucide-react';
import { useWifiSales } from '@/extensions/wifi-sales/hooks';
import { PerformanceChart, SaleForm, SalesHistory, WeeklyStatsCard } from '@/extensions/wifi-sales/components';
import { Button } from '@/components/shared/Button';
import { MainLayout } from '@/components/layout/MainLayout';
import { useBusinesses } from '@/hooks/useBusiness';

const WifiSalesExtension = () => {
  const {
    sales,
    loading,
    addSale,
    deleteSale,
    getCurrentWeekStats,
    getWeeklyStats
  } = useWifiSales();
  
  const { data: businesses = [], isLoading: businessesLoading } = useBusinesses();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentWeekStats = getCurrentWeekStats();
  const weeklyStats = getWeeklyStats(4); // Obtenir les stats pour les 4 dernières semaines

  if (loading || businessesLoading) {
    return (
      <MainLayout businesses={businesses}>
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout businesses={businesses}>
      <div className="p-6">
        {/* En-tête avec titre et bouton d'action */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg mr-4">
                <Wifi className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ventes Wi-Fi</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Suivez et analysez les ventes de vos tickets Wi-Fi
                </p>
              </div>
            </div>
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white flex items-center px-5 py-2.5 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="w-5 h-5 mr-2" />
              Ajouter une vente
            </Button>
          </div>
        </div>

        {/* Formulaire dans un modal */}
        <SaleForm 
          onAddSale={addSale} 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />

        {/* Statistiques de la semaine en cours */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Calendar className="h-5 w-5 text-orange-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Statistiques de la semaine</h2>
          </div>
          <WeeklyStatsCard stats={currentWeekStats} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Historique des ventes */}
          <div>
            <div className="flex items-center mb-4">
              <Activity className="h-5 w-5 text-blue-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Historique des ventes</h2>
            </div>
            <SalesHistory sales={sales} onDeleteSale={deleteSale} />
          </div>

          {/* Graphique de performance */}
          <div>
            <div className="flex items-center mb-4">
              <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Performance</h2>
            </div>
            <PerformanceChart stats={weeklyStats} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default WifiSalesExtension;