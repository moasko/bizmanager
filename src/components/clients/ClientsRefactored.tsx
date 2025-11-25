"use client";

import React, { useState, useMemo } from 'react';
import type { Business, Client, Sale } from '@/types';
import { Button } from '../shared/Button';
import { Modal } from '../shared/Modal';
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from '@/hooks/useClient';
import { useClientPayments } from '@/hooks/usePayment';
import { useSales } from '@/hooks/useSale';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, Mail, MapPin, Building, CreditCard, Calendar, Star, ArrowUpDown, Filter } from 'lucide-react';

interface ClientsProps {
    business: Business;
    onAddClient: (newClient: Client) => void;
    onRecordPayment: (clientId: string, amount: number, paymentMethod?: string) => void;
}

export const ClientsRefactored: React.FC<ClientsProps> = ({ business, onAddClient, onRecordPayment }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isClientDetailOpen, setIsClientDetailOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Client; direction: 'asc' | 'desc' } | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [formData, setFormData] = useState<Omit<Client, 'id' | 'businessId' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'loyaltyPoints' | 'lastPurchaseDate' | 'notes'>>({ 
    name: '', 
    contact: '',
    telephone: '',
    balance: 0,
    email: '',
    address: '',
    company: '',
  });

  // Utiliser useMemo pour s'assurer que les données sont rechargées lorsque l'entreprise change
  const businessId = useMemo(() => business.id, [business.id]);
  
  const { data: clients = [], isLoading } = useClients(businessId);
  const { data: sales = [], isLoading: salesLoading } = useSales(businessId);
  const { data: payments = [], isLoading: paymentsLoading } = useClientPayments(selectedClient?.id || '');
  const createClientMutation = useCreateClient();
  const updateClientMutation = useUpdateClient();
  const deleteClientMutation = useDeleteClient();
  
  // Fonction pour convertir un client du format API vers le format Client
  const convertClient = (client: any): Client => {
    return {
      ...client,
      createdAt: client.createdAt instanceof Date ? client.createdAt.toISOString() : client.createdAt,
      updatedAt: client.updatedAt instanceof Date ? client.updatedAt.toISOString() : client.updatedAt,
      deletedAt: client.deletedAt ? (client.deletedAt instanceof Date ? client.deletedAt.toISOString() : client.deletedAt) : null,
      lastPurchaseDate: client.lastPurchaseDate ? 
        (client.lastPurchaseDate instanceof Date ? client.lastPurchaseDate.toISOString() : client.lastPurchaseDate) : 
        null
    };
  };

  // Fonction pour recalculer le solde client comme somme cumulée des achats
  const calculateClientBalance = (clientId: string) => {
    // Filtrer les ventes pour ce client spécifique
    const clientSales = sales.filter(sale => sale.clientId === clientId);
    
    // Calculer la somme totale des achats
    const totalPurchases = clientSales.reduce((sum, sale) => sum + sale.total, 0);
    
    return totalPurchases;
  };
  
  // Recalculer les soldes pour tous les clients
  const clientsWithUpdatedBalances = useMemo(() => {
    return clients.map(client => {
      const updatedBalance = calculateClientBalance(client.id);
      return {
        ...client,
        balance: updatedBalance
      };
    });
  }, [clients, sales]);
  
  // Filtrer et trier les clients
  const filteredAndSortedClients = useMemo(() => {
    // Convertir les clients pour qu'ils correspondent au type Client
    const convertedClients = clientsWithUpdatedBalances.map(convertClient);

    let filtered = convertedClients.filter(client => 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        // Vérifier que sortConfig n'est pas null
        if (!sortConfig) return 0;
        
        const key = sortConfig.key;
        const aValue = a[key];
        const bValue = b[key];
        
        // Gérer les valeurs null ou undefined
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return sortConfig.direction === 'asc' ? 1 : -1;
        if (bValue == null) return sortConfig.direction === 'asc' ? -1 : 1;
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [clientsWithUpdatedBalances, searchTerm, sortConfig]);

    const handleOpenModal = () => {
        setFormData({ 
            name: '', 
            contact: '',
            telephone: '',
            balance: 0,
            email: '',
            address: '',
            company: '',
        });
        setIsModalOpen(true);
    };

    const handleOpenPaymentModal = (clientId: string) => {
        setSelectedClientId(clientId);
        setPaymentAmount(0);
        setIsPaymentModalOpen(true);
    };

    const handleOpenClientDetail = (client: Client) => {
        setSelectedClient(client);
        setIsClientDetailOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleClosePaymentModal = () => {
        setIsPaymentModalOpen(false);
        setSelectedClientId('');
        setPaymentAmount(0);
    };

    const handleCloseClientDetail = () => {
        setIsClientDetailOpen(false);
        setSelectedClient(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPaymentAmount(Number(e.target.value));
    };

    const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setPaymentMethod(e.target.value);
    };

    const handleSort = (key: keyof Client) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Fonction pour calculer le solde total des clients
    const calculateTotalBalance = () => {
        return clientsWithUpdatedBalances.reduce((total, client: any) => total + (client.balance || 0), 0);
    };

    // Fonction pour obtenir la couleur du solde
    const getBalanceColor = (balance: number) => {
        if (balance < 0) return 'text-red-600';
        if (balance > 0) return 'text-green-600';
        return 'text-gray-600';
    };

    // Fonction pour formater le solde
    const formatBalance = (balance: number) => {
        const absBalance = Math.abs(balance);
        const sign = balance < 0 ? '-' : '';
        return `${sign}${absBalance.toLocaleString('fr-FR')} FCFA`;
    };

    // Fonction pour formater une date
    const formatDate = (dateString: string | Date | undefined | null) => {
        if (!dateString) return 'N/A';
        // Si c'est déjà un objet Date, on le convertit directement
        if (dateString instanceof Date) {
            return dateString.toLocaleDateString('fr-FR');
        }
        // Sinon, on traite comme une chaîne
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Create new client with all required fields
        const clientData: any = {
            ...formData,
            businessId: business.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            // Champs optionnels avec valeurs par défaut
            loyaltyPoints: 0,
            lastPurchaseDate: undefined,
            notes: undefined
        };
        
        // Create new client with initial balance of 0
        await createClientMutation.mutateAsync({ 
            businessId: business.id, 
            data: clientData
        });
        
        handleCloseModal();
    };

    const handlePaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Passer la méthode de paiement en plus du montant
        onRecordPayment(selectedClientId, paymentAmount, paymentMethod);
        handleClosePaymentModal();
    };

    const handleOpenEditModal = (client: Client) => {
        setFormData({
            name: client.name,
            contact: client.contact,
            telephone: client.telephone || '',
            balance: client.balance,
            email: client.email || '',
            address: client.address || '',
            company: client.company || '',
        });
        setSelectedClient(client);
        setIsEditModalOpen(true);
    };
    
    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedClient(null);
    };
    
    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedClient) return;
        
        try {
            await updateClientMutation.mutateAsync({
                id: selectedClient.id,
                data: {
                    name: formData.name,
                    contact: formData.contact,
                    telephone: formData.telephone || null,
                    balance: formData.balance,
                    email: formData.email || null,
                    address: formData.address || null,
                    company: formData.company || null,
                }
            });
            
            handleCloseEditModal();
        } catch (error) {
            console.error('Error updating client:', error);
            alert('Erreur lors de la mise à jour du client');
        }
    };
    
    const handleDeleteClient = async (clientId: string) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible.')) {
            try {
                await deleteClientMutation.mutateAsync(clientId);
            } catch (error) {
                console.error('Error deleting client:', error);
                alert('Erreur lors de la suppression du client');
            }
        }
    };
    
    if (isLoading) {
        return (
            <div className="flex w-full h-screen flex-col justify-center items-center space-y-4">
                <div className="flex items-center space-x-4 p-6">
                    <div className="relative">
                        <div className="w-12 h-12 border-4 border-orange-200 rounded-full"></div>
                        <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                    </div>
                    <div className="space-y-2">
                        <p className="font-semibold text-gray-800">Clients</p>
                        <p className="text-sm text-gray-600 animate-pulse">Chargement en cours...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 p-4 md:p-8">
        {/* En-tête avec recherche et statistiques */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                Clients
              </h1>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="bg-white rounded-xl p-4 shadow-md">
                <p className="text-gray-600 text-sm">Total Clients</p>
                <p className="text-2xl font-bold text-orange-600">{clients.length}</p>
              </div>
           
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher un client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl py-3 px-4 pl-12 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-sm"
                />
                <svg 
                  className="absolute left-4 top-3.5 h-5 w-5 text-gray-500" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="bg-white rounded-xl p-4 shadow-md">
                <p className="text-gray-600 text-sm">Total Clients</p>
                <p className="text-2xl font-bold text-orange-600">{clients.length}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-md">
                <p className="text-gray-600 text-sm">Total des Soldes</p>
                <p className="text-2xl font-bold text-orange-600">{calculateTotalBalance().toLocaleString('fr-FR')} FCFA</p>
              </div>
            </div>
            <Button 
              onClick={handleOpenModal}
              className="bg-orange-600 text-xs hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md"
            >
              <svg 
                className="w-5 h-5 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Nouveau Client
            </Button>
          </div>
        </div>

        {/* Liste des clients en grille */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          <AnimatePresence>
            {filteredAndSortedClients.map((client) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100 hover:border-orange-200"
                onClick={() => handleOpenClientDetail(convertClient(client))}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="bg-orange-100 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                      <User className="text-orange-600" size={20} />
                    </div>
                    <div className="ml-3 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate text-sm">{client.name}</h3>
                      <p className="text-gray-500 text-xs truncate">{client.contact}</p>
                    </div>
                  </div>
                  <div className="flex items-center bg-gray-100 px-1.5 py-0.5 rounded-full">
                    <Star className="text-amber-500 mr-0.5" size={12} />
                    <span className="text-xs text-gray-700">{client.loyaltyPoints || 0}</span>
                  </div>
                </div>
                
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center text-gray-500 text-xs">
                    <Building className="mr-1.5" size={12} />
                    <span className="truncate">{client.company || 'N/A'}</span>
                  </div>
                  <div className="flex items-center text-gray-500 text-xs">
                    <Phone className="mr-1.5" size={12} />
                    <span className="truncate">{client.telephone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                    <div>
                      <p className="text-gray-500 text-xs">Solde</p>
                      <p className={`font-semibold text-sm ${getBalanceColor(client.balance)}`}>
                        {formatBalance(client.balance)}
                      </p>
                    </div>
                    <div className="flex space-x-1">
                      <Button 
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditModal(convertClient(client));
                        }}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs py-1 px-2 rounded-md transition-colors duration-150"
                      >
                        Éditer
                      </Button>
                      <Button 
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClient(client.id);
                        }}
                        className="bg-red-50 hover:bg-red-100 text-red-700 text-xs py-1 px-2 rounded-md transition-colors duration-150"
                      >
                        Suppr.
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Modal pour ajouter un client */}
        <Modal 
            isOpen={isModalOpen} 
            onClose={handleCloseModal} 
            title="Ajouter un Client"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-sm"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-2">Contact</label>
                        <input
                            type="text"
                            id="contact"
                            name="contact"
                            value={formData.contact}
                            onChange={handleChange}
                            className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-sm"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                        <input
                            type="text"
                            id="telephone"
                            name="telephone"
                            value={formData.telephone || ''}
                            onChange={handleChange}
                            className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email || ''}
                            onChange={handleChange}
                            className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-sm"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                        <input
                            type="text"
                            id="address"
                            name="address"
                            value={formData.address || ''}
                            onChange={handleChange}
                            className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">Entreprise</label>
                        <input
                            type="text"
                            id="company"
                            name="company"
                            value={formData.company || ''}
                            onChange={handleChange}
                            className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-sm"
                        />
                    </div>
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                    <Button 
                        type="button" 
                        variant="secondary" 
                        onClick={handleCloseModal}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-6 rounded-lg transition-colors duration-200"
                    >
                        Annuler
                    </Button>
                    <Button 
                        type="submit" 
                        disabled={createClientMutation.isPending}
                        className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md"
                    >
                        {createClientMutation.isPending ? 'Enregistrement...' : 'Ajouter'}
                    </Button>
                </div>
            </form>
        </Modal>

        {/* Modal pour enregistrer un paiement */}
        <Modal 
            isOpen={isPaymentModalOpen} 
            onClose={handleClosePaymentModal} 
            title="Enregistrer un Paiement"
        >
            <form onSubmit={handlePaymentSubmit} className="space-y-6">
                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">Montant (FCFA)</label>
                    <input
                        type="number"
                        id="amount"
                        name="amount"
                        value={paymentAmount}
                        onChange={handlePaymentChange}
                        min="0"
                        className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-sm"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">Méthode de paiement</label>
                    <select
                        id="paymentMethod"
                        name="paymentMethod"
                        value={paymentMethod}
                        onChange={handlePaymentMethodChange}
                        className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-sm"
                        required
                    >
                        <option value="CASH" className="bg-white">Espèces</option>
                        <option value="BANK_TRANSFER" className="bg-white">Virement bancaire</option>
                        <option value="CHECK" className="bg-white">Chèque</option>
                        <option value="CREDIT_CARD" className="bg-white">Carte de crédit</option>
                        <option value="MOBILE_MONEY" className="bg-white">Mobile Money</option>
                    </select>
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                    <Button 
                        type="button" 
                        variant="secondary" 
                        onClick={handleClosePaymentModal}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-6 rounded-lg transition-colors duration-200"
                    >
                        Annuler
                    </Button>
                    <Button 
                        type="submit"
                        className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md"
                    >
                        Enregistrer
                    </Button>
                </div>
            </form>
        </Modal>

        {/* Modal pour afficher les détails du client */}
        <Modal 
            isOpen={isClientDetailOpen} 
            onClose={handleCloseClientDetail} 
            title="Détails du Client"
            size="xl"
        >
            {selectedClient && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-md">
                    <h3 className="text-lg font-semibold mb-4 text-orange-600">Informations du Client</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nom</span>
                        <span className="font-medium">{selectedClient.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Contact</span>
                        <span>{selectedClient.contact}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Téléphone</span>
                        <span>{selectedClient.telephone || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email</span>
                        <span>{selectedClient.email || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Adresse</span>
                        <span>{selectedClient.address || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Entreprise</span>
                        <span>{selectedClient.company || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Solde</span>
                        <span className={`font-bold ${getBalanceColor(selectedClient.balance)}`}>
                          {formatBalance(selectedClient.balance)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dernier achat</span>
                        <span>{formatDate(selectedClient.lastPurchaseDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Points de fidélité</span>
                        <span className="font-semibold">{selectedClient.loyaltyPoints || 0}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Historique des paiements */}
                  <div className="bg-white rounded-xl p-6 shadow-md">
                    <h3 className="text-lg font-semibold mb-4 text-orange-600">Historique des Paiements</h3>
                    {paymentsLoading ? (
                      <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                      </div>
                    ) : payments.length === 0 ? (
                      <p className="text-gray-600 text-center py-8">Aucun historique de paiement disponible pour le moment.</p>
                    ) : (
                      <div className="space-y-3 max-h-80 overflow-y-auto">
                        {payments.map((payment) => (
                          <div key={payment.id} className="flex justify-between items-center border-b border-gray-100 pb-3">
                            <div>
                              <p className="font-medium text-gray-800">{formatDate(payment.date)}</p>
                              <p className="text-sm text-gray-600">{getPaymentMethodName(payment.method)}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-800">{payment.amount.toLocaleString('fr-FR')} FCFA</p>
                              <p className="text-xs text-gray-500">{payment.saleReference}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={() => {
                      handleCloseClientDetail();
                      handleOpenPaymentModal(selectedClient.id);
                    }}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md"
                  >
                    <CreditCard className="mr-2" size={20} />
                    Enregistrer un paiement
                  </Button>
                </div>
              </div>
            )}
        </Modal>
        
        {/* Modal pour éditer un client */}
        <Modal 
          isOpen={isEditModalOpen} 
          onClose={handleCloseEditModal} 
          title="Modifier un Client"
        >
          <form onSubmit={handleEditSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-2">Nom complet *</label>
                <input
                  type="text"
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="edit-contact" className="block text-sm font-medium text-gray-700 mb-2">Contact *</label>
                <input
                  type="text"
                  id="edit-contact"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="edit-telephone" className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                <input
                  type="text"
                  id="edit-telephone"
                  name="telephone"
                  value={formData.telephone || ''}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-sm"
                />
              </div>
              <div>
                <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  id="edit-email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="edit-address" className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                <input
                  type="text"
                  id="edit-address"
                  name="address"
                  value={formData.address || ''}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="edit-company" className="block text-sm font-medium text-gray-700 mb-2">Entreprise</label>
                <input
                  type="text"
                  id="edit-company"
                  name="company"
                  value={formData.company || ''}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-sm"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4 pt-4">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={handleCloseEditModal}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-6 rounded-lg transition-colors duration-200"
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={updateClientMutation.isPending}
                className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md"
              >
                {updateClientMutation.isPending ? 'Mise à jour...' : 'Mettre à jour'}
              </Button>
            </div>
          </form>
        </Modal>

      </div>
    );
};

// Fonction pour obtenir le nom de la méthode de paiement en français
const getPaymentMethodName = (method: string) => {
  switch (method) {
    case 'CASH': return 'Espèces';
    case 'CARD': return 'Carte bancaire';
    case 'MOBILE_MONEY': return 'Mobile Money';
    case 'BANK_TRANSFER': return 'Virement bancaire';
    default: return method;
  }
};
