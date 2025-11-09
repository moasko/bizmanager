"use client";

import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import type { Sale, Client, Product } from '@/types';
import { Button } from '@/components/shared/Button';
import { Printer } from 'lucide-react';

interface ReceiptProps {
  sales: Sale[];
  client: Client | null;
  products: Product[];
  businessName: string;
}

export const Receipt: React.FC<ReceiptProps> = ({ sales, client, products, businessName }) => {
  const componentRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Reçu_${new Date().toISOString().split('T')[0]}_${client?.name || 'Client'}`,
  });

  // Calcul du total
  const totalAmount = sales.reduce((sum, sale) => sum + sale.total, 0);
  
  // Calcul des totaux par produit
  const productTotals: Record<string, { quantity: number; total: number; productName: string }> = {};
  
  sales.forEach(sale => {
    if (productTotals[sale.productId]) {
      productTotals[sale.productId].quantity += sale.quantity;
      productTotals[sale.productId].total += sale.total;
    } else {
      productTotals[sale.productId] = {
        quantity: sale.quantity,
        total: sale.total,
        productName: sale.productName
      };
    }
  });

  return (
    <div>
      <Button 
        onClick={handlePrint} 
        className="flex items-center"
        variant="secondary"
      >
        <Printer className="h-4 w-4 mr-2" />
        Imprimer le reçu
      </Button>
      
      <div ref={componentRef} className="hidden">
        <div className="p-8 max-w-md mx-auto bg-white">
          <div className="text-center border-b border-gray-300 pb-4 mb-4">
            <h1 className="text-2xl font-bold">{businessName}</h1>
            <p className="text-gray-600">Reçu de vente</p>
            <p className="text-sm text-gray-500 mt-1">
              Date: {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>
          
          {client && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Client</h2>
              <p className="text-gray-800">{client.name}</p>
              {client.telephone && <p className="text-gray-600">Tél: {client.telephone}</p>}
              {client.address && <p className="text-gray-600">Adresse: {client.address}</p>}
            </div>
          )}
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Détails des produits</h2>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-2">Produit</th>
                  <th className="text-right py-2">Qté</th>
                  <th className="text-right py-2">Prix</th>
                  <th className="text-right py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(productTotals).map((product, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-2">{product.productName}</td>
                    <td className="text-right py-2">{product.quantity}</td>
                    <td className="text-right py-2">
                      {Math.round(product.total / product.quantity).toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="text-right py-2 font-medium">
                      {product.total.toLocaleString('fr-FR')} FCFA
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="border-t border-gray-300 pt-4 mb-6">
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>{totalAmount.toLocaleString('fr-FR')} FCFA</span>
            </div>
          </div>
          
          <div className="text-center text-sm text-gray-500 mt-8">
            <p>Merci pour votre achat!</p>
            <p className="mt-1">-----------------------------</p>
          </div>
        </div>
      </div>
    </div>
  );
};