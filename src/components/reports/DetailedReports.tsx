import React, { useState, useEffect } from 'react';
import type { Business, Sale, Expense, Product } from '@/types';
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { formatCurrency } from '@/utils/formatters';
import { Button } from '../shared/Button';

// Enregistrer les composants de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface DetailedReportsProps {
  business: Business;
  onClose: () => void;
}

export const DetailedReports: React.FC<DetailedReportsProps> = ({ business, onClose }) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedReport, setSelectedReport] = useState<'sales' | 'expenses' | 'profit' | 'products'>('sales');

  // Filtrer les données selon la période sélectionnée
  const filterDataByTimeRange = (data: any[], dateField: string) => {
    const now = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return data.filter(item => new Date(item[dateField]) >= startDate);
  };

  // Préparer les données de ventes
  const prepareSalesData = () => {
    const filteredSales = filterDataByTimeRange(business.sales || [], 'date');
    
    // Regrouper par date
    const salesByDate: Record<string, { count: number; total: number }> = {};
    
    filteredSales.forEach(sale => {
      const date = new Date(sale.date).toLocaleDateString('fr-FR');
      if (!salesByDate[date]) {
        salesByDate[date] = { count: 0, total: 0 };
      }
      salesByDate[date].count += 1;
      salesByDate[date].total += sale.total;
    });
    
    const labels = Object.keys(salesByDate);
    const counts = labels.map(date => salesByDate[date].count);
    const totals = labels.map(date => salesByDate[date].total);
    
    return {
      labels,
      datasets: [
        {
          label: 'Nombre de ventes',
          data: counts,
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          yAxisID: 'y',
        },
        {
          label: 'Total des ventes (FCFA)',
          data: totals,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          yAxisID: 'y1',
        }
      ]
    };
  };

  // Préparer les données de dépenses
  const prepareExpensesData = () => {
    const filteredExpenses = filterDataByTimeRange(business.expenses || [], 'date');
    
    // Regrouper par catégorie
    const expensesByCategory: Record<string, number> = {};
    
    filteredExpenses.forEach(expense => {
      if (!expensesByCategory[expense.category]) {
        expensesByCategory[expense.category] = 0;
      }
      expensesByCategory[expense.category] += expense.amount;
    });
    
    const labels = Object.keys(expensesByCategory);
    const data = labels.map(category => expensesByCategory[category]);
    
    return {
      labels,
      datasets: [
        {
          label: 'Dépenses par catégorie (FCFA)',
          data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
          ],
          borderWidth: 1,
        }
      ]
    };
  };

  // Préparer les données de profit
  const prepareProfitData = () => {
    const filteredSales = filterDataByTimeRange(business.sales || [], 'date');
    const filteredExpenses = filterDataByTimeRange(business.expenses || [], 'date');
    
    // Regrouper par mois
    const profitByMonth: Record<string, { sales: number; expenses: number; profit: number }> = {};
    
    // Ajouter les ventes
    filteredSales.forEach(sale => {
      const month = new Date(sale.date).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
      if (!profitByMonth[month]) {
        profitByMonth[month] = { sales: 0, expenses: 0, profit: 0 };
      }
      profitByMonth[month].sales += sale.total;
    });
    
    // Ajouter les dépenses
    filteredExpenses.forEach(expense => {
      const month = new Date(expense.date).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
      if (!profitByMonth[month]) {
        profitByMonth[month] = { sales: 0, expenses: 0, profit: 0 };
      }
      profitByMonth[month].expenses += expense.amount;
    });
    
    // Calculer le profit
    Object.keys(profitByMonth).forEach(month => {
      profitByMonth[month].profit = profitByMonth[month].sales - profitByMonth[month].expenses;
    });
    
    const labels = Object.keys(profitByMonth);
    const salesData = labels.map(month => profitByMonth[month].sales);
    const expensesData = labels.map(month => profitByMonth[month].expenses);
    const profitData = labels.map(month => profitByMonth[month].profit);
    
    return {
      labels,
      datasets: [
        {
          label: 'Ventes (FCFA)',
          data: salesData,
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
        },
        {
          label: 'Dépenses (FCFA)',
          data: expensesData,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
        {
          label: 'Profit (FCFA)',
          data: profitData,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        }
      ]
    };
  };

  // Préparer les données de produits
  const prepareProductsData = () => {
    const products = business.products || [];
    
    // Trier par stock
    const sortedProducts = [...products].sort((a, b) => b.stock - a.stock);
    const topProducts = sortedProducts.slice(0, 10);
    
    const labels = topProducts.map(product => product.name);
    const stockData = topProducts.map(product => product.stock);
    const minStockData = topProducts.map(product => product.minStock);
    
    return {
      labels,
      datasets: [
        {
          label: 'Stock actuel',
          data: stockData,
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
        {
          label: 'Seuil minimum',
          data: minStockData,
          backgroundColor: 'rgba(255, 99, 132, 0.8)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        }
      ]
    };
  };

  // Options pour les graphiques
  const salesChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Évolution des ventes',
      },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const expensesChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Répartition des dépenses par catégorie',
      },
    },
  };

  const profitChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Évolution du profit',
      },
    },
  };

  const productsChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Top 10 des produits par stock',
      },
    },
  };

  // Calculer les statistiques globales
  const totalSales = business.sales?.reduce((sum, sale) => sum + sale.total, 0) || 0;
  const totalExpenses = business.expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
  const netProfit = totalSales - totalExpenses;
  const totalProducts = business.products?.length || 0;
  const lowStockProducts = business.products?.filter(p => p.stock <= p.minStock).length || 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col rounded-xl shadow-xl">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Rapports détaillés - {business.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Analyse complète des performances de votre entreprise
            </p>
          </div>
          <Button variant="secondary" onClick={onClose}>
            Fermer
          </Button>
        </div>

        {/* Statistiques globales */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Ventes totales</h3>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(totalSales)}
              </p>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Dépenses totales</h3>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Profit net</h3>
              <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatCurrency(netProfit)}
              </p>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Produits</h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {totalProducts} ({lowStockProducts} en rupture)
              </p>
            </div>
          </div>
        </div>

        {/* Contrôles */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Période
            </label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="week">7 derniers jours</option>
              <option value="month">30 derniers jours</option>
              <option value="quarter">3 derniers mois</option>
              <option value="year">12 derniers mois</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type de rapport
            </label>
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="sales">Ventes</option>
              <option value="expenses">Dépenses</option>
              <option value="profit">Profit</option>
              <option value="products">Produits</option>
            </select>
          </div>
        </div>

        {/* Graphiques */}
        <div className="flex-1 overflow-auto p-6">
          {selectedReport === 'sales' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              <Line options={salesChartOptions} data={prepareSalesData()} />
            </div>
          )}
          
          {selectedReport === 'expenses' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              <Pie options={expensesChartOptions} data={prepareExpensesData()} />
            </div>
          )}
          
          {selectedReport === 'profit' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              <Bar options={profitChartOptions} data={prepareProfitData()} />
            </div>
          )}
          
          {selectedReport === 'products' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              <Bar options={productsChartOptions} data={prepareProductsData()} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};