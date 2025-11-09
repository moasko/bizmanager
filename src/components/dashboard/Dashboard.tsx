"use client";

import React, { useMemo, useState } from 'react';
import type { Business, Product } from '@/types';
import { StatCard } from './StatCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DateFilter } from '../shared';

interface DashboardProps {
    business: Business;
}

const LowStockAlerts: React.FC<{ products: Product[] }> = ({ products }) => {
    if (products.length === 0) return null;
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg mt-8">
            <h3 className="text-xl font-bold text-yellow-600 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                Alertes de Stock Faible
            </h3>
            <ul className="space-y-3">
                {products.map((product: any) => (
                    <li key={product.id} className="flex justify-between items-center text-sm">
                        <p className="font-semibold text-gray-700">{product.name}</p>
                        <p className="font-bold text-red-600">Stock restant : {product.stock}</p>
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

    return Object.values(data).sort((a,b) => {
        const [aMonth, aYear] = a.name.split(" '");
        const [bMonth, bYear] = b.name.split(" '");
        return new Date(`${aMonth} 1, 20${aYear}`).getTime() - new Date(`${bMonth} 1, 20${bYear}`).getTime();
    });
};


export const Dashboard: React.FC<DashboardProps> = ({ business }) => {
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const filteredData = useMemo(() => {
        const { start, end } = dateRange;
        const startDate = start ? new Date(start) : null;
        const endDate = end ? new Date(end) : null;

        if (!startDate || !endDate) {
            return { sales: business.sales, expenses: business.expenses, products: business.products, clients: business.clients };
        }

        // Add 1 day to end date to make it inclusive
        endDate.setDate(endDate.getDate() + 1);

        const sales = business.sales.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate >= startDate && saleDate <= endDate;
        });

        const expenses = business.expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate >= startDate && expenseDate <= endDate;
        });

        // For products and clients, we don't filter by date, but we pass them through
        return { sales, expenses, products: business.products, clients: business.clients };
    }, [business, dateRange]);

    const { totalRevenue, totalExpenses, totalProfit, clientCount, recentSales, lowStockProducts } = useMemo(() => {
        const totalRevenue = filteredData.sales.reduce((sum, sale) => sum + sale.total, 0);
        const totalExpenses = filteredData.expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const recentSales = [...filteredData.sales].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
        const lowStockProducts = filteredData.products.filter(p => p.stock < 10);

        return {
            totalRevenue,
            totalExpenses,
            totalProfit: totalRevenue - totalExpenses,
            clientCount: filteredData.clients.length,
            recentSales,
            lowStockProducts
        };
    }, [filteredData]);

    const monthlyChartData = useMemo(() => processMonthlyData(filteredData.sales, filteredData.expenses), [filteredData.sales, filteredData.expenses]);
    
    const handleDateRangeChange = (start: string, end: string) => {
        setDateRange({ start, end });
    };
    
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Tableau de Bord</h1>
                
                <div className="bg-white p-3 rounded-lg shadow-md">
                    <DateFilter onDateRangeChange={handleDateRangeChange} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Revenu Total" value={`${totalRevenue.toLocaleString('fr-FR')} FCFA`} change="+12.5%" icon="revenue" />
                <StatCard title="Dépenses Totales" value={`${totalExpenses.toLocaleString('fr-FR')} FCFA`} change="-5.2%" icon="expense" />
                <StatCard title="Bénéfice Total" value={`${totalProfit.toLocaleString('fr-FR')} FCFA`} change="+8.1%" icon="profit" />
                <StatCard title="Clients Actifs" value={clientCount.toString()} change="+2" icon="clients" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Aperçu Mensuel</h3>
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
                </div>
                <div className="flex flex-col space-y-8">
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Ventes Récentes</h3>
                        <ul className="space-y-4">
                            {recentSales.map(sale => (
                                <li key={sale.id} className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-gray-700">{sale.clientName}</p>
                                        <p className="text-sm text-gray-500">{sale.productName}</p>
                                    </div>
                                    <p className="font-bold text-primary-600">{sale.total.toLocaleString('fr-FR')} FCFA</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                     <LowStockAlerts products={lowStockProducts} />
                </div>
            </div>
        </div>
    );
};