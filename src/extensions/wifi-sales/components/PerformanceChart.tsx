import React from 'react';
import { WeeklyStats } from '../types/wifiSales';
import { TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface PerformanceChartProps {
  stats: WeeklyStats[];
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ stats }) => {
  // Filtrer les semaines qui ont des données (au moins une vente)
  const weeksWithSales = stats.filter(week => week.salesCount > 0);
  
  if (weeksWithSales.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <div className="flex items-center mb-4">
          <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Performance hebdomadaire</h2>
        </div>
        <div className="text-center py-8">
          <div className="inline-block p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
            <TrendingUp className="h-12 w-12 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Pas de données disponibles pour le graphique.
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
            Commencez par ajouter des ventes pour voir les statistiques.
          </p>
        </div>
      </div>
    );
  }

  // Calculer les tendances par rapport à la semaine précédente
  const getTrend = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Ajouter les tendances aux stats
  const statsWithTrends = weeksWithSales.map((week, index) => {
    if (index === weeksWithSales.length - 1) {
      // Dernière semaine, pas de comparaison possible
      return { ...week, revenueTrend: 0, ticketsTrend: 0, salesTrend: 0 };
    }
    
    const previousWeek = weeksWithSales[index + 1];
    return {
      ...week,
      revenueTrend: getTrend(week.totalRevenue, previousWeek.totalRevenue),
      ticketsTrend: getTrend(week.totalTicketsSold, previousWeek.totalTicketsSold),
      salesTrend: getTrend(week.salesCount, previousWeek.salesCount),
    };
  });

  // Trouver les valeurs maximales pour l'échelle
  const maxRevenue = Math.max(...statsWithTrends.map(s => s.totalRevenue), 0);
  const maxTickets = Math.max(...statsWithTrends.map(s => s.totalTicketsSold), 0);
  const maxSales = Math.max(...statsWithTrends.map(s => s.salesCount), 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Performance hebdomadaire</h2>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {statsWithTrends.length} semaines
        </div>
      </div>
      
      <div className="space-y-6">
        {statsWithTrends.map((week, index) => (
          <div key={`${week.year}-${week.weekNumber}`} className="border-b border-gray-100 dark:border-gray-700 pb-6 last:border-0 last:pb-0">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Semaine {week.weekNumber}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {week.year}
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {week.totalRevenue.toLocaleString('fr-FR')} <span className="text-sm font-normal">FCFA</span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Revenu total
                </div>
              </div>
            </div>
            
            {/* Barres de performance */}
            <div className="space-y-4">
              {/* Revenu */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Revenu</span>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {week.totalRevenue.toLocaleString('fr-FR')} FCFA
                    </span>
                    {index < statsWithTrends.length - 1 && (
                      <span className={`ml-2 flex items-center text-xs ${week.revenueTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {week.revenueTrend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {Math.abs(week.revenueTrend).toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-green-600 h-2.5 rounded-full transition-all duration-700 ease-in-out"
                    style={{ width: maxRevenue ? `${(week.totalRevenue / maxRevenue) * 100}%` : '0%' }}
                  ></div>
                </div>
              </div>
              
              {/* Tickets vendus */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Tickets vendus</span>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {week.totalTicketsSold}
                    </span>
                    {index < statsWithTrends.length - 1 && (
                      <span className={`ml-2 flex items-center text-xs ${week.ticketsTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {week.ticketsTrend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {Math.abs(week.ticketsTrend).toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-blue-600 h-2.5 rounded-full transition-all duration-700 ease-in-out"
                    style={{ width: maxTickets ? `${(week.totalTicketsSold / maxTickets) * 100}%` : '0%' }}
                  ></div>
                </div>
              </div>
              
              {/* Nombre de ventes */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Nombre de ventes</span>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {week.salesCount}
                    </span>
                    {index < statsWithTrends.length - 1 && (
                      <span className={`ml-2 flex items-center text-xs ${week.salesTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {week.salesTrend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {Math.abs(week.salesTrend).toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-gradient-to-r from-purple-400 to-purple-600 h-2.5 rounded-full transition-all duration-700 ease-in-out"
                    style={{ width: maxSales ? `${(week.salesCount / maxSales) * 100}%` : '0%' }}
                  ></div>
                </div>
              </div>
            </div>
            
            {/* Statistiques détaillées */}
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {Math.round(week.averageTicketPrice).toLocaleString('fr-FR')}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Prix moyen (FCFA)
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {Math.round(week.totalTicketsSold / week.salesCount) || 0}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Tickets/vente
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {Math.round((week.totalRevenue / week.salesCount) || 0).toLocaleString('fr-FR')}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Revenu/vente (FCFA)
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Légende */}
      <div className="flex justify-center space-x-6 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Revenu</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Tickets vendus</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
          <span className="text-xs text-gray-600 dark:text-gray-400">Nombre de ventes</span>
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;