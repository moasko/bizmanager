"use client";

import React, { useEffect, useRef } from 'react';
import type { Sale, Expense, Product } from '@/types';

interface PrintableFinancialReportProps {
  sales: Sale[];
  expenses: Expense[];
  products: Product[];
  businessName: string;
  dateRange: { start: string; end: string };
  onPrintComplete?: () => void;
}

export const PrintableFinancialReport: React.FC<PrintableFinancialReportProps> = ({ 
  sales, 
  expenses,
  products,
  businessName,
  dateRange,
  onPrintComplete 
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  // Calculer les statistiques financières
  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
  
  // Calculer le COGS (Coût des marchandises vendues)
  const totalCOGS = sales.reduce((sum, sale) => {
    const product = products.find(p => p.id === sale.productId);
    const costPrice = product ? (product.costPrice > 0 ? product.costPrice : product.wholesalePrice) : 0;
    const cost = costPrice * (sale.quantity || 0);
    return sum + cost;
  }, 0);
  
  const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const grossProfit = totalRevenue - totalCOGS;
  const netProfit = grossProfit - totalExpenses;

  // Regrouper les dépenses par catégorie
  const expensesByCategory: { [key: string]: { 
    category: string; 
    amount: number;
  } } = {};

  expenses.forEach(expense => {
    const category = expense.category || 'Non catégorisé';
    if (!expensesByCategory[category]) {
      expensesByCategory[category] = {
        category,
        amount: 0
      };
    }
    
    expensesByCategory[category].amount += expense.amount || 0;
  });

  // Convertir en tableau et trier par montant
  const sortedExpensesByCategory = Object.values(expensesByCategory)
    .sort((a, b) => b.amount - a.amount);

  // Regrouper les revenus par mois
  const revenueByMonth: { [key: string]: { 
    month: string; 
    revenue: number;
    expenses: number;
  } } = {};

  // Ajouter les ventes
  sales.forEach(sale => {
    const saleDate = new Date(sale.date);
    const monthKey = `${saleDate.getFullYear()}-${saleDate.getMonth()}`;
    const monthName = saleDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    
    if (!revenueByMonth[monthKey]) {
      revenueByMonth[monthKey] = {
        month: monthName,
        revenue: 0,
        expenses: 0
      };
    }
    
    revenueByMonth[monthKey].revenue += sale.total || 0;
  });

  // Ajouter les dépenses
  expenses.forEach(expense => {
    const expenseDate = new Date(expense.date);
    const monthKey = `${expenseDate.getFullYear()}-${expenseDate.getMonth()}`;
    const monthName = expenseDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    
    if (!revenueByMonth[monthKey]) {
      revenueByMonth[monthKey] = {
        month: monthName,
        revenue: 0,
        expenses: 0
      };
    }
    
    revenueByMonth[monthKey].expenses += expense.amount || 0;
  });

  // Convertir en tableau et trier par date
  const sortedRevenueByMonth = Object.values(revenueByMonth)
    .sort((a, b) => {
      // Extraire les informations de date des noms de mois
      const parseMonthYear = (monthStr: string) => {
        const parts = monthStr.split(' ');
        const month = parts[0];
        const year = parts[1];
        const monthIndex = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"]
          .indexOf(month);
        return new Date(parseInt(year), monthIndex);
      };
      
      return parseMonthYear(a.month).getTime() - parseMonthYear(b.month).getTime();
    });

  // Imprimer automatiquement quand le composant est monté
  useEffect(() => {
    const handlePrint = () => {
      const printContent = printRef.current;
      if (printContent) {
        const originalContents = document.body.innerHTML;
        document.body.innerHTML = printContent.innerHTML;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload(); // Recharger la page après l'impression
        
        if (onPrintComplete) {
          onPrintComplete();
        }
      }
    };

    // Attendre un peu que le contenu soit rendu
    const timer = setTimeout(handlePrint, 500);
    return () => clearTimeout(timer);
  }, [onPrintComplete]);

  // Formatage de la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // Formatage de la période
  const formatPeriod = () => {
    if (!dateRange.start && !dateRange.end) {
      return "Toutes les périodes";
    }
    
    if (dateRange.start && dateRange.end) {
      return `Du ${formatDate(dateRange.start)} au ${formatDate(dateRange.end)}`;
    }
    
    if (dateRange.start) {
      return `À partir du ${formatDate(dateRange.start)}`;
    }
    
    return `Jusqu'au ${formatDate(dateRange.end)}`;
  };

  return (
    <div ref={printRef} className="print-container p-8 max-w-4xl mx-auto">
      {/* Styles pour l'impression */}
      <style>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .print-container {
            font-size: 12px;
            line-height: 1.4;
            color: #000;
          }
          
          .no-print {
            display: none !important;
          }
          
          .page-break {
            page-break-before: always;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          
          th, td {
            border: 1px solid #000;
            padding: 6px 8px;
            text-align: left;
          }
          
          th {
            background-color: #f0f0f0;
            font-weight: bold;
          }
          
          .text-right {
            text-align: right;
          }
          
          .text-center {
            text-align: center;
          }
          
          .header-section {
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          
          .footer {
            margin-top: 30px;
            text-align: center;
            font-style: italic;
            font-size: 10px;
          }
        }
        
        /* Styles pour l'aperçu */
        .print-container {
          font-family: Arial, sans-serif;
        }
        
        .header-section {
          border-bottom: 2px solid #333;
          padding-bottom: 15px;
          margin-bottom: 25px;
        }
        
        .report-title {
          font-size: 24px;
          font-weight: bold;
          text-align: center;
          margin-bottom: 5px;
        }
        
        .report-subtitle {
          font-size: 16px;
          text-align: center;
          color: #666;
          margin-bottom: 15px;
        }
        
        .report-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        
        .info-item {
          font-size: 14px;
        }
        
        .summary-box {
          background-color: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          padding: 15px;
          margin-bottom: 20px;
        }
        
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
        }
        
        .summary-item {
          text-align: center;
        }
        
        .summary-value {
          font-size: 20px;
          font-weight: bold;
          color: #007bff;
        }
        
        .summary-label {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
        }
        
        .financial-summary {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .financial-card {
          border: 1px solid #dee2e6;
          border-radius: 4px;
          padding: 15px;
        }
        
        .financial-card.positive {
          border-left: 4px solid #28a745;
        }
        
        .financial-card.negative {
          border-left: 4px solid #dc3545;
        }
        
        .financial-card.neutral {
          border-left: 4px solid #6c757d;
        }
        
        .financial-amount {
          font-size: 24px;
          font-weight: bold;
          margin: 10px 0;
        }
        
        .positive .financial-amount {
          color: #28a745;
        }
        
        .negative .financial-amount {
          color: #dc3545;
        }
        
        .neutral .financial-amount {
          color: #6c757d;
        }
        
        .category-header {
          background-color: #e9ecef;
          font-weight: bold;
          padding: 8px 12px;
          margin: 20px 0 10px 0;
          border-radius: 4px;
        }
        
        .footer {
          margin-top: 30px;
          text-align: center;
          font-style: italic;
          font-size: 12px;
          color: #666;
        }
      `}</style>

      {/* En-tête du rapport */}
      <div className="header-section">
        <div className="report-title">RAPPORT FINANCIER</div>
        <div className="report-subtitle">{businessName}</div>
        
        <div className="report-info">
          <div className="info-item">
            <strong>Date du rapport:</strong> {formatDate(new Date().toISOString())}
          </div>
          <div className="info-item">
            <strong>Période:</strong> {formatPeriod()}
          </div>
        </div>
      </div>

      {/* Résumé financier */}
      <div className="financial-summary">
        <div className="financial-card positive">
          <div className="summary-label">Revenus totaux</div>
          <div className="financial-amount">{totalRevenue.toLocaleString('fr-FR')} FCFA</div>
          <div className="text-sm text-gray-600">Ventes</div>
        </div>
        
        <div className="financial-card neutral">
          <div className="summary-label">Coût des marchandises</div>
          <div className="financial-amount">{totalCOGS.toLocaleString('fr-FR')} FCFA</div>
          <div className="text-sm text-gray-600">Coût d'achat</div>
        </div>
        
        <div className="financial-card negative">
          <div className="summary-label">Dépenses totales</div>
          <div className="financial-amount">{totalExpenses.toLocaleString('fr-FR')} FCFA</div>
          <div className="text-sm text-gray-600">Opérationnelles</div>
        </div>
        
        <div className={`financial-card ${netProfit >= 0 ? 'positive' : 'negative'}`}>
          <div className="summary-label">Profit net</div>
          <div className="financial-amount">{netProfit.toLocaleString('fr-FR')} FCFA</div>
          <div className="text-sm text-gray-600">Après toutes dépenses</div>
        </div>
      </div>

      {/* Répartition des dépenses par catégorie */}
      <div className="category-header">Dépenses par Catégorie</div>
      <table>
        <thead>
          <tr>
            <th>Catégorie</th>
            <th className="text-right">Montant</th>
            <th className="text-right">Pourcentage</th>
          </tr>
        </thead>
        <tbody>
          {sortedExpensesByCategory.map((item, index) => {
            const percentage = totalExpenses > 0 ? (item.amount / totalExpenses) * 100 : 0;
            
            return (
              <tr key={index}>
                <td>{item.category}</td>
                <td className="text-right">{item.amount.toLocaleString('fr-FR')} FCFA</td>
                <td className="text-right">{percentage.toFixed(1)}%</td>
              </tr>
            );
          })}
          {/* Total général */}
          <tr style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold' }}>
            <td>TOTAL DÉPENSES</td>
            <td className="text-right">{totalExpenses.toLocaleString('fr-FR')} FCFA</td>
            <td className="text-right">100%</td>
          </tr>
        </tbody>
      </table>

      {/* Performance mensuelle */}
      <div className="category-header page-break">Performance Mensuelle</div>
      <table>
        <thead>
          <tr>
            <th>Mois</th>
            <th className="text-right">Revenus</th>
            <th className="text-right">Dépenses</th>
            <th className="text-right">Profit brut</th>
            <th className="text-right">Profit net</th>
          </tr>
        </thead>
        <tbody>
          {sortedRevenueByMonth.map((item, index) => {
            const gross = item.revenue - totalCOGS * (item.revenue / totalRevenue || 0);
            const net = gross - item.expenses;
            
            return (
              <tr key={index}>
                <td>{item.month}</td>
                <td className="text-right">{item.revenue.toLocaleString('fr-FR')} FCFA</td>
                <td className="text-right">{item.expenses.toLocaleString('fr-FR')} FCFA</td>
                <td className="text-right">{gross.toLocaleString('fr-FR')} FCFA</td>
                <td className={`text-right ${net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {net.toLocaleString('fr-FR')} FCFA
                </td>
              </tr>
            );
          })}
          {/* Total général */}
          <tr style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold' }}>
            <td>TOTAL</td>
            <td className="text-right">{totalRevenue.toLocaleString('fr-FR')} FCFA</td>
            <td className="text-right">{totalExpenses.toLocaleString('fr-FR')} FCFA</td>
            <td className="text-right">{grossProfit.toLocaleString('fr-FR')} FCFA</td>
            <td className={`text-right ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {netProfit.toLocaleString('fr-FR')} FCFA
            </td>
          </tr>
        </tbody>
      </table>

      {/* Ratio de rentabilité */}
      <div className="category-header">Indicateurs de Rentabilité</div>
      <div className="summary-box">
        <div className="summary-grid">
          <div className="summary-item">
            <div className="summary-value">{totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0.0'}%</div>
            <div className="summary-label">Marge brute</div>
          </div>
          <div className="summary-item">
            <div className="summary-value">{totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0.0'}%</div>
            <div className="summary-label">Marge nette</div>
          </div>
          <div className="summary-item">
            <div className="summary-value">{totalExpenses > 0 ? ((totalRevenue / totalExpenses) * 100).toFixed(1) : '0.0'}%</div>
            <div className="summary-label">Ratio revenus/dépenses</div>
          </div>
          <div className="summary-item">
            <div className="summary-value">{sales.length > 0 ? (totalRevenue / sales.length).toLocaleString('fr-FR') : '0'} FCFA</div>
            <div className="summary-label">Ticket moyen</div>
          </div>
        </div>
      </div>

      {/* Pied de page */}
      <div className="footer">
        Rapport généré par BizManager - Système de gestion d'entreprise
      </div>
    </div>
  );
};