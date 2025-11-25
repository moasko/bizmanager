"use client";

import React, { useState } from 'react';
import type { Business, User, Sale, Expense, Product } from '@/types';
import { useBusinesses } from '@/hooks/useBusiness';
import { useUsers } from '@/hooks/useUser';

interface AdminPanelProps {
    allBusinesses: Business[];
    allUsers: User[];
}

// Helper function to calculate total sales revenue
const calculateTotalSalesRevenue = (sales: Sale[]): number => {
    return sales.reduce((sum, sale) => sum + sale.total, 0);
};

// Helper function to calculate total expenses
const calculateTotalExpenses = (expenses: Expense[]): number => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
};

// Helper function to calculate cost of goods sold (COGS)
const calculateCOGS = (sales: Sale[], products: Product[]): number => {
    // More accurate approach - track actual inventory costs
    // This considers the actual cost of products sold based on wholesale prices
    let totalCOGS = 0;

    sales.forEach(sale => {
        const product = products.find(p => p.id === sale.productId);
        if (product) {
            // Use wholesale price as cost basis (actual cost of goods)
            totalCOGS += product.wholesalePrice * sale.quantity;
        }
    });

    return totalCOGS;
};

// Helper function to calculate total product value (inventory value)
const calculateTotalProductValue = (products: Product[]): number => {
    return products.reduce((sum, product) => sum + (product.stock * product.wholesalePrice), 0);
};

// Helper function to calculate operating expenses
const calculateOperatingExpenses = (expenses: Expense[]): number => {
    // Filter for operating expenses (excluding one-time or capital expenses)
    return expenses
        .filter(expense => !expense.category.toLowerCase().includes('capital') &&
            !expense.category.toLowerCase().includes('investment'))
        .reduce((sum, expense) => sum + expense.amount, 0);
};

// Helper function to calculate one-time expenses
const calculateOneTimeExpenses = (expenses: Expense[]): number => {
    return expenses
        .filter(expense => expense.category.toLowerCase().includes('capital') ||
            expense.category.toLowerCase().includes('investment'))
        .reduce((sum, expense) => sum + expense.amount, 0);
};

// Helper function to calculate expense breakdown
const calculateExpenseBreakdown = (expenses: Expense[]): Record<string, number> => {
    const breakdown: Record<string, number> = {};

    expenses.forEach(expense => {
        const category = expense.category || 'Autre';
        breakdown[category] = (breakdown[category] || 0) + expense.amount;
    });

    return breakdown;
};

// Helper function to calculate gross profit
const calculateGrossProfit = (sales: Sale[], expenses: Expense[], products: Product[]): number => {
    const totalRevenue = calculateTotalSalesRevenue(sales);
    const cogs = calculateCOGS(sales, products);
    return totalRevenue - cogs;
};

// Helper function to calculate operating profit
const calculateOperatingProfit = (sales: Sale[], expenses: Expense[], products: Product[]): number => {
    const grossProfit = calculateGrossProfit(sales, expenses, products);
    const operatingExpenses = calculateOperatingExpenses(expenses);
    return grossProfit - operatingExpenses;
};

// Helper function to calculate net profit
const calculateNetProfit = (sales: Sale[], expenses: Expense[], products: Product[]): number => {
    const grossProfit = calculateGrossProfit(sales, expenses, products);
    const totalExpenses = calculateTotalExpenses(expenses);
    return grossProfit - totalExpenses;
};

// Helper function to calculate EBITDA (Earnings Before Interest, Taxes, Depreciation, and Amortization)
const calculateEBITDA = (sales: Sale[], expenses: Expense[], products: Product[]): number => {
    // For simplicity, we'll assume no interest, taxes, depreciation, or amortization in this model
    // In a real system, you would adjust for these factors
    return calculateOperatingProfit(sales, expenses, products);
};

// Helper function to calculate net profit margin
const calculateNetProfitMargin = (sales: Sale[], expenses: Expense[], products: Product[]): number => {
    const totalRevenue = calculateTotalSalesRevenue(sales);
    if (totalRevenue === 0) return 0;

    const netProfit = calculateNetProfit(sales, expenses, products);
    return (netProfit / totalRevenue) * 100;
};

