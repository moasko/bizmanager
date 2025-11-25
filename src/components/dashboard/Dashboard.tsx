"use client";

import React, { useMemo, useState, useCallback } from 'react';
import type { Business, Product, Sale, Client } from '@/types';
import { StatCard } from './StatCard';
import { Button } from '../shared/Button';
import { DateFilter } from '../shared/DateFilter';
// Importer les fonctions de calcul depuis le nouveau fichier
import { 
    calculateTotalSalesRevenue,
    calculateCOGS,
    calculateOperatingExpenses,
    calculateNetProfit,
    calculateInventoryValue,
    calculateGrossProfitMargin,
    formatCurrency,
    formatPercentage
} from '@/utils/calculations';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, ShoppingCart, DollarSign, Users, Package } from 'lucide-react';

interface DashboardProps {
    business: Business;
}

const LowStockAlerts: React.FC<{ products: Product[] }> = ({ products }) => {
    if (products.length === 0) return null;
    
    // Trier les produits par niveau de stock croissant
    const sortedProducts = [...products].sort((a, b) => a.stock - b.stock);
    
    return (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-orange-600 dark:text-orange-400 flex items-center">
                    <AlertTriangle className="mr-2" size={20} />
                    Alertes de Stock
                </h3>
                <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    {products.length}
                </span>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto">
                {sortedProducts.slice(0, 5).map((product: any) => (
                    <div key={product.id} className="flex justify-between items-center text-sm p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/30">
                        <div>
                            <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">{product.name}</p>
                            <p className="text-gray-600 dark:text-gray-400 text-xs">{product.category}</p>
                        </div>
                        <p className="font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded">
                            {product.stock}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const RecentSales: React.FC<{ sales: Sale[], clients: Client[] }> = ({ sales, clients }) => {
    // Prendre les 5 dernières ventes
    const recentSales = useMemo(() => {
        return [...sales]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5)
            .map(sale => {
                const client = clients.find(c => c.id === sale.clientId);
                return {
                    ...sale,
                    clientName: client?.name || sale.clientName || 'Client anonyme'
                };
            });
    }, [sales, clients]);
    
    if (recentSales.length === 0) return null;
    
    return (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                <ShoppingCart className="mr-2 text-orange-500" size={20} />
                Ventes Récentes
            </h3>
            <div className="space-y-3">
                {recentSales.map((sale, index) => (
                    <div key={sale.id} className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-sm">
                                {index + 1}
                            </div>
                            <div className="ml-3">
                                <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">{sale.clientName}</p>
                                <p className="text-gray-600 dark:text-gray-400 text-xs">{sale.productName}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{sale.quantity} articles</p>
                            <p className="text-orange-600 dark:text-orange-400 text-xs font-medium">
                                {sale.total.toLocaleString('fr-FR')} FCFA
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const processMonthlyData = (sales: any[], expenses: any[]) => {
    const data: { [key: string]: { name: string; ventes: number; depenses: number } } = {};
    const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

    const processItems = (items: any[], type: 'ventes' | 'depenses') => {
        items.forEach(item => {
            const date = new Date(item.date);
            const month = date.getMonth();
            const year = date.getFullYear();
            const key = `${year}-${month}`;
            const amount = type === 'ventes' ? item.total : item.amount;
            
            if (!data[key]) {
                data[key] = { name: `${monthNames[month]} '${String(year).slice(2)}`, ventes: 0, depenses: 0 };
            }
            data[key][type] += amount;
        });
    };

    processItems(sales, 'ventes');
    processItems(expenses, 'depenses');

    // Trier par date chronologique
    return Object.values(data).sort((a, b) => {
        // Extraire l'année et le mois du nom du mois
        const [aMonthName, aYear] = a.name.split(" '");
        const [bMonthName, bYear] = b.name.split(" '");
        
        // Convertir le nom du mois en index
        const monthIndex = (monthName: string) => monthNames.indexOf(monthName);
        
        // Créer des dates pour comparaison
        const dateA = new Date(parseInt(`20${aYear}`), monthIndex(aMonthName));
        const dateB = new Date(parseInt(`20${bYear}`), monthIndex(bMonthName));
        
        return dateA.getTime() - dateB.getTime();
    });
};

export const Dashboard: React.FC<DashboardProps> = ({ business }) => {
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const filteredData = useMemo(() => {
        // Ensure we have a stable reference to business data
        if (!business) return { sales: [], expenses: [], products: [], clients: [] };
        
        const { start, end } = dateRange;
        const startDate = start ? new Date(start) : null;
        const endDate = end ? new Date(end) : null;

        if (!startDate || !endDate) {
            return { 
                sales: business.sales || [], 
                expenses: business.expenses || [], 
                products: business.products || [], 
                clients: business.clients || [] 
            };
        }

        // Add 1 day to end date to make it inclusive
        endDate.setDate(endDate.getDate() + 1);

        const sales = (business.sales || []).filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate >= startDate && saleDate <= endDate;
        });

        const expenses = (business.expenses || []).filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate >= startDate && expenseDate <= endDate;
        });

        // For products and clients, we don't filter by date, but we pass them through
        return { 
            sales, 
            expenses, 
            products: business.products || [], 
            clients: business.clients || [] 
        };
    }, [business?.id, business?.sales?.length, business?.expenses?.length, business?.products?.length, business?.clients?.length, dateRange]);

    const {
        totalRevenue,
        totalExpenses,
        totalProfit,
        clientCount,
        recentSales,
        lowStockProducts,
        inventoryValue,
        profitMargin
    } = useMemo(() => {
        const totalRevenue = calculateTotalSalesRevenue(filteredData.sales || []);
        const totalCOGS = calculateCOGS(filteredData.sales || [], filteredData.products || []);
        const totalExpenses = calculateOperatingExpenses(filteredData.expenses || []);
        const totalProfit = calculateNetProfit(
            filteredData.sales || [],
            filteredData.expenses || [],
            filteredData.products || []
        );
        const recentSales = [...(filteredData.sales || [])]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5);
        const lowStockProducts = (filteredData.products || []).filter(p => (p.stock || 0) < 10);
        const inventoryValue = calculateInventoryValue(filteredData.products || []);
        const profitMargin = calculateGrossProfitMargin(
            filteredData.sales || [],
            filteredData.products || []
        );

        return {
            totalRevenue,
            totalExpenses,
            totalProfit,
            clientCount: (filteredData.clients || []).length,
            recentSales,
            lowStockProducts,
            inventoryValue,
            profitMargin
        };
    }, [filteredData]);

    const monthlyChartData = useMemo(() => processMonthlyData(filteredData.sales || [], filteredData.expenses || []), [filteredData.sales?.length, filteredData.expenses?.length]);
    
    const handleDateRangeChange = useCallback((start: string, end: string) => {
        setDateRange({ start, end });
    }, []);
    
    // Add safety checks for rendering
    if (!business) {
        return <div className="flex justify-center items-center h-64">Aucune entreprise sélectionnée.</div>;
    }
    
    // Calculer les pourcentages de variation (simulés pour cette version)
    const revenueChange = "+12.5";
    const expensesChange = "-5.2";
    const profitChange = "+18.3";
    const marginChange = "+2.1";
    
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Tableau de Bord</h1>
                    <p className="text-gray-600 dark:text-gray-400">Bienvenue, {business.name}</p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md w-full md:w-auto">
                    <DateFilter onDateRangeChange={handleDateRangeChange} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard 
                    title="Revenu Total" 
                    value={`${totalRevenue.toLocaleString('fr-FR')} FCFA`} 
                    change={`+${revenueChange}%`} 
                    icon="revenue" 
                />
                <StatCard 
                    title="Dépenses Totales" 
                    value={`${totalExpenses.toLocaleString('fr-FR')} FCFA`} 
                    change={`-${expensesChange}%`} 
                    icon="expense" 
                />
                <StatCard 
                    title="Bénéfice Net" 
                    value={`${totalProfit.toLocaleString('fr-FR')} FCFA`} 
                    change={`+${profitChange}%`} 
                    icon="profit" 
                />
                <StatCard 
                    title="Marge Bénéficiaire" 
                    value={formatPercentage(profitMargin)} 
                    change={`+${marginChange}%`} 
                    icon="clients" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center">
                            <DollarSign className="mr-2 text-orange-500" size={20} />
                            Performance Financière
                        </h3>
                    </div>
                    {monthlyChartData.length > 0 ? (
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyChartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                    <XAxis 
                                        dataKey="name" 
                                        tick={{ fill: '#6B7280', fontSize: 12 }} 
                                        axisLine={false}
                                    />
                                    <YAxis 
                                        tick={{ fill: '#6B7280', fontSize: 12 }} 
                                        tickFormatter={(value) => new Intl.NumberFormat('fr-FR').format(value as number)} 
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#ffffff',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '0.5rem',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                        }}
                                        formatter={(value) => [`${(value as number).toLocaleString('fr-FR')} FCFA`, 'Montant']}
                                        labelStyle={{ fontWeight: 'bold', color: '#374151' }}
                                    />
                                    <Legend />
                                    <Bar 
                                        dataKey="ventes" 
                                        fill="#3b82f6" 
                                        name="Ventes" 
                                        radius={[4, 4, 0, 0]} 
                                        barSize={20}
                                    />
                                    <Bar 
                                        dataKey="depenses" 
                                        fill="#ef4444" 
                                        name="Dépenses" 
                                        radius={[4, 4, 0, 0]} 
                                        barSize={20}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                            <div className="text-center">
                                <DollarSign className="mx-auto text-gray-400 mb-2" size={32} />
                                <p>Aucune donnée disponible pour la période sélectionnée</p>
                            </div>
                        </div>
                    )}
                </div>
                
                <RecentSales sales={filteredData.sales || []} clients={filteredData.clients || []} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                        <ShoppingCart className="mr-2 text-orange-500" size={20} />
                        Ventes Récentes
                    </h3>
                    {recentSales.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Client</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Produit</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantité</th>
                                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Montant</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {recentSales.map(sale => (
                                        <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                {sale.clientName || 'Client anonyme'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {sale.productName}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {sale.quantity}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-orange-600 dark:text-orange-400">
                                                {sale.total.toLocaleString('fr-FR')} FCFA
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <ShoppingCart className="mx-auto text-gray-400 mb-2" size={32} />
                            <p>Aucune vente récente</p>
                        </div>
                    )}
                </div>
                
                <LowStockAlerts products={lowStockProducts} />
            </div>
        </div>
    );
};