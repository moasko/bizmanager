import React, { useState, useEffect } from 'react';
import { WifiSale } from '../types/wifiSales';
import { Button } from '@/components/shared/Button';
import { Modal } from '@/components/shared/Modal';
import { useWifiSales } from '../hooks/useWifiSales';
import { Plus } from 'lucide-react';

interface SaleFormProps {
  onAddSale: (sale: Omit<WifiSale, 'id' | 'totalAmount' | 'weekNumber' | 'year' | 'saleDate'>) => void;
  isOpen: boolean;
  onClose: () => void;
}

const SaleForm: React.FC<SaleFormProps> = ({ onAddSale, isOpen, onClose }) => {
  const { wifiProducts } = useWifiSales();
  const [selectedTicket, setSelectedTicket] = useState<string>('');
  const [quantitySold, setQuantitySold] = useState('1');
  const [error, setError] = useState<string | null>(null);

  // Effet pour réinitialiser le formulaire lorsque le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setSelectedTicket('');
    setQuantitySold('1');
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validation
    if (!selectedTicket) {
      setError('Veuillez sélectionner un ticket');
      return;
    }
    
    const product = wifiProducts.find(p => p.id === selectedTicket);
    if (!product) {
      setError('Ticket non trouvé');
      return;
    }
    
    const quantity = parseInt(quantitySold);
    
    if (isNaN(quantity) || quantity <= 0) {
      setError('Veuillez entrer une quantité valide');
      return;
    }
    
    // Soumettre la vente
    onAddSale({
      ticketName: product.name,
      unitPrice: product.retailPrice,
      quantitySold: quantity
    });
    
    // Réinitialiser le formulaire et fermer le modal
    resetForm();
    onClose();
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  // Calculer le montant total
  const totalPrice = (() => {
    const product = wifiProducts.find(p => p.id === selectedTicket);
    const price = product ? product.retailPrice : 0;
    const quantity = parseInt(quantitySold) || 0;
    return price * quantity;
  })();

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleCancel} 
      title="Ajouter une vente de ticket Wi-Fi"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <div>
          <label htmlFor="selectedTicket" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sélectionner un ticket
          </label>
          <select
            id="selectedTicket"
            value={selectedTicket}
            onChange={(e) => setSelectedTicket(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
          >
            <option value="">Choisir un ticket...</option>
            {wifiProducts.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} - {product.retailPrice.toLocaleString('fr-FR')} FCFA
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="quantitySold" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Quantité vendue
          </label>
          <input
            type="number"
            id="quantitySold"
            value={quantitySold}
            onChange={(e) => setQuantitySold(e.target.value)}
            min="1"
            step="1"
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
            placeholder="Ex: 10"
          />
        </div>
        
        {/* Affichage du montant total */}
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-5 border border-orange-200 dark:border-gray-600 shadow-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 dark:text-gray-300 font-medium">Montant total:</span>
            <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {totalPrice.toLocaleString('fr-FR')} <span className="text-base">FCFA</span>
            </span>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={handleCancel}
            className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-medium py-2.5 px-6 rounded-lg transition-all duration-300"
          >
            Annuler
          </Button>
          <Button 
            type="submit"
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Enregistrer la vente
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SaleForm;