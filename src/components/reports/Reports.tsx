import React, { useMemo, useState, useCallback } from 'react';
import type { Business, Sale, Expense } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';
import { DateFilter } from '../shared';

interface ReportsProps {
    business: Business;
    hideFilters?: boolean;
}

const processMonthlyData = (sales: Sale[], expenses: Expense[]) => {
    const data: { [key: string]: { name: string; ventes: number; depenses: number } } = {};
    const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

    const processItems = (items: (Sale | Expense)[], type: 'ventes' | 'depenses') => {
        items.forEach(item => {
            const date = new Date(item.date);
            const month = date.getMonth();
            const year = date.getFullYear();
            const key = `${year}-${month}`;
            const amount = type === 'ventes' ? (item as Sale).total : (item as Expense).amount;
            
            if (!data[key]) {
                data[key] = { name: `${monthNames[month]} '${String(year).slice(2)}`, ventes: 0, depenses: 0 };
            }
            data[key][type] += amount || 0; // Ajout de la vérification pour éviter NaN
        });
    };

    processItems(sales, 'ventes');
    processItems(expenses, 'depenses');

    // Trier les données par ordre chronologique
    return Object.values(data).sort((a, b) => {
        // Extraire l'année et le mois des noms de périodes
        const [aMonthName, aYear] = a.name.split(" '");
        const [bMonthName, bYear] = b.name.split(" '");
        
        // Convertir les noms de mois en indices
        const monthIndex = (monthName: string) => monthNames.indexOf(monthName);
        
        const aMonth = monthIndex(aMonthName);
        const bMonth = monthIndex(bMonthName);
        
        // Comparer d'abord par année, puis par mois
        if (aYear !== bYear) {
            return parseInt(aYear) - parseInt(bYear);
        }
        return aMonth - bMonth;
    });
};


const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`${value.toLocaleString('fr-FR')} FCFA`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
        {`(Taux ${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};

const BestSellingProductsCard: React.FC<{ products: { productId: string; productName: string; totalQuantity: number; totalRevenue: number; }[] }> = ({ products }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Produits les Plus Rentables</h3>
        <ul className="space-y-3">
            <li className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400 uppercase px-2">
                <span>Produit</span>
                <div className="flex space-x-4">
                    <span className="w-16 text-right">Quantité</span>
                    <span className="w-24 text-right">Revenu</span>
                </div>
            </li>
            {products.length > 0 ? products.map((p: any) => (
                <li key={p.productId} className="flex justify-between items-center text-sm border-t border-gray-200 dark:border-gray-700 pt-3 px-2">
                    <p className="font-semibold text-gray-700 dark:text-gray-300 truncate pr-2" title={p.productName}>{p.productName}</p>
                    <div className="flex space-x-4 font-mono flex-shrink-0">
                        <span className="w-16 text-right text-gray-700 dark:text-gray-300">{(p.totalQuantity || 0).toLocaleString('fr-FR')}</span>
                        <span className="w-24 text-right font-bold text-primary-600 dark:text-primary-400">{(p.totalRevenue || 0).toLocaleString('fr-FR')}</span>
                    </div>
                </li>
            )) : <p className="text-gray-500 dark:text-gray-400 text-center py-4">Aucune vente pour la période sélectionnée.</p>}
        </ul>
    </div>
);

const InventoryValuationCard: React.FC<{ valuation: { totalRetailValue: number; totalWholesaleValue: number; } }> = ({ valuation }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Valorisation des Stocks</h3>
        <div className="space-y-4 mt-8">
            <div className="flex justify-between items-center p-4 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                <div>
                    <p className="font-semibold text-orange-800 dark:text-orange-200">Valeur au Prix de Détail</p>
                    <p className="text-xs text-orange-600 dark:text-orange-400">Potentiel de revenu</p>
                </div>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-300">{(valuation.totalRetailValue || 0).toLocaleString('fr-FR')} FCFA</p>
            </div>
            <div className="flex justify-between items-center p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                 <div>
                    <p className="font-semibold text-purple-800 dark:text-purple-200">Valeur au Prix de Gros</p>
                    <p className="text-xs text-purple-600 dark:text-purple-400">Coût de l'inventaire</p>
                </div>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-300">{(valuation.totalWholesaleValue || 0).toLocaleString('fr-FR')} FCFA</p>
            </div>
        </div>
    </div>
);

const CustomProfitTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
        <p className="font-bold text-gray-800 dark:text-white">{label}</p>
        <p className="text-sm text-green-600 dark:text-green-400">{`Profit: ${(data.totalProfit || 0).toLocaleString('fr-FR')} FCFA`}</p>
        <p className="text-sm text-gray-600 dark:text-gray-300">{`Quantité Vendue: ${data.totalQuantity || 0}`}</p>
        <p className="text-sm text-purple-600 dark:text-purple-400">{`Prix de Gros: ${(data.wholesalePrice || 0).toLocaleString('fr-FR')} FCFA`}</p>
      </div>
    );
  }
  return null;
};

const ProductProfitChart: React.FC<{ 
    data: { productName: string; totalProfit: number; totalQuantity: number; wholesalePrice: number; }[],
    sortKey: 'totalProfit' | 'totalQuantity',
    setSortKey: (key: 'totalProfit' | 'totalQuantity') => void
}> = ({ data, sortKey, setSortKey }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Analyse de Rentabilité par Produit</h3>
            <div className="flex space-x-2">
                 <button 
                    onClick={() => setSortKey('totalProfit')}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${sortKey === 'totalProfit' ? 'bg-primary-600 text-white font-semibold shadow' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                >
                   Trier par Profit
                </button>
                <button 
                     onClick={() => setSortKey('totalQuantity')}
                     className={`px-3 py-1 text-sm rounded-full transition-colors ${sortKey === 'totalQuantity' ? 'bg-primary-600 text-white font-semibold shadow' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                >
                    Trier par Quantité
                </button>
            </div>
        </div>
        {data.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tick={{ fill: '#6B7280', fontSize: 12 }} />
                    <YAxis type="category" dataKey="productName" width={150} tick={{ fontSize: 12, fill: '#6B7280' }} />
                    <Tooltip content={<CustomProfitTooltip />} cursor={{ fill: 'rgba(239, 246, 255, 0.5)' }}/>
                    <Legend />
                    <Bar dataKey="totalProfit" name="Profit" fill="#22c55e" radius={[0, 4, 4, 0]} />
                </BarChart>
            </ResponsiveContainer>
        ) : (
            <div className="flex items-center justify-center h-48">
                <p className="text-gray-500 dark:text-gray-400">Aucune donnée de profit à afficher pour la période sélectionnée.</p>
            </div>
        )}
    </div>
);


