"use client";

import React, { useState } from 'react';
import type { Business, Sale, Product, Client } from '@/types';
import { Button } from '../shared/Button';
import { Modal } from '../shared/Modal';
import { Table } from '../shared/Table';
import { useSales, useCreateSale } from '@/hooks/useSale';
import { useProducts } from '@/hooks/useProduct';
import { useClients } from '@/hooks/useClient';
import { Plus, Trash2, Printer, ChevronUp, ChevronDown } from 'lucide-react';
import { Receipt } from './Receipt';

interface SalesProps {
    business: Business;
    onAddSale: (newSale: Sale) => void;
}

// Interface pour une ligne de produit dans le formulaire
interface SaleLineItem {
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
}

export const Sales: React.FC<SalesProps> = ({ business, onAddSale }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState<{ key: keyof Sale; direction: 'asc' | 'desc' } | null>(null);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [formData, setFormData] = useState<{
        date: string;
        clientId: string;
        clientName: string;
        saleType: 'Vente au détail' | 'Vente en gros';
        lineItems: SaleLineItem[];
    }>({ 
        date: new Date().toISOString().split('T')[0], 
        clientId: '', 
        clientName: '', 
        saleType: 'Vente au détail',
        lineItems: [{
            id: Date.now().toString(),
            productId: '',
            productName: '',
            quantity: 1,
            unitPrice: 0
        }]
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
            saleType: 'Vente au détail',
            lineItems: [{
                id: Date.now().toString(),
                productId: '',
                productName: '',
                quantity: 1,
                unitPrice: 0
            }]
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
        setFormData(prev => ({
            ...prev,
            saleType
        }));
    };

    // Gestion des lignes de produits
    const addLineItem = () => {
        setFormData(prev => ({
            ...prev,
            lineItems: [
                ...prev.lineItems,
                {
                    id: Date.now().toString(),
                    productId: '',
                    productName: '',
                    quantity: 1,
                    unitPrice: 0
                }
            ]
        }));
    };

    const removeLineItem = (id: string) => {
        if (formData.lineItems.length > 1) {
            setFormData(prev => ({
                ...prev,
                lineItems: prev.lineItems.filter(item => item.id !== id)
            }));
        }
    };

    const updateLineItem = (id: string, field: keyof SaleLineItem, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            lineItems: prev.lineItems.map(item => 
                item.id === id ? { ...item, [field]: value } : item
            )
        }));
    };

    const handleProductChange = (lineItemId: string, productId: string) => {
        const product = products.find((p: Product) => p.id === productId);
        if (product) {
            updateLineItem(lineItemId, 'productId', productId);
            updateLineItem(lineItemId, 'productName', product.name);
            updateLineItem(lineItemId, 'unitPrice', 
                formData.saleType === 'Vente en gros' ? product.wholesalePrice : product.retailPrice
            );
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate form based on sale type
        if (formData.saleType === 'Vente en gros' && !formData.clientId) {
            alert('Veuillez sélectionner un client pour les ventes en gros');
            return;
        }
        
        // Validate line items
        for (const item of formData.lineItems) {
            if (!item.productId || item.quantity <= 0 || item.unitPrice <= 0) {
                alert('Veuillez remplir tous les champs des produits');
                return;
            }
        }
        
        // Create separate sales for each line item
        for (const item of formData.lineItems) {
            const total = item.quantity * item.unitPrice;
            
            const saleData = { 
                date: formData.date,
                clientId: formData.saleType === 'Vente au détail' && !formData.clientId ? '' : formData.clientId,
                clientName: formData.saleType === 'Vente au détail' && !formData.clientId ? 'Client Comptoir' : formData.clientName,
                productId: item.productId,
                productName: item.productName,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total,
                saleType: formData.saleType
            };
            
            await createSaleMutation.mutateAsync({ 
                businessId: business.id, 
                data: saleData
            });
        }
        
        handleCloseModal();
    };
    
    const handlePrintReceipt = (saleId: string) => {
        // Trouver la vente correspondante
        const sale = sales.find(s => s.id === saleId);
        if (!sale) return;
        
        // Trouver le client correspondant
        const client = clients.find(c => c.id === sale.clientId) || null;
        
        // Trouver le produit correspondant
        const product = products.find(p => p.id === sale.productId) || null;
        
        // Afficher le reçu (dans une vraie implémentation, on afficherait une modale ou une nouvelle page)
        console.log("Imprimer le reçu pour la vente:", sale, client, product);
    };
    
    // Regrouper les ventes par date et client pour créer des reçus
    const groupedSales = formattedSales.reduce((acc: Record<string, Sale[]>, sale) => {
        const key = `${sale.date}-${sale.clientId}`;
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(sale);
        return acc;
    }, {});
    
    // Fonction pour filtrer les ventes par date
    const filteredSales = React.useMemo(() => {
        if (!startDate && !endDate) return formattedSales;
        
        return formattedSales.filter(sale => {
            const saleDate = new Date(sale.date);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;
            
            if (start && saleDate < start) return false;
            if (end && saleDate > end) return false;
            return true;
        });
    }, [formattedSales, startDate, endDate]);
    
    // Fonction de tri appliquée aux ventes filtrées
    const sortedAndFilteredSales = React.useMemo(() => {
        if (!sortConfig) return filteredSales;
        
        return [...filteredSales].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }, [filteredSales, sortConfig]);
    
    // Fonction pour gérer le tri
    const handleSort = (key: keyof Sale) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };
    
    // Fonction pour obtenir l'icône de tri
    const getSortIcon = (key: keyof Sale) => {
        if (!sortConfig || sortConfig.key !== key) {
            return <ChevronUp className="h-4 w-4 text-gray-400" />;
        }
        return sortConfig.direction === 'asc' ? 
            <ChevronUp className="h-4 w-4 text-gray-900 dark:text-white" /> : 
            <ChevronDown className="h-4 w-4 text-gray-900 dark:text-white" />;
    };
    
    const columns = [
        { 
            header: 'Date', 
            accessor: 'date' as keyof Sale,
            sortable: true
        },
        { 
            header: 'Client', 
            accessor: 'clientName' as keyof Sale,
            sortable: true
        },
        { 
            header: 'Produit', 
            accessor: 'productName' as keyof Sale,
            sortable: true
        },
        { 
            header: 'Quantité', 
            accessor: 'quantity' as keyof Sale,
            sortable: true
        },
        { 
            header: 'Prix Unitaire', 
            accessor: 'unitPrice' as keyof Sale,
            render: (item: Sale) => `${item.unitPrice.toLocaleString('fr-FR')} FCFA`,
            sortable: true
        },
        { 
            header: 'Total', 
            accessor: 'total' as keyof Sale,
            render: (item: Sale) => `${item.total.toLocaleString('fr-FR')} FCFA`,
            sortable: true
        },
        { 
            header: 'Type', 
            accessor: 'saleType' as keyof Sale,
            sortable: true
        },
        {
            header: 'Actions',
            accessor: 'id' as keyof Sale,
            render: (item: Sale) => (
                <div className="flex space-x-2">
                    <Button 
                        variant="secondary" 
                        onClick={() => {
                            // Trouver toutes les ventes du même reçu (même date et client)
                            const receiptKey = `${item.date}-${item.clientId}`;
                            const receiptSales = groupedSales[receiptKey] || [item];
                            
                            // Trouver le client correspondant
                            const client = clients.find(c => c.id === item.clientId) || null;
                            
                            // Trouver tous les produits correspondants
                            const receiptProducts = products.filter(p => 
                                receiptSales.some(s => s.productId === p.id)
                            );
                            
                            // Créer un élément temporaire pour le reçu
                            const printWindow = window.open('', '_blank');
                            if (printWindow) {
                                printWindow.document.write(`
                                    <!DOCTYPE html>
                                    <html>
                                    <head>
                                        <title>Reçu de vente</title>
                                        <style>
                                            body { font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; }
                                            .header { text-align: center; border-bottom: 1px solid #ccc; padding-bottom: 10px; margin-bottom: 20px; }
                                            .business-name { font-size: 24px; font-weight: bold; }
                                            .receipt-title { font-size: 18px; color: #666; }
                                            .date { font-size: 14px; color: #999; margin: 5px 0; }
                                            .client-info { margin-bottom: 20px; }
                                            .client-name { font-weight: bold; }
                                            .products-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                                            .products-table th, .products-table td { text-align: left; padding: 8px; border-bottom: 1px solid #eee; }
                                            .products-table th { border-bottom: 2px solid #ccc; }
                                            .total-section { border-top: 2px solid #ccc; padding-top: 10px; }
                                            .total-row { display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; }
                                            .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #999; }
                                        </style>
                                    </head>
                                    <body>
                                        <div class="header">
                                            <div class="business-name">${business.name}</div>
                                            <div class="receipt-title">Reçu de vente</div>
                                            <div class="date">Date: ${new Date().toLocaleDateString('fr-FR')}</div>
                                        </div>
                                        
                                        ${client ? `
                                        <div class="client-info">
                                            <div class="client-name">Client: ${client.name}</div>
                                            ${client.telephone ? `<div>Tél: ${client.telephone}</div>` : ''}
                                            ${client.address ? `<div>Adresse: ${client.address}</div>` : ''}
                                        </div>
                                        ` : ''}
                                        
                                        <table class="products-table">
                                            <thead>
                                                <tr>
                                                    <th>Produit</th>
                                                    <th>Qté</th>
                                                    <th>Prix</th>
                                                    <th>Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                ${receiptSales.map(sale => {
                                                    const product = receiptProducts.find(p => p.id === sale.productId);
                                                    return `
                                                    <tr>
                                                        <td>${sale.productName}</td>
                                                        <td>${sale.quantity}</td>
                                                        <td>${sale.unitPrice.toLocaleString('fr-FR')} FCFA</td>
                                                        <td>${sale.total.toLocaleString('fr-FR')} FCFA</td>
                                                    </tr>
                                                    `;
                                                }).join('')}
                                            </tbody>
                                        </table>
                                        
                                        <div class="total-section">
                                            <div class="total-row">
                                                <span>Total:</span>
                                                <span>${receiptSales.reduce((sum, sale) => sum + sale.total, 0).toLocaleString('fr-FR')} FCFA</span>
                                            </div>
                                        </div>
                                        
                                        <div class="footer">
                                            <p>Merci pour votre achat!</p>
                                            <p>-----------------------------</p>
                                        </div>
                                        
                                        <script>
                                            window.onload = function() {
                                                window.print();
                                                // Fermer la fenêtre après l'impression
                                                window.onfocus = function() { 
                                                    window.close(); 
                                                }
                                            }
                                        </script>
                                    </body>
                                    </html>
                                `);
                                printWindow.document.close();
                            }
                        }}
                        className="p-2"
                    >
                        <Printer className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
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
            
            {/* Filtres par date */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de début</label>
                        <input
                            type="date"
                            id="startDate"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date de fin</label>
                        <input
                            type="date"
                            id="endDate"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div className="flex items-end">
                        <Button 
                            variant="secondary" 
                            onClick={() => {
                                setStartDate('');
                                setEndDate('');
                            }}
                            className="w-full"
                        >
                            Réinitialiser les filtres
                        </Button>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <Table 
                    columns={columns} 
                    data={sortedAndFilteredSales} 
                    onSort={handleSort}
                    sortConfig={sortConfig}
                />
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Ajouter une Vente">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Section Informations de base */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Informations de la transaction</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                                <input
                                    type="date"
                                    id="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    required
                                >
                                    <option value="Vente au détail">Vente au détail</option>
                                    <option value="Vente en gros">Vente en gros</option>
                                </select>
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
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    required={formData.saleType === 'Vente en gros'}
                                >
                                    <option value="">
                                        {formData.saleType === 'Vente en gros' 
                                            ? 'Sélectionner un client (requis)' 
                                            : 'Sélectionner un client (optionnel)'}
                                    </option>
                                    {clients.map((client: Client) => (
                                        <option key={client.id} value={client.id}>{client.name}</option>
                                    ))}
                                </select>
                                {formData.saleType === 'Vente au détail' && (
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Optionnel pour les ventes au détail</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Section Produits */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Produits</h2>
                            <Button 
                                type="button" 
                                variant="secondary" 
                                onClick={addLineItem} 
                                className="flex items-center text-sm"
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Ajouter un produit
                            </Button>
                        </div>
                        
                        <div className="space-y-4">
                            {formData.lineItems.map((item, index) => (
                                <div key={item.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800 relative">
                                    {formData.lineItems.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeLineItem(item.id)}
                                            className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900"
                                            aria-label="Supprimer ce produit"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Produit</label>
                                            <select
                                                value={item.productId}
                                                onChange={(e) => handleProductChange(item.id, e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                required
                                            >
                                                <option value="">Sélectionner un produit</option>
                                                {products.map((product: Product) => (
                                                    <option key={product.id} value={product.id}>{product.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantité</label>
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                                                min="1"
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prix Unitaire (FCFA)</label>
                                            <input
                                                type="number"
                                                value={item.unitPrice}
                                                onChange={(e) => updateLineItem(item.id, 'unitPrice', parseInt(e.target.value) || 0)}
                                                min="0"
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Total pour ce produit:</span>
                                        <span className="font-semibold text-gray-800 dark:text-white">
                                            {(item.quantity * item.unitPrice).toLocaleString('fr-FR')} FCFA
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section Récapitulatif */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Récapitulatif</h2>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-700 dark:text-gray-300">Nombre de produits:</span>
                            <span className="font-medium">{formData.lineItems.length}</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-gray-700 dark:text-gray-300">Total de la transaction:</span>
                            <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                                {formData.lineItems.reduce((total, item) => total + (item.quantity * item.unitPrice), 0).toLocaleString('fr-FR')} FCFA
                            </span>
                        </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="secondary" onClick={handleCloseModal}>Annuler</Button>
                        <Button 
                            type="submit" 
                            disabled={createSaleMutation.isPending}
                            className="flex items-center"
                        >
                            {createSaleMutation.isPending ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Enregistrement...
                                </>
                            ) : (
                                'Enregistrer la vente'
                            )}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};