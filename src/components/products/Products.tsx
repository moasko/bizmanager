"use client";

import React, { useState, useMemo } from 'react';
import type { Business, Product, User } from '@/types';
import { Button } from '../shared/Button';
import { Modal } from '../shared/Modal';
import { Table } from '../shared/Table';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useProduct';
import { useRestockProduct } from '@/hooks/useRestock';
import { useSuppliers } from '@/hooks/useSupplier';
import { useAuth } from '@/contexts/AuthContext';
import { Edit, PackagePlus, Trash2 } from 'lucide-react';

interface ProductsProps {
    business: Business;
    onAddProduct: (newProduct: Product) => void;
    onUpdateProduct: (updatedProduct: Product) => void;
}

export const Products: React.FC<ProductsProps> = ({ business, onAddProduct, onUpdateProduct }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
    const [restockingProduct, setRestockingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState<Omit<Product, 'id' | 'businessId' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'sku' | 'barcode' | 'images'>>({ 
        name: '', 
        category: '', 
        stock: 0,
        minStock: 10, // Valeur par défaut pour le stock minimum
        costPrice: 0,
        retailPrice: 0, 
        wholesalePrice: 0,
        purchasePrice: 0,
        supplierId: undefined,
    });
    const [restockData, setRestockData] = useState({ 
        quantity: 0, 
        cost: 0,
        unitCost: 0,
        totalCost: 0,
        supplierId: '',
    });

    const { currentUser } = useAuth();
    
    // Utiliser useMemo pour s'assurer que les données sont rechargées lorsque l'entreprise change
    const businessId = useMemo(() => business.id, [business.id]);
    
    const { data: products = [], isLoading } = useProducts(businessId);
    const { data: suppliers = [], isLoading: isSuppliersLoading } = useSuppliers(businessId);
    const createProductMutation = useCreateProduct();
    const updateProductMutation = useUpdateProduct();
    const deleteProductMutation = useDeleteProduct();
    const restockProductMutation = useRestockProduct();

    const handleOpenModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                category: product.category,
                stock: product.stock,
                minStock: product.minStock || 0,
                costPrice: product.costPrice || 0,
                retailPrice: product.retailPrice,
                wholesalePrice: product.wholesalePrice,
                purchasePrice: product.purchasePrice || 0,
                supplierId: product.supplierId ?? undefined,
            });
        } else {
            setEditingProduct(null);
            setFormData({ 
                name: '', 
                category: '', 
                stock: 0,
                minStock: 0,
                costPrice: 0,
                retailPrice: 0, 
                wholesalePrice: 0,
                purchasePrice: 0,
                supplierId: undefined,
            });
        }
        setIsModalOpen(true);
    };

    const handleOpenRestockModal = (product: Product) => {
        setRestockingProduct(product);
        // Pre-fill with calculated unit cost based on current wholesale price
        const unitCost = product.wholesalePrice;
        setRestockData({ 
            quantity: 0, 
            cost: 0,
            unitCost: unitCost,
            totalCost: 0,
            supplierId: product.supplierId ?? '',
        });
        setIsRestockModalOpen(true);
    };

    const handleOpenDeleteModal = (product: Product) => {
        setDeletingProduct(product);
        setIsDeleteModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const handleCloseRestockModal = () => {
        setIsRestockModalOpen(false);
        setRestockingProduct(null);
    };

    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setDeletingProduct(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'stock' || name === 'minStock' || name === 'costPrice' || name === 'retailPrice' || name === 'wholesalePrice' || name === 'purchasePrice' ? Number(value) : value
        }));
    };

    const handleRestockChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        if (name === 'supplierId') {
            // Find the supplier name based on the selected ID
            const selectedSupplier = suppliers.find((supplier: any) => supplier.id === value);
            setRestockData(prev => ({
                ...prev,
                supplierId: value,
            }));
            return;
        }
        
        const numValue = Number(value);
        
        setRestockData(prev => {
            const updatedData = {
                ...prev,
                [name]: name === 'quantity' || name === 'unitCost' || name === 'totalCost' ? numValue : value
            };
            
            // Auto-calculate total cost based on quantity and unit cost
            if (name === 'quantity' || name === 'unitCost') {
                const quantity = name === 'quantity' ? numValue : prev.quantity;
                const unitCost = name === 'unitCost' ? numValue : prev.unitCost;
                updatedData.totalCost = quantity * unitCost;
            }
            
            // Auto-calculate unit cost based on total cost and quantity
            if (name === 'totalCost') {
                updatedData.unitCost = prev.quantity > 0 ? numValue / prev.quantity : 0;
            }
            
            return updatedData;
        });
    };

    // Fonction pour calculer la marge bénéficiaire
    const calculateProfitMargin = (costPrice: number, retailPrice: number) => {
        if (costPrice <= 0) return 0;
        return ((retailPrice - costPrice) / costPrice) * 100;
    };

    // Fonction pour obtenir la couleur de la marge en fonction de sa valeur
    const getMarginColor = (margin: number) => {
        if (margin >= 50) return 'text-green-600';
        if (margin >= 20) return 'text-yellow-600';
        return 'text-red-600';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Ajouter les champs requis manquants
        const productData: any = {
            ...formData,
            businessId: business.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            // Champs optionnels avec valeurs par défaut
            sku: undefined,
            barcode: undefined,
            images: undefined
        };
        
        if (editingProduct) {
            // Update existing product
            await updateProductMutation.mutateAsync({ 
                id: editingProduct.id, 
                data: productData 
            });
        } else {
            // Create new product
            await createProductMutation.mutateAsync({ 
                businessId: business.id, 
                data: productData 
            });
        }
        
        handleCloseModal();
    };

    const handleRestockSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (restockingProduct) {
            await restockProductMutation.mutateAsync({ 
                id: restockingProduct.id, 
                quantity: restockData.quantity,
                cost: restockData.totalCost, // Pass total cost instead of unit cost
                supplierId: restockData.supplierId || undefined // Pass supplierId if available
            });
        }
        
        handleCloseRestockModal();
    };

    const handleDeleteProduct = async () => {
        if (deletingProduct) {
            try {
                await deleteProductMutation.mutateAsync(deletingProduct.id);
                handleCloseDeleteModal();
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };

    const columns = [
        { header: 'Nom', accessor: 'name' },
        { header: 'Catégorie', accessor: 'category' },
        { 
            header: 'Stock', 
            accessor: 'stock',
            render: (item: Product) => (
                <div className="flex items-center">
                    <span className={item.stock < item.minStock ? "text-red-600 font-bold" : ""}>
                        {item.stock}
                    </span>
                    {item.stock < item.minStock && (
                        <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                            Faible
                        </span>
                    )}
                </div>
            )
        },
        { 
            header: 'Prix d\'Achat', 
            accessor: 'costPrice',
            render: (item: Product) => `${item.costPrice.toLocaleString('fr-FR')} FCFA`
        },
        { 
            header: 'Prix Détail', 
            accessor: 'retailPrice',
            render: (item: Product) => `${item.retailPrice.toLocaleString('fr-FR')} FCFA`
        },
        { 
            header: 'Prix Gros', 
            accessor: 'wholesalePrice',
            render: (item: Product) => `${item.wholesalePrice.toLocaleString('fr-FR')} FCFA`
        },
        { 
            header: 'Marge', 
            accessor: 'costPrice',
            render: (item: Product) => {
                const margin = calculateProfitMargin(item.costPrice || 0, item.retailPrice);
                return (
                    <span className={getMarginColor(margin)}>
                        {margin.toFixed(1)}%
                    </span>
                );
            }
        },
        {
            header: 'Actions',
            accessor: 'id',
            render: (item: Product) => (
                <div className="flex space-x-2">
                    <Button 
                        variant="secondary"
                        onClick={() => handleOpenModal(item)}
                        className="p-2"
                        aria-label="Modifier"
                    >
                        <Edit size={16} />
                    </Button>
                    <Button 
                        onClick={() => handleOpenRestockModal(item)}
                        className="p-2"
                        aria-label="Réapprovisionner"
                    >
                        <PackagePlus size={16} />
                    </Button>
                    {currentUser?.role === 'ADMIN' && (
                        <Button 
                            variant="danger"
                            onClick={() => handleOpenDeleteModal(item)}
                            className="p-2"
                            aria-label="Supprimer"
                        >
                            <Trash2 size={16} />
                        </Button>
                    )}
                </div>
            )
        }
    ] as any;

    if (isLoading || isSuppliersLoading) {
        return (
            <div className="flex w-full h-screen flex-col justify-center items-center  space-y-4">
                <div className="flex items-center space-x-4 p-6">
                    <div className="relative">
                        <div className="w-12 h-12 border-4 border-orange-200 rounded-full"></div>
                        <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                    </div>
                    <div className="space-y-2">
                        <p className="font-semibold text-gray-800">Produits</p>
                        <p className="text-sm text-gray-600 animate-pulse">Chargement en cours...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Produits - {business.name}</h1>
                <Button onClick={() => handleOpenModal()}>Ajouter un Produit</Button>
            </div>
            
            <Table 
                columns={columns} 
                data={products} 
            />
            
            <Modal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal} 
                title={editingProduct ? "Modifier le Produit" : "Ajouter un Produit"}
            >
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
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                        <input
                            type="text"
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                            <input
                                type="number"
                                id="stock"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                required
                                min="0"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="minStock" className="block text-sm font-medium text-gray-700 mb-1">Stock Minimum</label>
                            <input
                                type="number"
                                id="minStock"
                                name="minStock"
                                value={formData.minStock}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                min="0"
                            />
                            <p className="mt-1 text-sm text-gray-500">Alerte envoyée lorsque le stock descend en dessous de cette valeur</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="costPrice" className="block text-sm font-medium text-gray-700 mb-1">Prix d'Achat (FCFA)</label>
                            <input
                                type="number"
                                id="costPrice"
                                name="costPrice"
                                value={formData.costPrice}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                min="0"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="retailPrice" className="block text-sm font-medium text-gray-700 mb-1">Prix Détail (FCFA)</label>
                            <input
                                type="number"
                                id="retailPrice"
                                name="retailPrice"
                                value={formData.retailPrice}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                required
                                min="0"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="wholesalePrice" className="block text-sm font-medium text-gray-700 mb-1">Prix Gros (FCFA)</label>
                            <input
                                type="number"
                                id="wholesalePrice"
                                name="wholesalePrice"
                                value={formData.wholesalePrice}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                required
                                min="0"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="supplierId" className="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
                        <select
                            id="supplierId"
                            name="supplierId"
                            value={formData.supplierId || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="">Sélectionner un fournisseur</option>
                            {suppliers.map((supplier: any) => (
                                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button variant="secondary" onClick={handleCloseModal}>Annuler</Button>
                        <Button type="submit">{editingProduct ? "Mettre à jour" : "Ajouter"}</Button>
                    </div>
                </form>
            </Modal>
            
            <Modal 
                isOpen={isRestockModalOpen} 
                onClose={handleCloseRestockModal} 
                title="Réapprovisionner le Produit"
            >
                <form onSubmit={handleRestockSubmit} className="space-y-4">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold">{restockingProduct?.name}</h3>
                        <p className="text-gray-600">Stock actuel: {restockingProduct?.stock}</p>
                    </div>
                    
                    <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Quantité à ajouter</label>
                        <input
                            type="number"
                            id="quantity"
                            name="quantity"
                            value={restockData.quantity}
                            onChange={handleRestockChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                            min="1"
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="unitCost" className="block text-sm font-medium text-gray-700 mb-1">Coût unitaire (FCFA)</label>
                        <input
                            type="number"
                            id="unitCost"
                            name="unitCost"
                            value={restockData.unitCost}
                            onChange={handleRestockChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                            min="0"
                            step="0.01"
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="totalCost" className="block text-sm font-medium text-gray-700 mb-1">Coût total (FCFA)</label>
                        <input
                            type="number"
                            id="totalCost"
                            name="totalCost"
                            value={restockData.totalCost}
                            onChange={handleRestockChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                            min="0"
                            step="0.01"
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="supplierId" className="block text-sm font-medium text-gray-700 mb-1">Fournisseur (optionnel)</label>
                        <select
                            id="supplierId"
                            name="supplierId"
                            value={restockData.supplierId || ''}
                            onChange={handleRestockChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="">Sélectionner un fournisseur</option>
                            {suppliers.map((supplier: any) => (
                                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                                ))}
                        </select>
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button variant="secondary" onClick={handleCloseRestockModal}>Annuler</Button>
                        <Button type="submit">Réapprovisionner</Button>
                    </div>
                </form>
            </Modal>
            
            <Modal 
                isOpen={isDeleteModalOpen} 
                onClose={handleCloseDeleteModal} 
                title="Confirmer la suppression"
            >
                <div className="space-y-4">
                    <p>Êtes-vous sûr de vouloir supprimer le produit "{deletingProduct?.name}" ? Cette action est irréversible.</p>
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button variant="secondary" onClick={handleCloseDeleteModal}>Annuler</Button>
                        <Button variant="danger" onClick={handleDeleteProduct}>Supprimer</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};