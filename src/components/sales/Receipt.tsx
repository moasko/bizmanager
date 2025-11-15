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
    // Vérifier que sale.productId n'est pas null
    if (sale.productId !== null && sale.productId !== undefined) {
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
    }
  });

  return (
    <div>
      <Button 
        onClick={handlePrint} 
        className="flex items-center mb-4"
        variant="secondary"
      >
        <Printer className="h-4 w-4 mr-2" />
        Imprimer le reçu
      </Button>
      
      <div ref={componentRef} className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
        <div className="text-center border-b border-gray-300 pb-4 mb-4">
          <h1 className="text-2xl font-bold text-gray-800">{businessName}</h1>
          <p className="text-gray-600">Reçu de vente</p>
          <p className="text-sm text-gray-500 mt-1">
            Date: {new Date().toLocaleDateString('fr-FR')}
          </p>
          {sales.length > 0 && (
            <p className="text-sm text-gray-500">
              Réf: {sales[0].reference}
            </p>
          )}
        </div>
        
        {client && (
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2 text-gray-800">Informations Client</h2>
            <p className="text-gray-800 font-medium">{client.name}</p>
            {client.telephone && <p className="text-gray-600">Tél: {client.telephone}</p>}
            {client.address && <p className="text-gray-600">Adresse: {client.address}</p>}
            {client.company && <p className="text-gray-600">Entreprise: {client.company}</p>}
          </div>
        )}
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-gray-800">Détails des produits</h2>
          <div className="space-y-3">
            {Object.values(productTotals).map((product, index) => (
              <div key={index} className="flex justify-between items-center border-b border-gray-100 pb-2">
                <div>
                  <p className="font-medium text-gray-800">{product.productName}</p>
                  <p className="text-sm text-gray-500">
                    {product.quantity} x {Math.round(product.total / product.quantity).toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
                <p className="font-medium text-gray-800">
                  {product.total.toLocaleString('fr-FR')} FCFA
                </p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="border-t border-gray-300 pt-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Sous-total:</span>
            <span>{totalAmount.toLocaleString('fr-FR')} FCFA</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Remise:</span>
            <span>0 FCFA</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Taxes:</span>
            <span>0 FCFA</span>
          </div>
          <div className="flex justify-between text-lg font-bold mt-3 pt-3 border-t border-gray-200">
            <span>Total à payer:</span>
            <span className="text-primary-600">{totalAmount.toLocaleString('fr-FR')} FCFA</span>
          </div>
        </div>
        
        <div className="text-center text-sm text-gray-500 mt-8">
          <p>Merci pour votre achat!</p>
          <p className="mt-1">-----------------------------</p>
          <p className="mt-2 text-xs">Service client disponible 24h/24</p>
        </div>
      </div>
    </div>
  );
};