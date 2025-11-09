"use client";

import React, { useState, useMemo } from 'react';
import type { Business, User } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SimplifiedDashboardProps {
    allBusinesses: Business[];
    allUsers: User[];
}

// Helper function to calculate total sales revenue
const calculateTotalSalesRevenue = (sales: any[]): number => {
    return sales.reduce((sum, sale) => sum + sale.total, 0);
};

// Helper function to calculate cost of goods sold (COGS)
const calculateCOGS = (sales: any[], products: any[]): number => {
    return sales.reduce((sum, sale) => {
        // Find the product to get its wholesale price
        const product = products.find((p: any) => p.id === sale.productId);
        const wholesalePrice = product ? product.wholesalePrice : 0;
        return sum + (wholesalePrice * sale.quantity);
    }, 0);
};

// Helper function to calculate operational expenses
const calculateOperationalExpenses = (expenses: any[]): number => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
};

// Helper function to format currency
const formatCurrency = (amount: number): string => {
    return `${amount?.toLocaleString('fr-FR')} FCFA`;
};

export const SimplifiedDashboard: React.FC<SimplifiedDashboardProps> = ({ allBusinesses, allUsers }) => {
    const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'day' | 'week' | 'month' | 'quarter' | 'year'>('month');

    // Filter data based on selected period
    const filterByPeriod = (items: any[], dateField: string): any[] => {
        if (selectedPeriod === 'all') return items;

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const currentDate = now.getDate();
        
        // Calculate week start (Monday) and end (Sunday)
        const startOfWeek = new Date(now);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        startOfWeek.setDate(diff);
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        
        // Calculate quarter
        const currentQuarter = Math.floor(currentMonth / 3);

        return items.filter(item => {
            const itemDate = new Date(item[dateField]);
            const itemYear = itemDate.getFullYear();
            const itemMonth = itemDate.getMonth();
            const itemDay = itemDate.getDate();
            
            // Set start and end of item day for accurate comparison
            const startOfDay = new Date(itemYear, itemMonth, itemDay, 0, 0, 0, 0);
            const endOfDay = new Date(itemYear, itemMonth, itemDay, 23, 59, 59, 999);

            switch (selectedPeriod) {
                case 'day':
                    return startOfDay >= new Date(currentYear, currentMonth, currentDate, 0, 0, 0, 0) && 
                           endOfDay <= new Date(currentYear, currentMonth, currentDate, 23, 59, 59, 999);
                case 'week':
                    return startOfDay >= startOfWeek && endOfDay <= endOfWeek;
                case 'month':
                    return itemYear === currentYear && itemMonth === currentMonth;
                case 'quarter':
                    const itemQuarter = Math.floor(itemMonth / 3);
                    return itemYear === currentYear && itemQuarter === currentQuarter;
                case 'year':
                    return itemYear === currentYear;
                default:
                    return true;
            }
        });
    };

    // Calculate financial metrics
    const financialData = useMemo(() => {
        let totalRevenue = 0;
        let totalCOGS = 0;
        let totalExpenses = 0;
        let totalProducts = 0;
        
        allBusinesses.forEach((business: any) => {
            const filteredSales = filterByPeriod(business.sales, 'date');
            const filteredExpenses = filterByPeriod(business.expenses, 'date');
            
            totalRevenue += calculateTotalSalesRevenue(filteredSales);
            totalCOGS += calculateCOGS(filteredSales, business.products);
            totalExpenses += calculateOperationalExpenses(filteredExpenses);
            totalProducts += business.products.length;
        });
        
        const netProfit = totalRevenue - totalCOGS - totalExpenses;
        const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
        
        return {
            totalRevenue,
            totalCOGS,
            totalExpenses,
            netProfit,
            profitMargin,
            totalProducts
        };
    }, [allBusinesses, selectedPeriod]);

    // Get top performing businesses
    const topBusinesses = useMemo(() => {
        return [...allBusinesses]
            .map((business: any) => {
                const filteredSales = filterByPeriod(business.sales, 'date');
                const filteredExpenses = filterByPeriod(business.expenses, 'date');
                
                const totalRevenue = calculateTotalSalesRevenue(filteredSales);
                const totalCOGS = calculateCOGS(filteredSales, business.products);
                const totalOperationalExpenses = calculateOperationalExpenses(filteredExpenses);
                const netProfit = totalRevenue - totalCOGS - totalOperationalExpenses;

                return {
                    id: business.id,
                    name: business.name,
                    netProfit,
                    totalRevenue
                };
            })
            .sort((a, b) => b.netProfit - a.netProfit)
            .slice(0, 3);
    }, [allBusinesses, selectedPeriod]);

    // Prepare chart data
    const chartData = useMemo(() => {
        const data: { [key: string]: { name: string; revenus: number; depenses: number; benefice: number } } = {};
        const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

        allBusinesses.forEach((business: any) => {
            // Process sales
            const filteredSales = filterByPeriod(business.sales, 'date');
            filteredSales.forEach(sale => {
                const date = new Date(sale.date);
                const month = date.getMonth();
                const year = date.getFullYear();
                const key = `${year}-${month}`;
                const amount = sale.total;
                
                if (!data[key]) {
                    data[key] = { name: `${monthNames[month]} '${String(year).slice(2)}`, revenus: 0, depenses: 0, benefice: 0 };
                }
                data[key].revenus += amount;
            });

            // Process expenses
            const filteredExpenses = filterByPeriod(business.expenses, 'date');
            filteredExpenses.forEach(expense => {
                const date = new Date(expense.date);
                const month = date.getMonth();
                const year = date.getFullYear();
                const key = `${year}-${month}`;
                const amount = expense.amount;
                
                if (!data[key]) {
                    data[key] = { name: `${monthNames[month]} '${String(year).slice(2)}`, revenus: 0, depenses: 0, benefice: 0 };
                }
                data[key].depenses += amount;
            });
        });

        // Calculate profit for each month
        Object.values(data).forEach(monthData => {
            monthData.benefice = monthData.revenus - monthData.depenses;
        });

        return Object.values(data).sort((a, b) => {
            const [aMonth, aYear] = a.name.split(" '");
            const [bMonth, bYear] = b.name.split(" '");
            return new Date(`${aMonth} 1, 20${aYear}`).getTime() - new Date(`${bMonth} 1, 20${bYear}`).getTime();
        });
    }, [allBusinesses, selectedPeriod]);

    // Calculate user statistics
    const userStats = useMemo(() => {
        const totalUsers = allUsers.length;
        const adminUsers = allUsers.filter(user => user.role === 'Admin').length;
        const managerUsers = allUsers.filter(user => user.role === 'Gérant').length;
        
        return {
            totalUsers,
            adminUsers,
            managerUsers
        };
    }, [allUsers]);

    // Period options with labels
    const periodOptions = [
        { value: 'all', label: 'Tout' },
        { value: 'day', label: "Aujourd'hui" },
        { value: 'week', label: 'Cette semaine' },
        { value: 'month', label: 'Ce mois' },
        { value: 'quarter', label: 'Ce trimestre' },
        { value: 'year', label: 'Cette année' }
    ];

    return (
        <div className="space-y-6">
            {/* Header with period selector */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Tableau de Bord Simplifié</h1>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Période:</span>
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value as any)}
                        className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        {periodOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Revenus</h3>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                        {formatCurrency(financialData.totalRevenue)}
                    </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Dépenses</h3>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                        {formatCurrency(financialData.totalCOGS + financialData.totalExpenses)}
                    </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Bénéfice Net</h3>
                    <p className={`text-2xl font-bold mt-1 ${financialData.netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {formatCurrency(financialData.netProfit)}
                    </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Marge</h3>
                    <p className={`text-2xl font-bold mt-1 ${financialData.profitMargin >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {financialData.profitMargin.toFixed(1)}%
                    </p>
                </div>
            </div>

            {/* Chart */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Performance Financière</h2>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} />
                            <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(value) => `${(value as number) / 1000}k`} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '0.5rem',
                                }}
                                formatter={(value) => `${(value as number).toLocaleString('fr-FR')} FCFA`}
                                labelStyle={{ color: '#1f2937', fontWeight: 'bold' }}
                            />
                            <Bar dataKey="revenus" fill="#10b981" name="Revenus" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="depenses" fill="#ef4444" name="Dépenses" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="benefice" fill="#3b82f6" name="Bénéfice" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Businesses and User Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Performing Businesses */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Meilleures Entreprises</h2>
                    <div className="space-y-3">
                        {topBusinesses.map((business: any) => (
                            <div key={business.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <span className="font-medium text-gray-800 dark:text-white">{business.name}</span>
                                <span className={`font-bold ${business.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(business.netProfit)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* User Statistics */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Utilisateurs</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Total</span>
                            <span className="font-bold text-gray-800 dark:text-white">{userStats.totalUsers}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Administrateurs</span>
                            <span className="font-bold text-purple-600">{userStats.adminUsers}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 dark:text-gray-400">Gérants</span>
                            <span className="font-bold text-blue-600">{userStats.managerUsers}</span>
                        </div>
                        <div className="pt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                <div 
                                    className="bg-purple-600 h-2 rounded-full" 
                                    style={{ width: `${(userStats.adminUsers / userStats.totalUsers) * 100}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <span>Admins</span>
                                <span>Gérants</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};