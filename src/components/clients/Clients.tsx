"use client";

import React, { useState, useMemo } from 'react';
import type { Business, Client } from '@/types';
import { Button } from '../shared/Button';
import { Modal } from '../shared/Modal';
import { Table } from '../shared/Table';
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from '@/hooks/useClient';
import { useClientPayments } from '@/hooks/usePayment';

interface ClientsProps {
    business: Business;
    onAddClient: (newClient: Client) => void;
    onRecordPayment: (clientId: string, amount: number, paymentMethod?: string) => void;
}

export const Clients: React.FC<ClientsProps> = ({ business, onAddClient, onRecordPayment }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedClientId, setSelectedClientId] = useState('');
    const [paymentAmount, setPaymentAmount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('CASH'); // Méthode de paiement par défaut
    const [formData, setFormData] = useState<Omit<Client, 'id' | 'businessId' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'loyaltyPoints' | 'lastPurchaseDate' | 'notes'>>({ 
        name: '', 
        contact: '',
        telephone: '',
        balance: 0,
        email: '',
        address: '',
        company: '',
    });
    const [isPaymentHistoryModalOpen, setIsPaymentHistoryModalOpen] = useState(false);
    const [selectedClientForHistory, setSelectedClientForHistory] = useState<Client | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    
    // Utiliser useMemo pour s'assurer que les données sont rechargées lorsque l'entreprise change
    const businessId = useMemo(() => business.id, [business.id]);
    
    const { data: clients = [], isLoading } = useClients(businessId);
    const createClientMutation = useCreateClient();
    const updateClientMutation = useUpdateClient();
    const deleteClientMutation = useDeleteClient();
    const { data: payments = [], isLoading: paymentsLoading } = useClientPayments(selectedClientForHistory?.id || '');
    
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

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleClosePaymentModal = () => {
        setIsPaymentModalOpen(false);
        setSelectedClientId('');
        setPaymentAmount(0);
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

    const handleOpenPaymentHistory = (client: Client) => {
        setSelectedClientForHistory(client);
        setIsPaymentHistoryModalOpen(true);
    };
    
    const handleClosePaymentHistory = () => {
        setIsPaymentHistoryModalOpen(false);
        setSelectedClientForHistory(null);
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
        setEditingClient(client);
        setIsEditModalOpen(true);
    };
    
    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingClient(null);
    };

    // Fonction pour calculer le solde total des clients
    const calculateTotalBalance = () => {
        return clients.reduce((total, client: any) => total + (client.balance || 0), 0);
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

    // Fonction pour formater la date
    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Create new client with all required fields
        const clientData: any = {
            ...formData,
            businessId: business.id,
            createdAt: new Date(), // Use Date object instead of string
            updatedAt: new Date(), // Use Date object instead of string
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
    
    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!editingClient) return;
        
        try {
            await updateClientMutation.mutateAsync({
                id: editingClient.id,
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

    const columns = useMemo(() => [
        { header: 'Nom', accessor: 'name' as keyof Client },
        { header: 'Contact', accessor: 'contact' as keyof Client },
        { 
            header: 'Solde', 
            accessor: 'balance' as keyof Client,
            render: (item: Client) => (
                <span className={getBalanceColor(item.balance)}>
                    {formatBalance(item.balance)}
                </span>
            )
        },
        {
            header: 'Actions',
            accessor: 'id' as keyof Client,
            render: (item: Client) => (
                <div className="flex space-x-2">
                    <Button 
                        variant="secondary" 
                        onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditModal(item);
                        }}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-800"
                    >
                        Éditer
                    </Button>
                    <Button 
                        variant="secondary" 
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClient(item.id);
                        }}
                        className="bg-red-100 hover:bg-red-200 text-red-800"
                    >
                        Supprimer
                    </Button>
                    <Button 
                        variant="secondary" 
                        onClick={(e) => {
                            e.stopPropagation();
                            handleOpenPaymentHistory(item);
                        }}
                    >
                        Historique
                    </Button>
                    <Button 
                        variant="secondary" 
                        onClick={(e) => {
                            e.stopPropagation();
                            handleOpenPaymentModal(item.id);
                        }}
                    >
                        Paiement
                    </Button>
                </div>
            )
        }
    ], [clients]);

    if (isLoading) {
        return (
              <div className="flex w-full h-screen flex-col justify-center items-center  space-y-4">
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
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-800">Clients - {business.name}</h1>
                <div className="flex items-center space-x-4">
                    <div className="bg-white p-3 rounded-lg shadow-md">
                        <p className="text-sm text-gray-600">Solde total des clients</p>
                        <p className={`text-xl font-bold ${getBalanceColor(calculateTotalBalance())}`}>
                            {formatBalance(calculateTotalBalance())}
                        </p>
                    </div>
                    <Button onClick={handleOpenModal}>Ajouter un Client</Button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <Table 
                    columns={columns} 
                    data={clients as any} 
                />
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Ajouter un Client">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                        <input
                            type="text"
                            id="contact"
                            name="contact"
                            value={formData.contact}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                        <input
                            type="text"
                            id="telephone"
                            name="telephone"
                            value={formData.telephone || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                        <input
                            type="text"
                            id="address"
                            name="address"
                            value={formData.address || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">Entreprise</label>
                        <input
                            type="text"
                            id="company"
                            name="company"
                            value={formData.company || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="secondary" onClick={handleCloseModal}>Annuler</Button>
                        <Button type="submit" disabled={createClientMutation.isPending}>
                            {createClientMutation.isPending ? 'Enregistrement...' : 'Ajouter'}
                        </Button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isPaymentModalOpen} onClose={handleClosePaymentModal} title="Enregistrer un Paiement">
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Montant (FCFA)</label>
                        <input
                            type="number"
                            id="amount"
                            name="amount"
                            value={paymentAmount}
                            onChange={handlePaymentChange}
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">Méthode de paiement</label>
                        <select
                            id="paymentMethod"
                            name="paymentMethod"
                            value={paymentMethod}
                            onChange={handlePaymentMethodChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        >
                            <option value="CASH">Espèces</option>
                            <option value="BANK_TRANSFER">Virement bancaire</option>
                            <option value="CHECK">Chèque</option>
                            <option value="CREDIT_CARD">Carte de crédit</option>
                            <option value="MOBILE_MONEY">Mobile Money</option>
                        </select>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="secondary" onClick={handleClosePaymentModal}>Annuler</Button>
                        <Button type="submit">Enregistrer</Button>
                    </div>
                </form>
            </Modal>

            {/* Modal pour l'historique des paiements */}
            <Modal 
              isOpen={isPaymentHistoryModalOpen} 
              onClose={handleClosePaymentHistory} 
              title={`Historique des Paiements - ${selectedClientForHistory?.name || ''}`}
            >
              {selectedClientForHistory && (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-gray-900">{selectedClientForHistory.name}</h3>
                        <p className="text-sm text-gray-600">Solde: 
                          <span className={`font-medium ml-2 ${getBalanceColor(selectedClientForHistory.balance)}`}>
                            {formatBalance(selectedClientForHistory.balance)}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {paymentsLoading ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : payments.length === 0 ? (
                    <p className="text-gray-600 text-center py-8">Aucun historique de paiement disponible.</p>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {payments.map((payment) => (
                        <div key={payment.id} className="flex justify-between items-center border-b border-gray-200 pb-3">
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
                  
                  <div className="flex justify-end pt-4">
                    <Button 
                      variant="secondary" 
                      onClick={handleClosePaymentHistory}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800"
                    >
                      Fermer
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
              {editingClient && (
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
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800"
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
              )}
            </Modal>
        </div>
    );
};