'use client';

import React, { useState, useEffect } from 'react';
import { useWifiSales } from './hooks';
import { SaleForm, WeeklyStatsCard, SalesHistory, PerformanceChart, TicketForm } from './components';
import { Button } from '@/components/shared/Button';
import { Wifi, Plus, Tag, Ticket, BarChart3, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useActiveBusiness } from '@/contexts/ActiveBusinessContext';

// Composant pour le formulaire d'édition de ticket
const EditTicketForm: React.FC<{ 
  ticket: any; 
  onSave: (id: string, name: string, unitPrice: number, stock: number) => void; 
  onCancel: () => void;
}> = ({ ticket, onSave, onCancel }) => {
  const [ticketName, setTicketName] = useState(ticket.name);
  const [unitPrice, setUnitPrice] = useState(ticket.retailPrice.toString());
  const [stock, setStock] = useState(ticket.stock.toString());
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
    
    // Sauvegarder les modifications
    onSave(ticket.id, ticketName, price, stockValue);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Modifier le ticket</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          <div>
            <label htmlFor="editTicketName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nom du ticket
            </label>
            <input
              type="text"
              id="editTicketName"
              value={ticketName}
              onChange={(e) => setTicketName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
              placeholder="Ex: Wi-Fi 1H, Wi-Fi Journée"
            />
          </div>
          
          <div>
            <label htmlFor="editUnitPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Prix unitaire (FCFA)
            </label>
            <input
              type="number"
              id="editUnitPrice"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              min="1"
              step="1"
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
              placeholder="Ex: 500"
            />
          </div>
          
          <div>
            <label htmlFor="editStock" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre de tickets disponibles
            </label>
            <input
              type="number"
              id="editStock"
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
              onClick={onCancel}
              className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-medium py-2.5 px-6 rounded-lg transition-all duration-300"
            >
              Annuler
            </Button>
            <Button 
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Sauvegarder
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Composant pour afficher la liste des tickets disponibles
const TicketList: React.FC<{ 
  tickets: any[]; 
  onEdit: (id: string, name: string, unitPrice: number, stock: number) => void;
  onDelete: (id: string) => void;
}> = ({ tickets, onEdit, onDelete }) => {
  const [ticketToDelete, setTicketToDelete] = useState<string | null>(null);
  const [ticketToEdit, setTicketToEdit] = useState<any | null>(null);

  const handleDelete = (id: string) => {
    onDelete(id);
    setTicketToDelete(null);
  };

  const handleSaveEdit = (id: string, name: string, unitPrice: number, stock: number) => {
    // Pour l'instant, on simule la mise à jour
    console.log('Mise à jour du ticket:', { id, name, unitPrice, stock });
    setTicketToEdit(null);
    // Appeler la fonction d'édition avec les bons paramètres
    onEdit(id, name, unitPrice, stock);
  };

  if (tickets.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <div className="flex items-center mb-4">
          <Ticket className="h-5 w-5 text-blue-500 mr-2" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Tickets disponibles</h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400">Aucun ticket disponible pour le moment.</p>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
          Créez votre premier ticket en cliquant sur le bouton "Créer un ticket".
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <Ticket className="h-5 w-5 text-blue-500 mr-2" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Tickets disponibles</h2>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Nom du ticket
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Prix unitaire
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Stock disponible
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Catégorie
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Ticket className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{ticket.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">{ticket.retailPrice.toLocaleString('fr-FR')} FCFA</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {ticket.stock > 0 ? ticket.stock : 'Illimité'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                    {ticket.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setTicketToEdit(ticket)}
                      className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-150"
                      title="Modifier"
                    >
                      <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </button>
                    <button
                      onClick={() => setTicketToDelete(ticket.id)}
                      className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-150"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirmation de suppression */}
      {ticketToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Confirmer la suppression</h3>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 dark:text-gray-300">
                Êtes-vous sûr de vouloir supprimer ce ticket ? Cette action est irréversible.
              </p>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button 
                  variant="secondary" 
                  onClick={() => setTicketToDelete(null)}
                  className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-medium py-2.5 px-6 rounded-lg transition-all duration-300"
                >
                  Annuler
                </Button>
                <Button 
                  variant="danger"
                  onClick={() => handleDelete(ticketToDelete)}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-6 rounded-lg transition-all duration-300"
                >
                  Supprimer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulaire d'édition */}
      {ticketToEdit && (
        <EditTicketForm 
          ticket={ticketToEdit} 
          onSave={handleSaveEdit} 
          onCancel={() => setTicketToEdit(null)} 
        />
      )}
    </div>
  );
};

const WifiSalesExtension = () => {
  const {
    wifiProducts,
    sales,
    loading,
    error,
    addSale,
    createTicket,
    deleteSale,
    getCurrentWeekStats,
    getWeeklyStats
  } = useWifiSales();
  
  const { currentUser } = useAuth();
  const { activeBusiness } = useActiveBusiness();
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [hasPermission, setHasPermission] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tickets'>('dashboard');

  useEffect(() => {
    // Vérifier si l'utilisateur a la permission d'accéder à cette extension
    if (currentUser && activeBusiness) {
      // Seul l'admin et les utilisateurs assignés peuvent accéder à l'extension
      // Pour cette implémentation, on permet l'accès à tous pour le moment
      // Dans une implémentation complète, on vérifierait les permissions dans la base de données
      setHasPermission(true);
    }
  }, [currentUser, activeBusiness]);

  const currentWeekStats = getCurrentWeekStats();
  const weeklyStats = getWeeklyStats(4); // Obtenir les stats pour les 4 dernières semaines

  // Fonction pour supprimer un ticket (simulation)
  const deleteTicket = (id: string) => {
    console.log('Suppression du ticket:', id);
    // Dans une vraie implémentation, on appellerait une fonction de suppression
  };

  // Fonction pour éditer un ticket (simulation)
  const editTicket = (id: string, name: string, unitPrice: number, stock: number) => {
    console.log('Édition du ticket:', { id, name, unitPrice, stock });
    // Dans une vraie implémentation, on appellerait une fonction de mise à jour
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erreur ! </strong>
          <span className="block sm:inline">Impossible de charger les données de l'extension.</span>
        </div>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="p-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Accès refusé ! </strong>
          <span className="block sm:inline">Vous n'avez pas la permission d'accéder à cette extension.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl mr-4 shadow-lg">
              <Wifi className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Bilan des Ventes Wi-Fi
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Suivez et analysez les ventes de vos tickets Wi-Fi
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => setIsTicketModalOpen(true)}
              className="flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 border border-blue-400 hover:border-blue-300"
            >
              <Tag className="w-4 h-4 mr-2" />
              <span>Créer un ticket</span>
            </button>
            <button 
              onClick={() => setIsSaleModalOpen(true)}
              className="flex items-center px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 border border-orange-400 hover:border-orange-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span>Ajouter une vente</span>
            </button>
          </div>
        </div>
      </div>

      {/* Formulaire de création de ticket dans un modal */}
      <TicketForm 
        onAddTicket={createTicket} 
        isOpen={isTicketModalOpen} 
        onClose={() => setIsTicketModalOpen(false)} 
      />

      {/* Formulaire de vente dans un modal */}
      <SaleForm 
        onAddSale={addSale} 
        isOpen={isSaleModalOpen} 
        onClose={() => setIsSaleModalOpen(false)} 
      />

      {/* Onglets */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'dashboard'
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Tableau de bord
            </div>
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'tickets'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center">
              <Ticket className="h-4 w-4 mr-2" />
              Tickets disponibles
            </div>
          </button>
        </nav>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'dashboard' ? (
        <>
          {/* Statistiques de la semaine en cours */}
          <div className="mb-8">
            <WeeklyStatsCard stats={currentWeekStats} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Historique des ventes */}
            <div>
              <SalesHistory sales={sales} onDeleteSale={deleteSale} />
            </div>

            {/* Graphique de performance */}
            <div>
              <PerformanceChart stats={weeklyStats} />
            </div>
          </div>
        </>
      ) : (
        /* Liste des tickets disponibles */
        <div className="mb-8">
          <TicketList 
            tickets={wifiProducts} 
            onEdit={editTicket}
            onDelete={deleteTicket}
          />
        </div>
      )}
    </div>
  );
};

export default WifiSalesExtension;