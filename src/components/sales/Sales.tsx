"use client";

import React, { useState } from 'react';
import type { Business, Sale, Product, Client } from '@/types';
import { Button } from '../shared/Button';
import { Modal } from '../shared/Modal';
import { Table } from '../shared/Table';
import { useSales, useCreateSale } from '@/hooks/useSale';
import { useProducts } from '@/hooks/useProduct';
import { useClients } from '@/hooks/useClient';

interface SalesProps {
    business: Business;
    onAddSale: (newSale: Sale) => void;
}

export const Sales: React.FC<SalesProps> = ({ business, onAddSale }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<Omit<Sale, 'id' | 'total'>>({ 
        date: new Date().toISOString().split('T')[0], 
        clientId: '', 
        clientName: '', 
        productId: '', 
        productName: '', 
        quantity: 1, 
        unitPrice: 0, 
        saleType: 'Vente au détail' 
    });

    const { data: sales = [], isLoading: salesLoading } = useSales(business.id);
    const { data: products = [], isLoading: productsLoading } = useProducts(business.id);
    const { data: clients = [], isLoading: clientsLoading } = useClients(business.id);
    const createSaleMutation = useCreateSale();

    // Convert database sale objects to Sale type
    const formattedSales: Sale[] = sales.map((sale: any) => ({
        ...sale,
        date: typeof sale.date === 'string' ? sale.date : sale.date.toISOString().split('T')[0],
        saleType: sale.saleType as 'Vente au détail' | 'Vente en gros'
    }));

    const handleOpenModal = () => {
        setFormData({ 
            date: new Date().toISOString().split('T')[0], 
            clientId: '', 
            clientName: '', 
            productId: '', 
            productName: '', 
            quantity: 1, 
            unitPrice: 0, 
            saleType: 'Vente au détail' 
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const productId = e.target.value;
        const product = products.find((p) => p.id === productId);
        if (product) {
            setFormData(prev => ({
                ...prev,
                productId,
                productName: product.name,
                unitPrice: formData.saleType === 'Vente en gros' ? product.wholesalePrice : product.retailPrice
            }));
        }
    };

    const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const clientId = e.target.value;
        const client = clients.find((c: Client) => c.id === clientId);
        if (client) {
            setFormData(prev => ({
                ...prev,
                clientId,
                clientName: client.name
            }));
        }
    };

    const handleSaleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const saleType = e.target.value as 'Vente au détail' | 'Vente en gros';
        const product = products.find((p) => p.id === formData.productId);
        setFormData(prev => ({
            ...prev,
            saleType,
            unitPrice: product ? (saleType === 'Vente en gros' ? product.wholesalePrice : product.retailPrice) : 0
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate form based on sale type
        if (formData.saleType === 'Vente en gros' && !formData.clientId) {
            alert('Veuillez sélectionner un client pour les ventes en gros');
            return;
        }
        
        // Calculate total
        const total = formData.quantity * formData.unitPrice;
        
        // Create new sale (for retail sales, we can use a default client or leave client info empty)
        const saleData = { 
            ...formData, 
            total,
            // For retail sales, we can clear client info if none selected
            clientId: formData.saleType === 'Vente au détail' && !formData.clientId ? '' : formData.clientId,
            clientName: formData.saleType === 'Vente au détail' && !formData.clientId ? 'Client Comptoir' : formData.clientName
        };
        
        await createSaleMutation.mutateAsync({ 
            businessId: business.id, 
            data: saleData
        });
        
        handleCloseModal();
    };

    const columns = [
        { header: 'Date', accessor: 'date' as keyof Sale },
        { header: 'Client', accessor: 'clientName' as keyof Sale },
        { header: 'Produit', accessor: 'productName' as keyof Sale },
        { header: 'Quantité', accessor: 'quantity' as keyof Sale },
        { 
            header: 'Prix Unitaire', 
            accessor: 'unitPrice' as keyof Sale,
            render: (item: Sale) => `${item.unitPrice.toLocaleString('fr-FR')} FCFA`
        },
        { 
            header: 'Total', 
            accessor: 'total' as keyof Sale,
            render: (item: Sale) => `${item.total.toLocaleString('fr-FR')} FCFA`
        },
        { header: 'Type', accessor: 'saleType' as keyof Sale }
    ];

    if (salesLoading || productsLoading || clientsLoading) {
        return <div className="flex justify-center items-center h-64">Chargement des ventes...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Ventes</h1>
                <Button onClick={handleOpenModal}>Ajouter une Vente</Button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <Table 
                    columns={columns} 
                    data={formattedSales} 
                />
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Ajouter une Vente">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Client {formData.saleType === 'Vente en gros' && <span className="text-red-500">*</span>}
                        </label>
                        <select
                            id="clientId"
                            name="clientId"
                            value={formData.clientId}
                            onChange={handleClientChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required={formData.saleType === 'Vente en gros'}
                        >
                            <option value="">
                                {formData.saleType === 'Vente en gros' 
                                    ? 'Sélectionner un client (requis pour les ventes en gros)' 
                                    : 'Sélectionner un client (optionnel)'}
                            </option>
                            {clients.map((client: Client) => (
                                <option key={client.id} value={client.id}>{client.name}</option>
                            ))}
                        </select>
                        {formData.saleType === 'Vente au détail' && (
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Optionnel pour les ventes au détail</p>
                        )}
                    </div>
                    <div>
                        <label htmlFor="productId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Produit</label>
                        <select
                            id="productId"
                            name="productId"
                            value={formData.productId}
                            onChange={handleProductChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        >
                            <option value="">Sélectionner un produit</option>
                            {products.map((product: Product) => (
                                <option key={product.id} value={product.id}>{product.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantité</label>
                        <input
                            type="number"
                            id="quantity"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            min="1"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="saleType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type de Vente</label>
                        <select
                            id="saleType"
                            name="saleType"
                            value={formData.saleType}
                            onChange={handleSaleTypeChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        >
                            <option value="Vente au détail">Vente au détail</option>
                            <option value="Vente en gros">Vente en gros</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="unitPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prix Unitaire (FCFA)</label>
                        <input
                            type="number"
                            id="unitPrice"
                            name="unitPrice"
                            value={formData.unitPrice}
                            onChange={handleChange}
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="secondary" onClick={handleCloseModal}>Annuler</Button>
                        <Button type="submit" disabled={createSaleMutation.isPending}>
                            {createSaleMutation.isPending ? 'Enregistrement...' : 'Ajouter'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};