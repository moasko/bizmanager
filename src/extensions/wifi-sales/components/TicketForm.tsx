import React, { useState } from 'react';
import { Button } from '@/components/shared/Button';
import { Modal } from '@/components/shared/Modal';
import { Tag } from 'lucide-react';

interface TicketFormProps {
  onAddTicket: (name: string, unitPrice: number, stock: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

const TicketForm: React.FC<TicketFormProps> = ({ onAddTicket, isOpen, onClose }) => {
  const [ticketName, setTicketName] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [stock, setStock] = useState('100'); // Valeur par défaut
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validation
    if (!ticketName || ticketName.trim() === '') {
      setError('Veuillez entrer le nom du ticket');
      return;
    }
    
    const price = parseFloat(unitPrice);
    
    if (isNaN(price) || price <= 0) {
      setError('Veuillez entrer un prix unitaire valide');
      return;
    }
    
    const stockValue = parseInt(stock);
    
    if (isNaN(stockValue) || stockValue < 0) {
      setError('Veuillez entrer un nombre de tickets valide');
      return;
    }
    
    // Soumettre le ticket
    onAddTicket(ticketName, price, stockValue);
    
    // Réinitialiser le formulaire et fermer le modal
    setTicketName('');
    setUnitPrice('');
    setStock('100');
    onClose();
  };

  const handleCancel = () => {
    setTicketName('');
    setUnitPrice('');
    setStock('100');
    setError(null);
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleCancel} 
      title="Créer un nouveau ticket Wi-Fi"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <div>
          <label htmlFor="ticketName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nom/Titre du ticket
          </label>
          <input
            type="text"
            id="ticketName"
            value={ticketName}
            onChange={(e) => setTicketName(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
            placeholder="Ex: Wi-Fi 1H, Wi-Fi Journée"
          />
        </div>
        
        <div>
          <label htmlFor="unitPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Prix unitaire (FCFA)
          </label>
          <input
            type="number"
            id="unitPrice"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
            min="1"
            step="1"
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
            placeholder="Ex: 500"
          />
        </div>
        
        <div>
          <label htmlFor="stock" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nombre de tickets disponibles
          </label>
          <input
            type="number"
            id="stock"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            min="0"
            step="1"
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
            placeholder="Ex: 100"
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Entrez 0 pour un stock illimité
          </p>
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
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 flex items-center"
          >
            <Tag className="w-4 h-4 mr-2" />
            Créer le ticket
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TicketForm;