// Helper function to calculate gross profit margin
const calculateGrossProfitMargin = (sales: Sale[], products: Product[]): number => {
    const totalRevenue = calculateTotalSalesRevenue(sales);
    if (totalRevenue === 0) return 0;

    const grossProfit = calculateGrossProfit(sales, [], products);
    return (grossProfit / totalRevenue) * 100;
};

// Helper function to calculate operating profit margin
const calculateOperatingProfitMargin = (sales: Sale[], expenses: Expense[], products: Product[]): number => {
    const totalRevenue = calculateTotalSalesRevenue(sales);
    if (totalRevenue === 0) return 0;

    const operatingProfit = calculateOperatingProfit(sales, expenses, products);
    return (operatingProfit / totalRevenue) * 100;
};

// Helper function to calculate return on investment (ROI)
const calculateROI = (sales: Sale[], expenses: Expense[], products: Product[]): number => {
    const totalInvestment = calculateOneTimeExpenses(expenses);
    if (totalInvestment === 0) return 0;

    const netProfit = calculateNetProfit(sales, expenses, products);
    return (netProfit / totalInvestment) * 100;
};

// Helper function to format currency
const formatCurrency = (amount: number): string => {
    return `${amount?.toLocaleString('fr-FR')} FCFA`;
};

// Helper function to format percentage
const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
};

