import React from 'react';
import { WeeklyStats } from '../types/wifiSales';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shared/Card';
import { Ticket, Wallet, Tag, ShoppingBag } from 'lucide-react';

interface WeeklyStatsProps {
  stats: WeeklyStats | null;
}

const WeeklyStatsCard: React.FC<WeeklyStatsProps> = ({ stats }) => {
  if (!stats) {
    return (
      <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg mr-3">
              <Ticket className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            Statistiques de la semaine
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Pas de données disponibles pour cette semaine
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="inline-block p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
              <Ticket className="h-12 w-12 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              Commencez par ajouter des ventes pour voir les statistiques
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg mr-3">
            <Ticket className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          Statistiques de la semaine
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          Semaine {stats.weekNumber}, {stats.year}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-5 border border-blue-200 dark:border-blue-700/50 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg mr-3">
                <ShoppingBag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tickets vendus</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalTicketsSold}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl p-5 border border-green-200 dark:border-green-700/50 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg mr-3">
                <Wallet className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Revenu total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalRevenue.toLocaleString('fr-FR')} FCFA</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-xl p-5 border border-orange-200 dark:border-orange-700/50 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg mr-3">
                <Tag className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Prix moyen</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(stats.averageTicketPrice).toLocaleString('fr-FR')} FCFA</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl p-5 border border-purple-200 dark:border-purple-700/50 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg mr-3">
                <Ticket className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Nombre de ventes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.salesCount}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyStatsCard;