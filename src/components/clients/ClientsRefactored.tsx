"use client";

import React, { useState, useMemo } from 'react';
import type { Business, Client } from '@/types';
import { Button } from '../shared/Button';
import { Modal } from '../shared/Modal';
import { useClients, useCreateClient } from '@/hooks/useClient';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, Mail, MapPin, Building, CreditCard, Calendar, Star } from 'lucide-react';

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
    const createClientMutation = useCreateClient();

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

    // Filtrer et trier les clients
    const filteredAndSortedClients = useMemo(() => {
        // Convertir les clients pour qu'ils correspondent au type Client
        const convertedClients = clients.map(convertClient);

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
    }, [clients, searchTerm, sortConfig]);

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
                        <p className="text-gray-600 mt-2">{business.name}</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="bg-white rounded-xl p-4 shadow-md">
                            <p className="text-gray-600 text-sm">Total Clients</p>
                            <p className="text-2xl font-bold text-orange-600">{clients.length}</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow-md">
                            <p className="text-gray-600 text-sm">Solde Total</p>
                            <p className={`text-2xl font-bold ${getBalanceColor(calculateTotalBalance())}`}>
                                {formatBalance(calculateTotalBalance())}
                            </p>
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
                    <Button 
                        onClick={handleOpenModal}
                        className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md"
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <AnimatePresence>
                    {filteredAndSortedClients.map((client) => (
                        <motion.div
                            key={client.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-orange-300"
                            onClick={() => handleOpenClientDetail(convertClient(client))}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center">
                                    <div className="bg-orange-100 rounded-full w-12 h-12 flex items-center justify-center">
                                        <User className="text-orange-600" size={24} />
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="font-bold text-lg text-gray-900">{client.name}</h3>
                                        <p className="text-gray-600 text-sm">{client.contact}</p>
                                    </div>
                                </div>
                                <div className="flex items-center bg-gray-100 px-2 py-1 rounded-full">
                                    <Star className="text-amber-500 mr-1" size={16} />
                                    <span className="text-sm text-gray-700">{client.loyaltyPoints || 0} pts</span>
                                </div>
                            </div>
                            
                            <div className="mt-4 space-y-2">
                                <div className="flex items-center text-gray-600">
                                    <Building className="mr-2" size={16} />
                                    <span className="text-sm">{client.company || 'N/A'}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <Phone className="mr-2" size={16} />
                                    <span className="text-sm">{client.telephone || 'N/A'}</span>
                                </div>
                                <div className="flex items-center justify-between mt-4">
                                    <div>
                                        <p className="text-gray-600 text-sm">Solde</p>
                                        <p className={`font-bold ${getBalanceColor(client.balance)}`}>
                                            {formatBalance(client.balance)}
                                        </p>
                                    </div>
                                    <Button 
                                        variant="secondary"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenPaymentModal(client.id);
                                        }}
                                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm py-1 px-3 rounded-lg transition-colors duration-200"
                                    >
                                        Paiement
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Tableau pour les grands écrans */}
            <div className="hidden lg:block bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th 
                                    scope="col" 
                                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-orange-600 transition-colors duration-200"
                                    onClick={() => handleSort('name')}
                                >
                                    <div className="flex items-center">
                                        <span>Nom</span>
                                        {sortConfig?.key === 'name' && (
                                            <svg 
                                                className={`ml-1 h-4 w-4 ${sortConfig.direction === 'asc' ? '' : 'transform rotate-180'}`} 
                                                fill="none" 
                                                stroke="currentColor" 
                                                viewBox="0 0 24 24" 
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path 
                                                    strokeLinecap="round" 
                                                    strokeLinejoin="round" 
                                                    strokeWidth={2} 
                                                    d="M5 15l7-7 7 7"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                </th>
                                <th 
                                    scope="col" 
                                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-orange-600 transition-colors duration-200"
                                    onClick={() => handleSort('contact')}
                                >
                                    <div className="flex items-center">
                                        <span>Contact</span>
                                        {sortConfig?.key === 'contact' && (
                                            <svg 
                                                className={`ml-1 h-4 w-4 ${sortConfig.direction === 'asc' ? '' : 'transform rotate-180'}`} 
                                                fill="none" 
                                                stroke="currentColor" 
                                                viewBox="0 0 24 24" 
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path 
                                                    strokeLinecap="round" 
                                                    strokeLinejoin="round" 
                                                    strokeWidth={2} 
                                                    d="M5 15l7-7 7 7"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Entreprise
                                </th>
                                <th 
                                    scope="col" 
                                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-orange-600 transition-colors duration-200"
                                    onClick={() => handleSort('balance')}
                                >
                                    <div className="flex items-center">
                                        <span>Solde</span>
                                        {sortConfig?.key === 'balance' && (
                                            <svg 
                                                className={`ml-1 h-4 w-4 ${sortConfig.direction === 'asc' ? '' : 'transform rotate-180'}`} 
                                                fill="none" 
                                                stroke="currentColor" 
                                                viewBox="0 0 24 24" 
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path 
                                                    strokeLinecap="round" 
                                                    strokeLinejoin="round" 
                                                    strokeWidth={2} 
                                                    d="M5 15l7-7 7 7"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Points de fidélité
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredAndSortedClients.map((client) => (
                                <motion.tr 
                                    key={client.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                    className="hover:bg-gray-50 transition-colors duration-200"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="bg-orange-100 rounded-full w-8 h-8 flex items-center justify-center">
                                                <User className="text-orange-600" size={16} />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{client.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{client.contact}</div>
                                        <div className="text-sm text-gray-500">{client.telephone || 'N/A'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {client.company || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`text-sm font-semibold ${getBalanceColor(client.balance)}`}>
                                            {formatBalance(client.balance)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="flex items-center">
                                            <Star className="text-amber-500 mr-1" size={16} />
                                            {client.loyaltyPoints || 0}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <Button 
                                                variant="secondary"
                                                onClick={() => handleOpenClientDetail(convertClient(client))}
                                                className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 px-3 rounded-lg transition-colors duration-200"
                                            >
                                                Détails
                                            </Button>
                                            <Button 
                                                variant="secondary"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOpenPaymentModal(client.id);
                                                }}
                                                className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 px-3 rounded-lg transition-colors duration-200"
                                            >
                                                Paiement
                                            </Button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
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

            {/* Modal pour les détails du client */}
            <Modal 
                isOpen={isClientDetailOpen} 
                onClose={handleCloseClientDetail} 
                title="Détails du Client"
                size="xl"
            >
                {selectedClient && (
                    <div className="space-y-6">
                        {/* En-tête du client */}
                        <div className="flex items-start">
                            <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center">
                                <User className="text-orange-600" size={32} />
                            </div>
                            <div className="ml-6 flex-1">
                                <h2 className="text-2xl font-bold text-gray-900">{selectedClient.name}</h2>
                                <p className="text-gray-600">{selectedClient.contact}</p>
                                <div className="flex items-center mt-2">
                                    <Star className="text-amber-500 mr-1" size={18} />
                                    <span className="font-semibold text-gray-900">{selectedClient.loyaltyPoints || 0} points de fidélité</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-gray-600">Solde</p>
                                <p className={`text-2xl font-bold ${getBalanceColor(selectedClient.balance)}`}>
                                    {formatBalance(selectedClient.balance)}
                                </p>
                            </div>
                        </div>

                        {/* Informations détaillées */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 rounded-xl p-6">
                                <h3 className="text-lg font-semibold mb-4 text-orange-600">Informations de contact</h3>
                                <div className="space-y-4">
                                    {selectedClient.telephone && (
                                        <div className="flex items-center">
                                            <Phone className="text-gray-600 mr-3" size={20} />
                                            <span>{selectedClient.telephone}</span>
                                        </div>
                                    )}
                                    {selectedClient.email && (
                                        <div className="flex items-center">
                                            <Mail className="text-gray-600 mr-3" size={20} />
                                            <span>{selectedClient.email}</span>
                                        </div>
                                    )}
                                    {selectedClient.address && (
                                        <div className="flex items-start">
                                            <MapPin className="text-gray-600 mr-3 mt-1" size={20} />
                                            <span>{selectedClient.address}</span>
                                        </div>
                                    )}
                                    {selectedClient.company && (
                                        <div className="flex items-center">
                                            <Building className="text-gray-600 mr-3" size={20} />
                                            <span>{selectedClient.company}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-6">
                                <h3 className="text-lg font-semibold mb-4 text-orange-600">Informations supplémentaires</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Date de création</span>
                                        <span>{formatDate(selectedClient.createdAt)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Dernière mise à jour</span>
                                        <span>{formatDate(selectedClient.updatedAt)}</span>
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
                        </div>

                        {/* Historique des paiements (à implémenter) */}
                        <div className="bg-gray-50 rounded-xl p-6">
                            <h3 className="text-lg font-semibold mb-4 text-orange-600">Historique des paiements</h3>
                            <p className="text-gray-600 text-center py-8">Aucun historique de paiement disponible pour le moment.</p>
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
        </div>
    );
};