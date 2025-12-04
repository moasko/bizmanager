"use client";

import React, { useEffect, useRef } from 'react';
import type { Sale, Product } from '@/types';

interface PrintableSalesReportProps {
  sales: Sale[];
  products: Product[];
  businessName: string;
  dateRange: { start: string; end: string };
  onPrintComplete?: () => void;
}

export const PrintableSalesReport: React.FC<PrintableSalesReportProps> = ({ 
  sales, 
  products,
  businessName,
  dateRange,
  onPrintComplete 
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  // Calculer les statistiques de vente
  const totalSales = sales.length;
  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
  
  // Calculer le COGS (Coût des marchandises vendues)
  const totalCOGS = sales.reduce((sum, sale) => {
    const product = products.find(p => p.id === sale.productId);
    const cost = (product?.wholesalePrice || 0) * (sale.quantity || 0);
    return sum + cost;
  }, 0);
  
  const totalProfit = totalRevenue - totalCOGS;

  // Regrouper les ventes par produit
  const salesByProduct: { [key: string]: { 
    product: Product | undefined; 
    quantity: number; 
    revenue: number;
    cost: number;
    profit: number;
  } } = {};

  sales.forEach(sale => {
    const productId = sale.productId || '';
    if (!salesByProduct[productId]) {
      const product = products.find(p => p.id === productId);
      salesByProduct[productId] = {
        product,
        quantity: 0,
        revenue: 0,
        cost: 0,
        profit: 0
      };
    }
    
    const productData = salesByProduct[productId];
    const quantity = sale.quantity || 0;
    const revenue = sale.total || 0;
    const costPrice = productData.product ? (productData.product.costPrice > 0 ? productData.product.costPrice : productData.product.wholesalePrice) : 0;
    const cost = costPrice * quantity;
    const profit = revenue - cost;
    
    productData.quantity += quantity;
    productData.revenue += revenue;
    productData.cost += cost;
    productData.profit += profit;
  });

  // Convertir en tableau et trier par revenu
  const sortedSalesByProduct = Object.values(salesByProduct)
    .filter(item => item.quantity > 0)
    .sort((a, b) => b.revenue - a.revenue);

  // Regrouper les ventes par date
  const salesByDate: { [key: string]: { 
    date: string; 
    salesCount: number; 
    revenue: number;
  } } = {};

  sales.forEach(sale => {
    const saleDate = new Date(sale.date).toLocaleDateString('fr-FR');
    if (!salesByDate[saleDate]) {
      salesByDate[saleDate] = {
        date: saleDate,
        salesCount: 0,
        revenue: 0
      };
    }
    
    salesByDate[saleDate].salesCount += 1;
    salesByDate[saleDate].revenue += sale.total || 0;
  });

  // Convertir en tableau et trier par date
  const sortedSalesByDate = Object.values(salesByDate)
    .sort((a, b) => {
      const dateA = new Date(a.date.split('/').reverse().join('-'));
      const dateB = new Date(b.date.split('/').reverse().join('-'));
      return dateA.getTime() - dateB.getTime();
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
        <div className="report-title">RAPPORT DE VENTES</div>
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

      {/* Résumé des ventes */}
      <div className="summary-box">
        <div className="summary-grid">
          <div className="summary-item">
            <div className="summary-value">{totalSales}</div>
            <div className="summary-label">Ventes</div>
          </div>
          <div className="summary-item">
            <div className="summary-value">{totalRevenue.toLocaleString('fr-FR')} FCFA</div>
            <div className="summary-label">Revenus</div>
          </div>
          <div className="summary-item">
            <div className="summary-value">{totalCOGS.toLocaleString('fr-FR')} FCFA</div>
            <div className="summary-label">Coût des marchandises</div>
          </div>
          <div className="summary-item">
            <div className={`summary-value ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalProfit.toLocaleString('fr-FR')} FCFA
            </div>
            <div className="summary-label">Profit</div>
          </div>
        </div>
      </div>

      {/* Ventes par produit */}
      <div className="category-header">Ventes par Produit</div>
      <table>
        <thead>
          <tr>
            <th>Produit</th>
            <th className="text-center">Quantité vendue</th>
            <th className="text-right">Revenus</th>
            <th className="text-right">Coût</th>
            <th className="text-right">Profit</th>
            <th className="text-right">Marge (%)</th>
          </tr>
        </thead>
        <tbody>
          {sortedSalesByProduct.map((item, index) => {
            const margin = item.revenue > 0 ? (item.profit / item.revenue) * 100 : 0;
            
            return (
              <tr key={index}>
                <td>{item.product?.name || 'Produit inconnu'}</td>
                <td className="text-center">{item.quantity.toLocaleString('fr-FR')}</td>
                <td className="text-right">{item.revenue.toLocaleString('fr-FR')} FCFA</td>
                <td className="text-right">{item.cost.toLocaleString('fr-FR')} FCFA</td>
                <td className={`text-right ${item.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {item.profit.toLocaleString('fr-FR')} FCFA
                </td>
                <td className="text-right">{margin.toFixed(1)}%</td>
              </tr>
            );
          })}
          {/* Total général */}
          <tr style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold' }}>
            <td colSpan={2}>TOTAL</td>
            <td className="text-right">
              {sortedSalesByProduct.reduce((sum, item) => sum + item.revenue, 0).toLocaleString('fr-FR')} FCFA
            </td>
            <td className="text-right">
              {sortedSalesByProduct.reduce((sum, item) => sum + item.cost, 0).toLocaleString('fr-FR')} FCFA
            </td>
            <td className={`text-right ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalProfit.toLocaleString('fr-FR')} FCFA
            </td>
            <td className="text-right">
              {totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0.0'}%
            </td>
          </tr>
        </tbody>
      </table>

      {/* Ventes par date */}
      <div className="category-header page-break">Ventes par Date</div>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th className="text-center">Nombre de ventes</th>
            <th className="text-right">Revenus</th>
          </tr>
        </thead>
        <tbody>
          {sortedSalesByDate.map((item, index) => (
            <tr key={index}>
              <td>{item.date}</td>
              <td className="text-center">{item.salesCount.toLocaleString('fr-FR')}</td>
              <td className="text-right">{item.revenue.toLocaleString('fr-FR')} FCFA</td>
            </tr>
          ))}
          {/* Total général */}
          <tr style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold' }}>
            <td>TOTAL</td>
            <td className="text-center">
              {sortedSalesByDate.reduce((sum, item) => sum + item.salesCount, 0).toLocaleString('fr-FR')}
            </td>
            <td className="text-right">
              {sortedSalesByDate.reduce((sum, item) => sum + item.revenue, 0).toLocaleString('fr-FR')} FCFA
            </td>
          </tr>
        </tbody>
      </table>

      {/* Pied de page */}
      <div className="footer">
        Rapport généré par BizManager - Système de gestion d'entreprise
      </div>
    </div>
  );
};