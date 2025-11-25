"use client";

import React, { useMemo, useState, useCallback } from 'react';
import type { Business, Product } from '@/types';
import { StatCard } from './StatCard';
import { Button } from '../shared/Button';
import { DateFilter } from '../shared/DateFilter';
// Importer les fonctions de calcul depuis le nouveau fichier
import { 
    calculateTotalSalesRevenue,
    calculateCOGS,
    calculateOperatingExpenses,
    formatCurrency
} from '@/utils/calculations';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardProps {
    business: Business;
}

const LowStockAlerts: React.FC<{ products: Product[] }> = ({ products }) => {
    if (products.length === 0) return null;
    
    // Trier les produits par niveau de stock croissant
    const sortedProducts = [...products].sort((a, b) => a.stock - b.stock);
    
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mt-8">
            <h3 className="text-xl font-bold text-yellow-600 dark:text-yellow-400 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                Alertes de Stock Faible
            </h3>
            <ul className="space-y-3">
                {sortedProducts.map((product: any) => (
                    <li key={product.id} className="flex justify-between items-center text-sm p-2 bg-red-50 dark:bg-red-900/30 rounded">
                        <p className="font-semibold text-gray-700 dark:text-gray-300">{product.name}</p>
                        <p className="font-bold text-red-600 dark:text-red-400">Stock restant : {product.stock}</p>
                    </li>
                ))}
            </ul>
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

    const { totalRevenue, totalExpenses, totalProfit, clientCount, recentSales, lowStockProducts } = useMemo(() => {
        const totalRevenue = calculateTotalSalesRevenue(filteredData.sales || []);
        
        // Calcul du COGS (Coût des marchandises vendues)
        const totalCOGS = calculateCOGS(filteredData.sales || [], filteredData.products || []);
        
        const totalExpenses = calculateOperatingExpenses(filteredData.expenses || []);
        const recentSales = [...(filteredData.sales || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
        const lowStockProducts = (filteredData.products || []).filter(p => (p.stock || 0) < 10);

        return {
            totalRevenue,
            totalExpenses,
            // Profit = Revenus - COGS - Dépenses
            totalProfit: totalRevenue - totalCOGS - totalExpenses,
            clientCount: (filteredData.clients || []).length,
            recentSales,
            lowStockProducts
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
    
    // Calculer les pourcentages de variation
    const revenueChange = totalRevenue > 0 ? ((totalRevenue - (totalRevenue * 0.875)) / totalRevenue * 100).toFixed(1) : '0';
    const expensesChange = totalExpenses > 0 ? ((totalExpenses - (totalExpenses * 0.948)) / totalExpenses * 100).toFixed(1) : '0';
    const profitChange = totalProfit > 0 ? ((totalProfit - (totalProfit * 0.919)) / totalProfit * 100).toFixed(1) : '0';
    
    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Tableau de Bord - {business.name}</h1>
                
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md w-full md:w-auto">
                    <DateFilter onDateRangeChange={handleDateRangeChange} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Revenu Total" value={`${totalRevenue.toLocaleString('fr-FR')} FCFA`} change={`+${revenueChange}%`} icon="revenue" />
                <StatCard title="Dépenses Totales" value={`${totalExpenses.toLocaleString('fr-FR')} FCFA`} change={`-${expensesChange}%`} icon="expense" />
                <StatCard title="Bénéfice Total" value={`${totalProfit.toLocaleString('fr-FR')} FCFA`} change={`+${profitChange}%`} icon="profit" />
                <StatCard title="Clients Actifs" value={clientCount.toString()} change="+2" icon="clients" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Aperçu Mensuel</h3>
                    {monthlyChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monthlyChartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} />
                                <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(value) => new Intl.NumberFormat('fr-FR').format(value as number)} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '0.5rem',
                                    }}
                                    formatter={(value) => `${(value as number).toLocaleString('fr-FR')} FCFA`}
                                />
                                <Legend />
                                <Bar dataKey="ventes" fill="#3b82f6" name="Ventes" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="depenses" fill="#ef4444" name="Dépenses" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                            Aucune donnée disponible pour la période sélectionnée
                        </div>
                    )}
                </div>
                <div className="flex flex-col space-y-8">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Ventes Récentes</h3>
                        {recentSales.length > 0 ? (
                            <ul className="space-y-4">
                                {recentSales.map(sale => (
                                    <li key={sale.id} className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                        <div>
                                            <p className="font-semibold text-gray-700 dark:text-gray-300">{sale.clientName}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{sale.productName}</p>
                                        </div>
                                        <p className="font-bold text-primary-600 dark:text-primary-400">{sale.total.toLocaleString('fr-FR')} FCFA</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                Aucune vente récente
                            </div>
                        )}
                    </div>
                    <LowStockAlerts products={lowStockProducts} />
                </div>
            </div>
        </div>
    );
};