export const Reports: React.FC<ReportsProps> = ({ business, hideFilters = false }) => {
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [activeIndex, setActiveIndex] = useState(0);
    const [profitSortKey, setProfitSortKey] = useState<'totalProfit' | 'totalQuantity'>('totalProfit');
    const [reportView, setReportView] = useState<'summary' | 'details' | 'comparison'>('summary'); // Nouvel état pour la vue des rapports

    // Utiliser useMemo pour s'assurer que les données sont rechargées lorsque l'entreprise change
    const businessData = useMemo(() => ({
        sales: business.sales || [],
        expenses: business.expenses || [],
        products: business.products || [],
        clients: business.clients || []
    }), [business.id, business.sales?.length, business.expenses?.length, business.products?.length, business.clients?.length]);

    const filteredData = useMemo(() => {
        const { start, end } = dateRange;
        const startDate = start ? new Date(start) : null;
        const endDate = end ? new Date(end) : null;

        if (!startDate || !endDate) {
            return { sales: businessData.sales, expenses: businessData.expenses };
        }
        
        // Ajuster les dates pour inclure les extrémités
        // Définir l'heure de début à 00:00:00
        startDate.setHours(0, 0, 0, 0);
        // Définir l'heure de fin à 23:59:59 pour inclure toute la journée
        const adjustedEndDate = new Date(endDate);
        adjustedEndDate.setHours(23, 59, 59, 999);

        const sales = businessData.sales.filter(s => {
            const saleDate = new Date(s.date);
            return saleDate >= startDate && saleDate <= adjustedEndDate;
        });

        const expenses = businessData.expenses.filter(e => {
            const expDate = new Date(e.date);
            return expDate >= startDate && expDate <= adjustedEndDate;
        });

        return { sales, expenses };
    }, [businessData, dateRange]);

    const monthlyChartData = useMemo(() => {
        return processMonthlyData(filteredData.sales, filteredData.expenses);
    }, [filteredData.sales, filteredData.expenses]);

    // Calculer les tendances de vente
    const salesTrends = useMemo(() => {
        // Regrouper les ventes par mois
        const monthlySales: { [key: string]: { month: string; totalSales: number; totalRevenue: number } } = {};
        
        filteredData.sales.forEach(sale => {
            const saleDate = new Date(sale.date);
            const monthKey = `${saleDate.getFullYear()}-${saleDate.getMonth()}`;
            const monthName = saleDate.toLocaleString('fr-FR', { month: 'short', year: 'numeric' });
            
            if (!monthlySales[monthKey]) {
                monthlySales[monthKey] = {
                    month: monthName,
                    totalSales: 0,
                    totalRevenue: 0
                };
            }
            
            monthlySales[monthKey].totalSales += 1;
            monthlySales[monthKey].totalRevenue += sale.total || 0;
        });
        
        // Convertir en tableau et trier par date
        return Object.values(monthlySales).sort((a, b) => {
            // Extraire les informations de date des noms de mois
            const parseMonthYear = (monthStr: string) => {
                const parts = monthStr.split(' ');
                const month = parts[0];
                const year = parts[1];
                const monthIndex = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."]
                    .indexOf(month);
                return new Date(parseInt(year), monthIndex);
            };
            
            return parseMonthYear(a.month).getTime() - parseMonthYear(b.month).getTime();
        });
    }, [filteredData.sales]);

    const expenseByCategory = useMemo(() => {
        const categoryMap: { [key: string]: number } = {};
        filteredData.expenses.forEach(expense => {
            const category = expense.category || 'Non catégorisé';
            categoryMap[category] = (categoryMap[category] || 0) + (expense.amount || 0);
        });
        return Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
    }, [filteredData.expenses]);
    
    const inventoryValuation = useMemo(() => {
        const totalRetailValue = businessData.products.reduce((sum, p) => sum + ((p.stock || 0) * (p.retailPrice || 0)), 0);
        const totalWholesaleValue = businessData.products.reduce((sum, p) => sum + ((p.stock || 0) * (p.wholesalePrice || 0)), 0);
        return { totalRetailValue, totalWholesaleValue };
    }, [businessData.products]);

    const bestSellingProducts = useMemo(() => {
        const productSales: { [key: string]: { productId: string; productName: string; totalQuantity: number; totalRevenue: number } } = {};

        filteredData.sales.forEach(sale => {
            // Vérifier que sale.productId n'est pas null ou undefined
            if (sale.productId && sale.productId !== null) {
                const productId = sale.productId;
                if (!productSales[productId]) {
                    productSales[productId] = {
                        productId: productId,
                        productName: sale.productName || 'Produit inconnu',
                        totalQuantity: 0,
                        totalRevenue: 0,
                    };
                }
                productSales[productId].totalQuantity += sale.quantity || 0;
                productSales[productId].totalRevenue += sale.total || 0;
            }
        });

        // Convert to array and sort by totalRevenue
        return Object.values(productSales)
            .sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0))
            .slice(0, 10); // Top 10 products
    }, [filteredData.sales]);

    // Calcul des profits par produit
    const productProfits = useMemo(() => {
        const profitMap: { [key: string]: { productName: string; totalProfit: number; totalQuantity: number; wholesalePrice: number } } = {};

        // Calculer le coût total des produits achetés
        const productCosts: { [key: string]: number } = {};
        
        filteredData.sales.forEach(sale => {
            // Vérifier que sale.productId n'est pas null ou undefined
            if (sale.productId && sale.productId !== null) {
                const productId = sale.productId;
                if (!productCosts[productId]) {
                    const product = businessData.products.find(p => p.id === productId);
                    productCosts[productId] = product ? product.wholesalePrice : 0;
                }
                
                const cost = (productCosts[productId] || 0) * (sale.quantity || 0);
                const revenue = sale.total || 0;
                const profit = revenue - cost;
                
                if (!profitMap[productId]) {
                    profitMap[productId] = {
                        productName: sale.productName || 'Produit inconnu',
                        totalProfit: 0,
                        totalQuantity: 0,
                        wholesalePrice: productCosts[productId] || 0
                    };
                }
                
                profitMap[productId].totalProfit += profit;
                profitMap[productId].totalQuantity += sale.quantity || 0;
            }
        });

        // Convertir en tableau et trier
        let result = Object.values(profitMap);
        
        if (profitSortKey === 'totalProfit') {
            result = result.sort((a, b) => (b.totalProfit || 0) - (a.totalProfit || 0));
        } else {
            result = result.sort((a, b) => (b.totalQuantity || 0) - (a.totalQuantity || 0));
        }
        
        return result.slice(0, 15); // Top 15 products
    }, [filteredData.sales, businessData.products, profitSortKey]);

    const totalRevenue = useMemo(() => {
        return filteredData.sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
    }, [filteredData.sales]);

    const totalExpenses = useMemo(() => {
        return filteredData.expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    }, [filteredData.expenses]);

    // Calcul du COGS (Coût des marchandises vendues)
    const totalCOGS = useMemo(() => {
        return filteredData.sales.reduce((sum, sale) => {
            if (sale.productId && sale.productId !== null) {
                const product = businessData.products.find(p => p.id === sale.productId);
                const wholesalePrice = product ? product.wholesalePrice : 0;
                return sum + (wholesalePrice * (sale.quantity || 0));
            }
            return sum;
        }, 0);
    }, [filteredData.sales, businessData.products]);

    const totalProfit = useMemo(() => {
        // Profit = Revenus - COGS - Dépenses opérationnelles
        return (totalRevenue || 0) - (totalCOGS || 0) - (totalExpenses || 0);
    }, [totalRevenue, totalCOGS, totalExpenses]);

    const handleDateRangeChange = useCallback((start: string, end: string) => {
        // S'assurer que les dates sont au bon format
        const formattedStart = start ? new Date(start).toISOString().split('T')[0] : '';
        const formattedEnd = end ? new Date(end).toISOString().split('T')[0] : '';
        setDateRange({ start: formattedStart, end: formattedEnd });
    }, []);
    
    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index);
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Rapports - {business.name}</h1>
                <div className="flex items-center space-x-4">
                    <div className="flex bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                        <button 
                            className={`px-4 py-2 text-sm font-medium ${reportView === 'summary' ? 'bg-primary-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            onClick={() => setReportView('summary')}
                        >
                            Résumé
                        </button>
                        <button 
                            className={`px-4 py-2 text-sm font-medium ${reportView === 'details' ? 'bg-primary-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            onClick={() => setReportView('details')}
                        >
                            Détails
                        </button>
                        <button 
                            className={`px-4 py-2 text-sm font-medium ${reportView === 'comparison' ? 'bg-primary-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                            onClick={() => setReportView('comparison')}
                        >
                            Comparaison
                        </button>
                    </div>
                    {!hideFilters && (
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md">
                            <DateFilter onDateRangeChange={handleDateRangeChange} />
                        </div>
                    )}
                </div>
            </div>

            {/* Statistiques récapitulatives */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                    <h3 className="text-lg font-semibold mb-2">Revenu Total</h3>
                    <p className="text-3xl font-bold">{(totalRevenue || 0).toLocaleString('fr-FR')} FCFA</p>
                </div>
                <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
                    <h3 className="text-lg font-semibold mb-2">Dépenses Totales</h3>
                    <p className="text-3xl font-bold">{(totalExpenses || 0).toLocaleString('fr-FR')} FCFA</p>
                </div>
                <div className={`bg-gradient-to-r ${totalProfit >= 0 ? 'from-orange-500 to-orange-600' : 'from-gray-500 to-gray-600'} rounded-xl shadow-lg p-6 text-white`}>
                    <h3 className="text-lg font-semibold mb-2">Profit Net</h3>
                    <p className="text-3xl font-bold">{(totalProfit || 0).toLocaleString('fr-FR')} FCFA</p>
                </div>
            </div>

            {/* Graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Graphique mensuel */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Performance Mensuelle</h3>
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
                        <div className="flex items-center justify-center h-64">
                            <p className="text-gray-500 dark:text-gray-400">Aucune donnée à afficher pour la période sélectionnée.</p>
                        </div>
                    )}
                </div>

                {/* Répartition des dépenses par catégorie */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Répartition des Dépenses</h3>
                    {expenseByCategory.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    activeIndex={activeIndex}
                                    activeShape={renderActiveShape}
                                    data={expenseByCategory}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="name"
                                    onMouseEnter={onPieEnter}
                                >
                                    {expenseByCategory.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `${(value as number).toLocaleString('fr-FR')} FCFA`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-64">
                            <p className="text-gray-500 dark:text-gray-400">Aucune dépense à afficher pour la période sélectionnée.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Produits les plus rentables et valorisation des stocks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <BestSellingProductsCard products={bestSellingProducts} />
                <InventoryValuationCard valuation={inventoryValuation} />
            </div>

            {/* Analyse de rentabilité par produit */}
            <ProductProfitChart 
                data={productProfits} 
                sortKey={profitSortKey} 
                setSortKey={setProfitSortKey} 
            />
        </div>
    );
};