export const AdminPanel: React.FC<AdminPanelProps> = ({ allBusinesses, allUsers }) => {
    const { data: fetchedBusinesses = [], isLoading: businessesLoading } = useBusinesses();
    const { data: fetchedUsers = [], isLoading: usersLoading } = useUsers();
    const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
    const [reportPeriod, setReportPeriod] = useState<'all' | 'month' | 'quarter' | 'year'>('all');
    const [salesPeriod, setSalesPeriod] = useState<'all' | 'month' | 'quarter' | 'year'>('all');
    const [adminView, setAdminView] = useState<'overview' | 'businesses' | 'users' | 'financial' | 'products'>('overview'); // New state for admin view

    // Use fetched data if available, otherwise use the prop data
    const displayedBusinesses = fetchedBusinesses.length > 0 ? fetchedBusinesses : allBusinesses;
    const displayedUsers = fetchedUsers.length > 0 ? fetchedUsers : allUsers;

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
        sum + calculateTotalProductValue(business.products || []), 0);

    // Calculate profit/loss
    const netProfit = totalRevenue - totalExpensesAmount;

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
            allSales = filterSalesByPeriod(selectedBusiness.sales ?? []);
        } else {
            allSales = displayedBusinesses.flatMap((business: any) =>
                (filterSalesByPeriod(business.sales || []).map((sale: any) => ({
                    ...sale,
                    businessName: business.name
                })) as Sale[])
            );
        }

        return allSales;
    };

    // Get top performing businesses with enhanced metrics
    const getTopPerformingBusinesses = (): any[] => {
        return [...displayedBusinesses]
            .map((business: any) => {
                const sales = business.sales || [];
                const expenses = business.expenses || [];
                const products = business.products || [];
                
                const totalRevenue = calculateTotalSalesRevenue(sales);
                const totalExpenses = calculateTotalExpenses(expenses);
                const cogs = calculateCOGS(sales, products);
                const grossProfit = calculateGrossProfit(sales, expenses, products);
                const operatingProfit = calculateOperatingProfit(sales, expenses, products);
                const netProfit = calculateNetProfit(sales, expenses, products);
                const ebitda = calculateEBITDA(sales, expenses, products);
                const grossProfitMargin = calculateGrossProfitMargin(sales, products);
                const operatingProfitMargin = calculateOperatingProfitMargin(sales, expenses, products);
                const netProfitMargin = calculateNetProfitMargin(sales, expenses, products);
                const roi = calculateROI(sales, expenses, products);

                return {
                    ...business,
                    totalRevenue,
                    totalExpenses,
                    cogs,
                    grossProfit,
                    operatingProfit,
                    netProfit,
                    ebitda,
                    grossProfitMargin,
                    operatingProfitMargin,
                    netProfitMargin,
                    roi
                };
            })
            .sort((a, b) => b.netProfit - a.netProfit)
            .slice(0, 5);
    };

    // Get business performance metrics with enhanced calculations
    const getBusinessPerformanceMetrics = () => {
        const businessesWithMetrics = displayedBusinesses.map((business: any) => {
            const sales = business.sales || [];
            const expenses = business.expenses || [];
            const products = business.products || [];
            
            const totalRevenue = calculateTotalSalesRevenue(sales);
            const totalExpenses = calculateTotalExpenses(expenses);
            const operatingExpenses = calculateOperatingExpenses(expenses);
            const oneTimeExpenses = calculateOneTimeExpenses(expenses);
            const cogs = calculateCOGS(sales, products);
            const grossProfit = calculateGrossProfit(sales, expenses, products);
            const operatingProfit = calculateOperatingProfit(sales, expenses, products);
            const netProfit = calculateNetProfit(sales, expenses, products);
            const ebitda = calculateEBITDA(sales, expenses, products);
            const grossProfitMargin = calculateGrossProfitMargin(sales, products);
            const operatingProfitMargin = calculateOperatingProfitMargin(sales, expenses, products);
            const netProfitMargin = calculateNetProfitMargin(sales, expenses, products);
            const roi = calculateROI(sales, expenses, products);
            const inventoryValue = calculateTotalProductValue(products);
            const expenseBreakdown = calculateExpenseBreakdown(expenses);

            return {
                business,
                totalRevenue,
                totalExpenses,
                operatingExpenses,
                oneTimeExpenses,
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
                expenseBreakdown
            };
        });

        return businessesWithMetrics;
    };

    if (businessesLoading || usersLoading) {
        return (
            <div className="flex w-full h-screen flex-col justify-center items-center  space-y-4">
                <div className="flex items-center space-x-4 p-6">
                    <div className="relative">
                        <div className="w-12 h-12 border-4 border-orange-200 rounded-full"></div>
                        <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                    </div>
                    <div className="space-y-2">
                        <p className="font-semibold text-gray-800">Panneau d'administration</p>
                        <p className="text-sm text-gray-600 animate-pulse">Chargement en cours...</p>
                    </div>
                </div>
            </div>
        )
    }

    // Render overview view for admin with enhanced metrics
    const renderOverviewView = () => (
        <div className="space-y-8">
            {/* Executive Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Résumé Exécutif</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-orange-50 dark:bg-orange-900 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200">Total Entreprises</h3>
                        <p className="text-3xl font-bold text-orange-600 dark:text-orange-300">{totalBusinesses}</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">Utilisateurs Actifs</h3>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-300">{totalUsersCount}</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200">Revenus Totaux</h3>
                        <p className="text-3xl font-bold text-purple-600 dark:text-purple-300">{formatCurrency(totalRevenue)}</p>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">Bénéfice Net</h3>
                        <p className={`text-3xl font-bold ${netProfit >= 0 ? 'text-yellow-600 dark:text-yellow-300' : 'text-red-600 dark:text-red-300'}`}>
                            {formatCurrency(netProfit)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Financial Performance Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Performance Financière</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Marge Brute</h3>
                        <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            {totalRevenue > 0 ? formatPercentage(calculateGrossProfitMargin(
                                displayedBusinesses.flatMap((b: any) => b.sales || []).flat(),
                                displayedBusinesses.flatMap((b: any) => b.products || []).flat()
                            )) : '0.00%'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Revenus - Coût des marchandises vendues</p>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Marge d'Exploitation</h3>
                        <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {totalRevenue > 0 ? formatPercentage(calculateOperatingProfitMargin(
                                displayedBusinesses.flatMap((b: any) => b.sales || []).flat(),
                                displayedBusinesses.flatMap((b: any) => b.expenses || []).flat(),
                                displayedBusinesses.flatMap((b: any) => b.products || []).flat()
                            )) : '0.00%'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Bénéfice après dépenses opérationnelles</p>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Marge Nette</h3>
                        <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {totalRevenue > 0 ? formatPercentage((netProfit / totalRevenue) * 100) : '0.00%'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Bénéfice après toutes les dépenses</p>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Valeur du Stock</h3>
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{formatCurrency(totalProductValue)}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Valeur actuelle de l'inventaire</p>
                    </div>
                </div>
            </div>

            {/* Top Performing Businesses */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Entreprises les Plus Performantes</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Entreprise</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Revenus</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Coût des Marchandises</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Marge Brute</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Marge d'Exploitation</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dépenses Opérationnelles</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Bénéfice Net</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Marge Nette (%)</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ROI (%)</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {getTopPerformingBusinesses().map((businessWithMetrics: any) => (
                                <tr key={businessWithMetrics.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{businessWithMetrics.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">{formatCurrency(businessWithMetrics.totalRevenue)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">{formatCurrency(businessWithMetrics.cogs)}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${businessWithMetrics.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatCurrency(businessWithMetrics.grossProfit)}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${businessWithMetrics.operatingProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatCurrency(businessWithMetrics.operatingProfit)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">{formatCurrency(businessWithMetrics.operatingExpenses)}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${businessWithMetrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatCurrency(businessWithMetrics.netProfit)}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${businessWithMetrics.netProfitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatPercentage(businessWithMetrics.netProfitMargin)}
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
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
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
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Revenus</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Coût des Marchandises</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Marge Brute</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Marge d'Exploitation</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dépenses Opérationnelles</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Bénéfice Net</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Marge Nette (%)</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ROI (%)</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Valeur du Stock</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {getBusinessPerformanceMetrics().map((businessMetrics: any) => (
                                <tr key={businessMetrics.business.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{businessMetrics.business.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{businessMetrics.business.type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">{formatCurrency(businessMetrics.totalRevenue)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">{formatCurrency(businessMetrics.cogs)}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${businessMetrics.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatCurrency(businessMetrics.grossProfit)}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${businessMetrics.operatingProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatCurrency(businessMetrics.operatingProfit)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">{formatCurrency(businessMetrics.operatingExpenses)}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${businessMetrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatCurrency(businessMetrics.netProfit)}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${businessMetrics.netProfitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatPercentage(businessMetrics.netProfitMargin)}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${businessMetrics.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatPercentage(businessMetrics.roi)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatCurrency(businessMetrics.inventoryValue)}</td>
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
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Entreprises</h3>
                    <p className="text-3xl font-bold text-primary-600 mt-2">{totalBusinesses}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Utilisateurs</h3>
                    <p className="text-3xl font-bold text-primary-600 mt-2">{totalUsersCount}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Revenus Totaux</h3>
                    <p className="text-3xl font-bold text-green-600 mt-2">{formatCurrency(totalRevenue)}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Dépenses Totales</h3>
                    <p className="text-3xl font-bold text-red-600 mt-2">{formatCurrency(totalExpensesAmount)}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Bénéfice Net</h3>
                    <p className={`text-3xl font-bold mt-2 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(netProfit)}
                    </p>
                </div>
            </div>

            {/* Enhanced Financial Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Analyse Financière Détaillée</h2>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Revenus Totaux</h3>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalRevenue)}</p>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Coût des Marchandises Vendues</h3>
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                            {formatCurrency(displayedBusinesses.reduce((sum: number, business: any) => sum + calculateCOGS(business.sales, business.products), 0))}
                        </p>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Marge Brute</h3>
                        <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            {formatCurrency(displayedBusinesses.reduce((sum: number, business: any) =>
                                sum + calculateGrossProfit(business.sales, business.expenses, business.products), 0))}
                        </p>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Marge d'Exploitation</h3>
                        <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {formatCurrency(displayedBusinesses.reduce((sum: number, business: any) =>
                                sum + calculateOperatingProfit(business.sales, business.expenses, business.products), 0))}
                        </p>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Marge Nette</h3>
                        <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {formatCurrency(netProfit)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Expense Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Répartition des Dépenses</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Dépenses Opérationnelles</h3>
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                            {formatCurrency(displayedBusinesses.reduce((sum: number, business: any) => sum + calculateOperatingExpenses(business.expenses), 0))}
                        </p>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Investissements Ponctuels</h3>
                        <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                            {formatCurrency(displayedBusinesses.reduce((sum: number, business: any) => sum + calculateOneTimeExpenses(business.expenses), 0))}
                        </p>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Retour sur Investissement</h3>
                        <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {totalExpensesAmount > 0 ?
                                formatPercentage((netProfit / displayedBusinesses.reduce((sum: number, business: any) => sum + calculateOneTimeExpenses(business.expenses), 0)) * 100) :
                                '0.00%'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Business Financial Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Résumé Financier par Entreprise</h2>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Sélectionner une entreprise:</span>
                        <select
                            value={selectedBusinessId || ''}
                            onChange={(e) => setSelectedBusinessId(e.target.value || null)}
                            className="px-3 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                                const businessSalesRevenue = calculateTotalSalesRevenue(business.sales);
                                const businessExpensesAmount = calculateTotalExpenses(business.expenses);
                                const businessProductValue = calculateTotalProductValue(business.products);
                                const businessProfit = businessSalesRevenue - businessExpensesAmount;

                                return (
                                    <tr key={business.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{business.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{business.sales.length}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">{formatCurrency(businessSalesRevenue)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">{formatCurrency(calculateCOGS(business.sales, business.products))}</td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${calculateGrossProfit(business.sales, business.expenses, business.products) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatCurrency(calculateGrossProfit(business.sales, business.expenses, business.products))}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">{formatCurrency(calculateOperatingExpenses(business.expenses))}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 font-medium">{formatCurrency(calculateOneTimeExpenses(business.expenses))}</td>
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
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600">{formatCurrency(displayedBusinesses.reduce((sum: number, business: any) => sum + calculateGrossProfit(business.sales, business.expenses, business.products), 0))}</td>
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
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Répartition des Dépenses par Catégorie</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(() => {
                        const expenseData = Object.entries(
                            displayedBusinesses.reduce((acc: Record<string, number>, business: any) => {
                                const breakdown = calculateExpenseBreakdown(business.expenses);
                                Object.entries(breakdown).forEach(([category, amount]) => {
                                    acc[category] = (acc[category] || 0) + amount;
                                });
                                return acc;
                            }, {} as Record<string, number>)
                        ) as [string, number][];

                        return expenseData.map(([category, amount]) => (
                            <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">{category}</h3>
                                <p className="text-xl font-bold text-red-600 dark:text-red-400">{formatCurrency(amount)}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {totalExpensesAmount > 0 ? `${((amount / totalExpensesAmount) * 100).toFixed(1)}% des dépenses totales` : '0%'}
                                </p>
                            </div>
                        ));
                    })()}
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Panneau d'Administration</h1>
                <div className="flex space-x-4">
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
                    <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500">
                        Exporter Rapport
                    </button>
                </div>
            </div>

            {/* Admin View Navigation */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setAdminView('overview')}
                    className={`px-4 py-2 rounded-lg transition-colors ${adminView === 'overview'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                >
                    Vue d'Ensemble
                </button>
                <button
                    onClick={() => setAdminView('businesses')}
                    className={`px-4 py-2 rounded-lg transition-colors ${adminView === 'businesses'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                >
                    Entreprises
                </button>
                <button
                    onClick={() => setAdminView('users')}
                    className={`px-4 py-2 rounded-lg transition-colors ${adminView === 'users'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                >
                    Utilisateurs
                </button>
                <button
                    onClick={() => setAdminView('financial')}
                    className={`px-4 py-2 rounded-lg transition-colors ${adminView === 'financial'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                >
                    Finances
                </button>
                <button
                    onClick={() => setAdminView('products')}
                    className={`px-4 py-2 rounded-lg transition-colors ${adminView === 'products'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                >
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
}