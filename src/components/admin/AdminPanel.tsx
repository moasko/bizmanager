"use client";

import React, { useState, useMemo } from 'react';
import type { Business, User, Sale, Product } from '@/types';
import { useBusinesses } from '@/hooks/useBusiness';
import { useUsers } from '@/hooks/useUser';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
// Importer les fonctions de calcul depuis le nouveau fichier
import {
    calculateTotalSalesRevenue,
    calculateTotalExpenses,
    calculateCOGS,
    calculateGrossProfit,
    calculateOperatingExpenses,
    calculateOneTimeExpenses,
    calculateOperatingProfit,
    calculateNetProfit,
    calculateInventoryValue,
    calculateExpenseBreakdown,
    calculateEBITDA,
    calculateNetProfitMargin,
    calculateGrossProfitMargin,
    calculateOperatingProfitMargin,
    calculateROI,
    formatCurrency,
    formatPercentage
} from '@/utils/calculations';

interface AdminPanelProps {
    allBusinesses: Business[];
    allUsers: User[];
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ allBusinesses, allUsers }) => {
    console.log('AdminPanel - allBusinesses:', allBusinesses);
    console.log('AdminPanel - allUsers:', allUsers);
    
    const { data: fetchedBusinesses = [], isLoading: businessesLoading } = useBusinesses();
    const { data: fetchedUsers = [], isLoading: usersLoading } = useUsers();
    
    console.log('AdminPanel - fetchedBusinesses:', fetchedBusinesses);
    console.log('AdminPanel - fetchedUsers:', fetchedUsers);
    
    // Use fetched data if available, otherwise use the prop data
    const displayedBusinesses = fetchedBusinesses.length > 0 ? fetchedBusinesses : allBusinesses;
    const displayedUsers = fetchedUsers.length > 0 ? fetchedUsers : allUsers;
    
    console.log('AdminPanel - displayedBusinesses:', displayedBusinesses);
    console.log('AdminPanel - displayedUsers:', displayedUsers);

    const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
    const [reportPeriod, setReportPeriod] = useState<'all' | 'month' | 'quarter' | 'year'>('all');
    const [salesPeriod, setSalesPeriod] = useState<'all' | 'month' | 'quarter' | 'year'>('all');
    const [adminView, setAdminView] = useState<'overview' | 'businesses' | 'users' | 'financial' | 'products'>('overview'); // New state for admin view

    // Get selected business details
    const selectedBusiness = selectedBusinessId
        ? displayedBusinesses.find((b: any) => b.id === selectedBusinessId)
        : null;

    // Get all products from all businesses or selected business
    const getAllProducts = (): any[] => {
        if (selectedBusiness) {
            return selectedBusiness.products || [];
        }

        // Flatten products from all businesses and add business name
        return displayedBusinesses.flatMap((business: any) =>
            (business.products || []).map((product: any) => ({
                ...product,
                businessName: business.name
            }))
        );
    };

    // Get all expenses from all businesses or selected business
    const getAllExpenses = (): any[] => {
        if (selectedBusiness) {
            return selectedBusiness.expenses?.map((expense: any) => ({
                ...expense,
                businessName: selectedBusiness.name
            })) || [];
        }

        // Flatten expenses from all businesses and add business name
        return displayedBusinesses.flatMap((business: any) =>
            (business.expenses || []).map((expense: any) => ({
                ...expense,
                businessName: business.name
            }))
        );
    };

    // Get filtered expenses for display
    const getFilteredExpenses = (): any[] => {
        let allExpenses = getAllExpenses();
        
        if (reportPeriod === 'all') return allExpenses;

        const now = new Date();
        return allExpenses.filter(expense => {
            const expenseDate = new Date(expense.date);

            switch (reportPeriod) {
                case 'month':
                    return expenseDate.getMonth() === now.getMonth() &&
                        expenseDate.getFullYear() === now.getFullYear();
                case 'quarter':
                    const currentQuarter = Math.floor(now.getMonth() / 3);
                    const expenseQuarter = Math.floor(expenseDate.getMonth() / 3);
                    return expenseQuarter === currentQuarter &&
                        expenseDate.getFullYear() === now.getFullYear();
                case 'year':
                    return expenseDate.getFullYear() === now.getFullYear();
                default:
                    return true;
            }
        });
    };

    // Calculate statistics
    const totalBusinesses = displayedBusinesses.length;
    const totalUsersCount = displayedUsers.length;

    // Calculate total sales, expenses, and products across all businesses
    const totalSales = displayedBusinesses.reduce((sum: number, business: Business) => sum + (business.sales?.length || 0), 0);
    const totalExpenses = displayedBusinesses.reduce((sum: number, business: Business) => sum + (business.expenses?.length || 0), 0);
    const totalProducts = displayedBusinesses.reduce((sum: number, business: Business) => sum + (business.products?.length || 0), 0);

    // Calculate financial totals
    const totalRevenue = displayedBusinesses.reduce((sum: number, business: Business) =>
        sum + calculateTotalSalesRevenue(business.sales || []), 0);
    const totalExpensesAmount = displayedBusinesses.reduce((sum: number, business: Business) =>
        sum + calculateTotalExpenses(business.expenses || []), 0);
    const totalProductValue = displayedBusinesses.reduce((sum: number, business: Business) =>
        sum + calculateInventoryValue(business.products || []), 0);
    const totalCOGS = displayedBusinesses.reduce((sum: number, business: Business) =>
        sum + calculateCOGS(business.sales || [], business.products || []), 0);

    // Calculate profit/loss
    const netProfit = totalRevenue - totalCOGS - totalExpensesAmount;

    // Filter data based on selected period
    const filterByPeriod = (items: any[], dateField: string): any[] => {
        if (reportPeriod === 'all') return items;

        const now = new Date();
        const filteredItems = items.filter(item => {
            const itemDate = new Date(item[dateField]);

            switch (reportPeriod) {
                case 'month':
                    return itemDate.getMonth() === now.getMonth() &&
                        itemDate.getFullYear() === now.getFullYear();
                case 'quarter':
                    const currentQuarter = Math.floor(now.getMonth() / 3);
                    const itemQuarter = Math.floor(itemDate.getMonth() / 3);
                    return itemQuarter === currentQuarter &&
                        itemDate.getFullYear() === now.getFullYear();
                case 'year':
                    return itemDate.getFullYear() === now.getFullYear();
                default:
                    return true;
            }
        });

        return filteredItems;
    };

    // Filter sales by selected period
    const filterSalesByPeriod = (sales: Sale[]): Sale[] => {
        if (salesPeriod === 'all') return sales;

        const now = new Date();
        return sales.filter(sale => {
            const saleDate = new Date(sale.date);

            switch (salesPeriod) {
                case 'month':
                    return saleDate.getMonth() === now.getMonth() &&
                        saleDate.getFullYear() === now.getFullYear();
                case 'quarter':
                    const currentQuarter = Math.floor(now.getMonth() / 3);
                    const saleQuarter = Math.floor(saleDate.getMonth() / 3);
                    return saleQuarter === currentQuarter &&
                        saleDate.getFullYear() === now.getFullYear();
                case 'year':
                    return saleDate.getFullYear() === now.getFullYear();
                default:
                    return true;
            }
        });
    };

    // Get filtered sales for display
    const getFilteredSales = (): Sale[] => {
        let allSales: Sale[] = [];

        if (selectedBusiness) {
            allSales = filterSalesByPeriod(selectedBusiness.sales || []);
        } else {
            allSales = displayedBusinesses.flatMap((business: any) =>
                filterSalesByPeriod(business.sales || []).map((sale: any) => ({
                    ...sale,
                    businessName: business.name
                }))
            );
        }

        return allSales;
    };

    // Get top performing businesses with enhanced metrics
    const getTopPerformingBusinesses = (): any[] => {
        const businessesWithMetrics = [...displayedBusinesses]
            .map((business: any) => {
                const totalRevenue = calculateTotalSalesRevenue(business.sales || []);
                const totalExpenses = calculateTotalExpenses(business.expenses || []);
                const cogs = calculateCOGS(business.sales || [], business.products || []);
                const grossProfit = calculateGrossProfit(business.sales || [], business.products || []);
                const operatingProfit = calculateOperatingProfit(business.sales || [], business.expenses || [], business.products || []);
                const netProfit = calculateNetProfit(business.sales || [], business.expenses || [], business.products || []);
                const ebitda = calculateEBITDA(business.sales || [], business.expenses || [], business.products || []);
                const grossProfitMargin = calculateGrossProfitMargin(business.sales || [], business.products || []);
                const operatingProfitMargin = calculateOperatingProfitMargin(business.sales || [], business.expenses || [], business.products || []);
                const netProfitMargin = calculateNetProfitMargin(business.sales || [], business.expenses || [], business.products || []);
                const roi = calculateROI(business.sales || [], business.expenses || [], business.products || []);
                const inventoryValue = calculateInventoryValue(business.products || []);
                const expenseBreakdown = calculateExpenseBreakdown(business.expenses || []);

                return {
                    id: business.id,
                    name: business.name,
                    totalRevenue,
                    totalExpenses,
                    operatingExpenses: calculateOperatingExpenses(business.expenses || []),
                    oneTimeExpenses: calculateOneTimeExpenses(business.expenses || []),
                    cogs,
                    grossProfit,
                    operatingProfit,
                    netProfit,
                    ebitda,
                    grossProfitMargin,
                    operatingProfitMargin,
                    netProfitMargin,
                    roi,
                    inventoryValue,
                    expenseBreakdown,
                    totalProducts: business.products?.length || 0,
                    totalSales: business.sales?.length || 0
                };
            });
            
        // Trier par bénéfice net décroissant, puis par revenu total décroissant
        const sortedBusinesses = businessesWithMetrics.sort((a, b) => {
            if (b.netProfit !== a.netProfit) {
                return b.netProfit - a.netProfit;
            }
            // Si les bénéfices nets sont égaux, trier par revenu total
            return b.totalRevenue - a.totalRevenue;
        });
        
        // Afficher les 5 premières entreprises
        return sortedBusinesses.slice(0, 5);
    };

    // Get business performance metrics with enhanced calculations
    const getBusinessPerformanceMetrics = (): any[] => {
        if (!selectedBusiness) {
            // Calculate metrics for all businesses
            return displayedBusinesses.map((business: any) => {
                const sales = business.sales || [];
                const expenses = business.expenses || [];
                const products = business.products || [];
                
                const totalSales = sales.length;
                const totalRevenue = calculateTotalSalesRevenue(sales);
                const totalExpensesAmount = calculateTotalExpenses(expenses);
                const cogs = calculateCOGS(sales, products);
                const grossProfit = calculateGrossProfit(sales, products);
                const operatingProfit = calculateOperatingProfit(sales, expenses, products);
                const netProfit = calculateNetProfit(sales, expenses, products);
                const ebitda = calculateEBITDA(sales, expenses, products);
                const grossProfitMargin = calculateGrossProfitMargin(sales, products);
                const operatingProfitMargin = calculateOperatingProfitMargin(sales, expenses, products);
                const netProfitMargin = calculateNetProfitMargin(sales, expenses, products);
                const roi = calculateROI(sales, expenses, products);
                const totalProductValue = calculateInventoryValue(products);
                
                return {
                    id: business.id,
                    name: business.name,
                    totalSales,
                    totalRevenue,
                    totalExpensesAmount,
                    cogs,
                    grossProfit,
                    operatingProfit,
                    netProfit,
                    ebitda,
                    grossProfitMargin,
                    operatingProfitMargin,
                    netProfitMargin,
                    roi,
                    totalProductValue
                };
            });
        } else {
            // Calculate metrics for selected business
            const sales = selectedBusiness.sales || [];
            const expenses = selectedBusiness.expenses || [];
            const products = selectedBusiness.products || [];
            
            const totalSales = sales.length;
            const totalRevenue = calculateTotalSalesRevenue(sales);
            const totalExpensesAmount = calculateTotalExpenses(expenses);
            const cogs = calculateCOGS(sales, products);
            const grossProfit = calculateGrossProfit(sales, products);
            const operatingProfit = calculateOperatingProfit(sales, expenses, products);
            const netProfit = calculateNetProfit(sales, expenses, products);
            const ebitda = calculateEBITDA(sales, expenses, products);
            const grossProfitMargin = calculateGrossProfitMargin(sales, products);
            const operatingProfitMargin = calculateOperatingProfitMargin(sales, expenses, products);
            const netProfitMargin = calculateNetProfitMargin(sales, expenses, products);
            const roi = calculateROI(sales, expenses, products);
            const totalProductValue = calculateInventoryValue(products);
            
            return [{
                id: selectedBusiness.id,
                name: selectedBusiness.name,
                totalSales,
                totalRevenue,
                totalExpensesAmount,
                cogs,
                grossProfit,
                operatingProfit,
                netProfit,
                ebitda,
                grossProfitMargin,
                operatingProfitMargin,
                netProfitMargin,
                roi,
                totalProductValue
            }];
        }
    };

    const businessMetrics = useMemo(() => {
        if (!selectedBusiness) return null;
        
        const sales = selectedBusiness.sales || [];
        const expenses = selectedBusiness.expenses || [];
        const products = selectedBusiness.products || [];
        
        const totalSales = sales.length;
        const totalRevenue = calculateTotalSalesRevenue(sales);
        const totalExpensesAmount = calculateTotalExpenses(expenses);
        const cogs = calculateCOGS(sales, products);
        const grossProfit = calculateGrossProfit(sales, products);
        const operatingProfit = calculateOperatingProfit(sales, expenses, products);
        const netProfit = calculateNetProfit(sales, expenses, products);
        const ebitda = calculateEBITDA(sales, expenses, products);
        const grossProfitMargin = calculateGrossProfitMargin(sales, products);
        const operatingProfitMargin = calculateOperatingProfitMargin(sales, expenses, products);
        const netProfitMargin = calculateNetProfitMargin(sales, expenses, products);
        const roi = calculateROI(sales, expenses, products);
        const totalProductValue = calculateInventoryValue(products);
        
        return {
          totalSales,
          totalRevenue,
          totalExpensesAmount,
          cogs,
          grossProfit,
          operatingProfit,
          netProfit,
          ebitda,
          grossProfitMargin,
          operatingProfitMargin,
          netProfitMargin,
          roi,
          totalProductValue
        };
      }, [selectedBusiness]);

    // Render overview view for admin with enhanced metrics
    const renderOverviewView = () => (
        <div className="space-y-8">
            {/* Executive Summary */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-xl p-6 text-white">
                <h2 className="text-2xl font-bold mb-6">Tableau de bord</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
                        <h3 className="text-lg font-semibold">Total Entreprises</h3>
                        <p className="text-3xl font-bold mt-2">{totalBusinesses}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
                        <h3 className="text-lg font-semibold">Utilisateurs Actifs</h3>
                        <p className="text-3xl font-bold mt-2">{totalUsersCount}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
                        <h3 className="text-lg font-semibold">Revenus Totaux</h3>
                        <p className="text-3xl font-bold mt-2">{formatCurrency(totalRevenue)}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
                        <h3 className="text-lg font-semibold">Bénéfice Net</h3>
                        <p className={`text-3xl font-bold mt-2 ${netProfit >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                            {formatCurrency(netProfit)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Financial Performance Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Performance Financière</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Marge Brute</h3>
                            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-3">
                            {totalRevenue > 0 ? formatPercentage(calculateGrossProfitMargin(
                                displayedBusinesses.flatMap((b: any) => b.sales || []),
                                displayedBusinesses.flatMap((b: any) => b.products || [])
                            )) : '0.00%'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Revenus - Coût des marchandises vendues</p>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Marge d'Exploitation</h3>
                            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <p className={`text-2xl font-bold mt-3 ${netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {totalRevenue > 0 ? formatPercentage(calculateOperatingProfitMargin(
                                displayedBusinesses.flatMap((b: any) => b.sales || []),
                                displayedBusinesses.flatMap((b: any) => b.expenses || []),
                                displayedBusinesses.flatMap((b: any) => b.products || [])
                            )) : '0.00%'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Bénéfice après dépenses opérationnelles</p>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Marge Nette</h3>
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" />
                                </svg>
                            </div>
                        </div>
                        <p className={`text-2xl font-bold mt-3 ${netProfit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                            {totalRevenue > 0 ? formatPercentage((netProfit / totalRevenue) * 100) : '0.00%'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Bénéfice après toutes les dépenses</p>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Valeur du Stock</h3>
                            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-3">{formatCurrency(totalProductValue)}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Valeur actuelle de l'inventaire</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Performing Businesses */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Entreprises les Plus Performantes</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Entreprise</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Revenus</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Bénéfice Net</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ROI (%)</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {getTopPerformingBusinesses().slice(0, 5).map((businessWithMetrics: any) => (
                                    <tr key={businessWithMetrics.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{businessWithMetrics.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">{formatCurrency(businessWithMetrics.totalRevenue)}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${businessWithMetrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatCurrency(businessWithMetrics.netProfit)}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${businessWithMetrics.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatPercentage(businessWithMetrics.roi)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Activité Récente</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Montant</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Entreprise</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {getFilteredSales()
                                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                    .slice(0, 5)
                                    .map((sale: any, index) => (
                                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {new Date(sale.date).toLocaleDateString('fr-FR')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                                                    Vente
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                                {formatCurrency(sale.total)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {sale.businessName || (selectedBusiness ? selectedBusiness.name : 'Multiple')}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );

    // Render businesses view for admin with enhanced metrics
    const renderBusinessesView = () => (
        <div className="space-y-8">
            {/* Business Performance Metrics */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Performance des Entreprises</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Entreprise</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Revenus</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Coût des Marchandises</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Marge Brute</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dépenses Opérationnelles</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Bénéfice Net</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ROI (%)</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Valeur du Stock</th>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Actions</td>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {getBusinessPerformanceMetrics().map((business: any) => (
                                <tr key={business.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{business.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{formatCurrency(business.totalRevenue)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{formatCurrency(business.cogs)}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${business.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatCurrency(business.grossProfit)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{formatCurrency(business.operatingProfit)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">{formatCurrency(business.netProfit)}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${business.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatPercentage(business.roi)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatCurrency(business.totalProductValue)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    // Render users view for admin
    const renderUsersView = () => (
        <div className="space-y-8">
            {/* Users Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Utilisateurs</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nom</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rôle</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Entreprises Gérées</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {displayedUsers.map((user: User) => (
                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                        <div className="flex items-center">
                                            <img src={user?.avatarUrl || ''} alt={user.name} className="w-8 h-8 rounded-full mr-3" />
                                            {user.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'ADMIN'
                                            ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                                            : 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {user.role === 'ADMIN'
                                            ? 'Toutes'
                                            : user.managedBusinessIds
                                                ? `${user.managedBusinessIds.length} entreprise(s)`
                                                : 'Aucune'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    // Render financial view for admin
    const renderFinancialView = () => (
        <div className="space-y-8">
            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Entreprises</h3>
                        <div className="w-10 h-10 rounded-full bg-blue-400/30 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-3xl font-bold mt-3">{totalBusinesses}</p>
                </div>
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Utilisateurs</h3>
                        <div className="w-10 h-10 rounded-full bg-indigo-400/30 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-3xl font-bold mt-3">{totalUsersCount}</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Revenus Totaux</h3>
                        <div className="w-10 h-10 rounded-full bg-green-400/30 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-3xl font-bold mt-3">{formatCurrency(totalRevenue)}</p>
                </div>
                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Dépenses Totales</h3>
                        <div className="w-10 h-10 rounded-full bg-red-400/30 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-3xl font-bold mt-3">{formatCurrency(totalExpensesAmount)}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Bénéfice Net</h3>
                        <div className="w-10 h-10 rounded-full bg-purple-400/30 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" />
                            </svg>
                        </div>
                    </div>
                    <p className={`text-3xl font-bold mt-3 ${netProfit >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                        {formatCurrency(netProfit)}
                    </p>
                </div>
            </div>

            {/* Enhanced Financial Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Analyse Financière Détaillée</h2>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md transition-shadow">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Revenus Totaux</h3>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalRevenue)}</p>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md transition-shadow">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Coût des Marchandises Vendues</h3>
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                            {formatCurrency(displayedBusinesses.reduce((sum: number, business: any) => sum + calculateCOGS(business.sales || [], business.products || []), 0))}
                        </p>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md transition-shadow">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Marge Brute</h3>
                        <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            {formatCurrency(displayedBusinesses.reduce((sum: number, business: any) => 
                                sum + calculateGrossProfit(business.sales || [], business.products || []), 0))}
                        </p>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md transition-shadow">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Marge d'Exploitation</h3>
                        <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {formatCurrency(displayedBusinesses.reduce((sum: number, business: any) =>
                                sum + calculateOperatingProfit(business.sales, business.expenses, business.products), 0))}
                        </p>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md transition-shadow">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Marge Nette</h3>
                        <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {formatCurrency(netProfit)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Expense Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Répartition des Dépenses</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md transition-shadow">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Dépenses Opérationnelles</h3>
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                            {formatCurrency(displayedBusinesses.reduce((sum: number, business: any) => sum + calculateOperatingExpenses(business.expenses), 0))}
                        </p>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md transition-shadow">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Investissements Ponctuels</h3>
                        <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                            {formatCurrency(displayedBusinesses.reduce((sum: number, business: any) => sum + calculateOneTimeExpenses(business.expenses), 0))}
                        </p>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md transition-shadow">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Retour sur Investissement</h3>
                        <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {totalExpensesAmount > 0 ?
                                formatPercentage((netProfit / displayedBusinesses.reduce((sum: number, business: any) => sum + calculateOneTimeExpenses(business.expenses), 0)) * 100) :
                                '0.00%'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Expense List */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Liste des Dépenses</h2>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400 hidden md:block">Sélectionner une entreprise:</span>
                        <select
                            value={selectedBusinessId || ''}
                            onChange={(e) => setSelectedBusinessId(e.target.value || null)}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="">Toutes les entreprises</option>
                            {displayedBusinesses.map((business: any) => (
                                <option key={business.id} value={business.id}>{business.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Catégorie</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Montant</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Entreprise</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {getFilteredExpenses()
                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                .slice(0, 10)
                                .map((expense: any, index) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(expense.date).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {expense.description}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                                {expense.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                                            {formatCurrency(expense.amount)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {expense.businessName || (selectedBusiness ? selectedBusiness.name : 'Multiple')}
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Business Financial Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Résumé Financier par Entreprise</h2>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400 hidden md:block">Sélectionner une entreprise:</span>
                        <select
                            value={selectedBusinessId || ''}
                            onChange={(e) => setSelectedBusinessId(e.target.value || null)}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="">Toutes les entreprises</option>
                            {displayedBusinesses.map((business: any) => (
                                <option key={business.id} value={business.id}>{business.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Entreprise</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ventes</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Revenus</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Coût des Marchandises</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Marge Brute</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dépenses Opérationnelles</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dépenses Ponctuelles</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Bénéfice Net</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ROI</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Valeur du Stock</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {(selectedBusiness ? [selectedBusiness] : displayedBusinesses).map((business: any) => {
                                const businessSalesRevenue = calculateTotalSalesRevenue(business.sales || []);
                                const businessCOGS = calculateCOGS(business.sales || [], business.products || []);
                                const businessOperatingExpenses = calculateOperatingExpenses(business.expenses || []);
                                const businessOneTimeExpenses = calculateOneTimeExpenses(business.expenses || []);
                                const businessTotalExpenses = businessOperatingExpenses + businessOneTimeExpenses;
                                const businessProfit = businessSalesRevenue - businessCOGS - businessTotalExpenses;
                                const businessProductValue = calculateInventoryValue(business.products || []);

                                return (
                                    <tr key={business.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{business.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{business.sales?.length || 0}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">{formatCurrency(businessSalesRevenue)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">{formatCurrency(calculateCOGS(business.sales || [], business.products || []))}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${calculateGrossProfit(business.sales || [], business.products || []) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatCurrency(calculateGrossProfit(business.sales || [], business.products || []))}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">{formatCurrency(calculateOperatingExpenses(business.expenses || []))}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 font-medium">{formatCurrency(calculateOneTimeExpenses(business.expenses || []))}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${businessProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatCurrency(businessProfit)}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${calculateROI(business.sales, business.expenses, business.products) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatPercentage(calculateROI(business.sales, business.expenses, business.products))}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatCurrency(businessProductValue)}</td>
                                    </tr>
                                );
                            })}
                            {!selectedBusiness && (
                                <tr className="bg-gray-100 dark:bg-gray-700 font-bold">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">Total</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{totalSales}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{formatCurrency(totalRevenue)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{formatCurrency(displayedBusinesses.reduce((sum: number, business: any) => sum + calculateCOGS(business.sales, business.products), 0))}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600">{formatCurrency(displayedBusinesses.reduce((sum: number, business: any) => sum + calculateGrossProfit(business.sales || [], business.products || []), 0))}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{formatCurrency(displayedBusinesses.reduce((sum: number, business: any) => sum + calculateOperatingExpenses(business.expenses), 0))}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">{formatCurrency(displayedBusinesses.reduce((sum: number, business: any) => sum + calculateOneTimeExpenses(business.expenses), 0))}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatCurrency(netProfit)}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatPercentage((netProfit / (displayedBusinesses.reduce((sum: number, business: any) => sum + calculateOneTimeExpenses(business.expenses), 0) || 1)) * 100)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{formatCurrency(totalProductValue)}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Expense Breakdown by Category */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Répartition des Dépenses par Catégorie</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(() => {
                        const expenseData = Object.entries(
                            displayedBusinesses.reduce((acc: Record<string, number>, business: any) => {
                                const breakdown = calculateExpenseBreakdown(business.expenses || []);
                                Object.entries(breakdown).forEach(([category, amount]) => {
                                    acc[category] = (acc[category] || 0) + amount;
                                });
                                return acc;
                            }, {} as Record<string, number>)
                        ) as [string, number][];

                        return expenseData.map(([category, amount]) => (
                            <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md transition-shadow">
                                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">{category}</h3>
                                <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-2">{formatCurrency(amount)}</p>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
                                    <div 
                                        className="bg-red-600 h-2 rounded-full" 
                                        style={{ width: `${totalExpensesAmount > 0 ? Math.min((amount / totalExpensesAmount) * 100, 100) : 0}%` }}
                                    ></div>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                    {totalExpensesAmount > 0 ? `${((amount / totalExpensesAmount) * 100).toFixed(1)}% des dépenses totales` : '0%'}
                                </p>
                            </div>
                        ));
                    })()}
                </div>
            </div>
        </div>
    );

    if (businessesLoading || usersLoading) {
        return (
            <div className="flex w-full h-screen flex-col justify-center items-center space-y-4">
                <div className="flex flex-col items-center space-y-4 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-orange-200 rounded-full"></div>
                        <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                    </div>
                    <div className="space-y-3 text-center">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Panneau d'administration</h2>
                        <p className="text-lg text-gray-600 dark:text-gray-300 animate-pulse">Chargement des données en cours...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Panneau d'Administration</h1>
                <div className="flex flex-col sm:flex-row gap-3">
                    <select
                        value={reportPeriod}
                        onChange={(e) => setReportPeriod(e.target.value as any)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="all">Toute période</option>
                        <option value="month">Ce mois</option>
                        <option value="quarter">Ce trimestre</option>
                        <option value="year">Cette année</option>
                    </select>
                    <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Exporter Rapport
                    </button>
                </div>
            </div>

            {/* Admin View Navigation */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setAdminView('overview')}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center ${adminView === 'overview'
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Vue d'Ensemble
                </button>
                <button
                    onClick={() => setAdminView('businesses')}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center ${adminView === 'businesses'
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Entreprises
                </button>
                <button
                    onClick={() => setAdminView('users')}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center ${adminView === 'users'
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Utilisateurs
                </button>
                <button
                    onClick={() => setAdminView('financial')}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center ${adminView === 'financial'
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Finances
                </button>
                <button
                    onClick={() => setAdminView('products')}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center ${adminView === 'products'
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    Produits
                </button>
            </div>

            {/* Render the selected view */}
            {adminView === 'overview' && renderOverviewView()}
            {adminView === 'businesses' && renderBusinessesView()}
            {adminView === 'users' && renderUsersView()}
            {adminView === 'financial' && renderFinancialView()}
            {adminView === 'products' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Liste des Produits</h2>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Sélectionner une entreprise:</span>
                            <select
                                value={selectedBusinessId || ''}
                                onChange={(e) => setSelectedBusinessId(e.target.value || null)}
                                className="px-3 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="">Toutes les entreprises</option>
                                {displayedBusinesses.map((business: any) => (
                                    <option key={business.id} value={business.id}>{business.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default AdminPanel;
