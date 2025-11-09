"use client";

import React, { useState } from 'react';
import type { Business, Client } from '@/types';
import { Button } from '../shared/Button';
import { Modal } from '../shared/Modal';
import { Table } from '../shared/Table';
import { useClients, useCreateClient } from '@/hooks/useClient';

interface ClientsProps {
    business: Business;
    onAddClient: (newClient: Client) => void;
    onRecordPayment: (clientId: string, amount: number) => void;
}

export const Clients: React.FC<ClientsProps> = ({ business, onAddClient, onRecordPayment }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedClientId, setSelectedClientId] = useState('');
    const [paymentAmount, setPaymentAmount] = useState(0);
    const [formData, setFormData] = useState<Omit<Client, 'id' | 'balance'>>({ 
        name: '', 
        contact: '' 
    });

    const { data: clients = [], isLoading } = useClients(business.id);
    const createClientMutation = useCreateClient();

    const handleOpenModal = () => {
        setFormData({ name: '', contact: '' });
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Create new client with initial balance of 0
        await createClientMutation.mutateAsync({ 
            businessId: business.id, 
            data: { ...formData, balance: 0 }
        });
        
        handleCloseModal();
    };

    const handlePaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onRecordPayment(selectedClientId, paymentAmount);
        handleClosePaymentModal();
    };

    const columns = [
        { header: 'Nom', accessor: 'name' as keyof Client },
        { header: 'Contact', accessor: 'contact' as keyof Client },
        { 
            header: 'Solde', 
            accessor: 'balance' as keyof Client,
            render: (item: Client) => (
                <span className={item.balance < 0 ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>
                    {item.balance < 0 ? '-' : ''}{Math.abs(item.balance).toLocaleString('fr-FR')} FCFA
                </span>
            )
        },
        {
            header: 'Actions',
            accessor: 'id' as keyof Client,
            render: (item: Client) => (
                <Button 
                    variant="secondary" 
                    onClick={(e) => {
                        e.stopPropagation();
                        handleOpenPaymentModal(item.id);
                    }}
                >
                    Enregistrer Paiement
                </Button>
            )
        }
    ];

    if (isLoading) {
        return <div className="flex justify-center items-center h-64">Chargement des clients...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Clients</h1>
                <Button onClick={handleOpenModal}>Ajouter un Client</Button>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <Table 
                    columns={columns} 
                    data={clients} 
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
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="secondary" onClick={handleClosePaymentModal}>Annuler</Button>
                        <Button type="submit">Enregistrer</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};