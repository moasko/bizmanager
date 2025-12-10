"use client";

import React, { useState, useMemo } from 'react';
import type { Business, Product, Supplier, User } from '@/types';
import { Button } from '../shared/Button';
import { Modal } from '../shared/Modal';
import { Table } from '../shared/Table';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useProduct';
import { useRestockProduct } from '@/hooks/useRestock';
import { useSuppliers } from '@/hooks/useSupplier';
import { useAuth } from '@/contexts/AuthContext';
import { Edit, PackagePlus, Trash2 } from 'lucide-react';
import { ProductForm } from './ProductForm';

interface ProductsProps {
    business: Business;
    onAddProduct: (newProduct: Product) => void;
    onUpdateProduct: (updatedProduct: Product) => void;
}

// Define a type for the form data that omits certain fields from Product
type ProductFormData = Omit<Product, 'id' | 'businessId' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'sku' | 'barcode' | 'images'>;

export const Products: React.FC<ProductsProps> = ({ business, onAddProduct, onUpdateProduct }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
    const [restockingProduct, setRestockingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState<ProductFormData>({ 
        name: '', 
        description: '',
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
    
    // États pour la pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10); // Nombre d'éléments par page
    
    // État pour la recherche
    const [searchTerm, setSearchTerm] = useState('');

    const { currentUser } = useAuth();
    
    // Déplacer tous les hooks avant les conditions
    // Utiliser useMemo pour s'assurer que les données sont rechargées lorsque l'entreprise change
    const businessId = useMemo(() => business.id, [business.id]);
    
    const { data: products = [], isLoading } = useProducts(businessId);
    const { data: suppliers = [], isLoading: isSuppliersLoading } = useSuppliers(businessId);
    const createProductMutation = useCreateProduct();
    const updateProductMutation = useUpdateProduct();
    const deleteProductMutation = useDeleteProduct();
    const restockProductMutation = useRestockProduct();
    
    // État pour les images
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    
    // Déplacer les hooks useMemo après tous les hooks de données
    // Filtrer les produits en fonction du terme de recherche
    const filteredProducts = useMemo(() => {
        if (!searchTerm) return products;
        
        const term = searchTerm.toLowerCase().trim();
        return products.filter(product => 
            product?.name?.toLowerCase().includes(term) ||
            (product as any)?.description?.toLowerCase().includes(term) ||
            product?.category?.toLowerCase().includes(term) ||
            product?.id?.toLowerCase().includes(term)
        );
    }, [products, searchTerm]);
    
    // Recalculer les produits paginés en fonction des produits filtrés
    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredProducts.slice(startIndex, endIndex);
    }, [filteredProducts, currentPage, itemsPerPage]);
    
    // Recalculer le nombre total de pages en fonction des produits filtrés
    const totalPages = useMemo(() => {
        return Math.ceil(filteredProducts.length / itemsPerPage);
    }, [filteredProducts.length, itemsPerPage]);
    
    // Fonction pour recalculer la valeur du stock en temps réel
    const calculateStockValue = useMemo(() => {
        return products.reduce((sum, product) => sum + (product.stock * product.wholesalePrice), 0);
    }, [products]);
    
    // Gestion des images
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setSelectedImages(files);
            
            // Créer des aperçus pour l'affichage
            const previews = files.map(file => URL.createObjectURL(file));
            setImagePreviews(previews);
        }
    };
    
    // Fonction pour changer de page
    const goToPage = (page: number) => {
        setCurrentPage(page);
    };
    
    // Fonction pour aller à la page suivante
    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };
    
    // Fonction pour aller à la page précédente
    const goToPrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleOpenModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                description: product.description || '',
                category: product.category,
                stock: product.stock,
                minStock: product.minStock || 0,
                costPrice: product.costPrice || 0,
                retailPrice: product.retailPrice,
                wholesalePrice: product.wholesalePrice,
                purchasePrice: product.purchasePrice || 0,
                supplierId: product.supplierId ?? undefined,
            });
            
            // Charger les images existantes si elles existent
            if (product.images && Array.isArray(product.images)) {
                setImagePreviews(product.images);
            } else {
                setImagePreviews([]);
            }
        } else {
            setEditingProduct(null);
            setFormData({ 
                name: '', 
                description: '',
                category: '', 
                stock: 0,
                minStock: 0,
                costPrice: 0,
                retailPrice: 0, 
                wholesalePrice: 0,
                purchasePrice: 0,
                supplierId: undefined,
            });
            setImagePreviews([]);
            setSelectedImages([]);
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
        setImagePreviews([]);
        setSelectedImages([]);
    };

    const handleCloseRestockModal = () => {
        setIsRestockModalOpen(false);
        setRestockingProduct(null);
    };

    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setDeletingProduct(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev: ProductFormData) => ({
            ...prev,
            [name]: name === 'stock' || name === 'minStock' || name === 'costPrice' || name === 'retailPrice' || name === 'wholesalePrice' || name === 'purchasePrice' ? Number(value) : value
        }));
    };

    const handleRestockChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        if (name === 'supplierId') {
            // Find the supplier name based on the selected ID
            const selectedSupplier = suppliers.find((supplier: Supplier) => supplier.id === value);
            setRestockData(prev => ({
                ...prev,
                supplierId: value,
            }));
            return;
        }
        
        const numValue = Number(value);
        
        setRestockData((prev: any) => {
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

    const handleSubmit = async (productData: ProductFormData & { images?: string[] }) => {
        // Ajouter les champs requis manquants
        let completeProductData: any = {
            ...productData,
            businessId: business.id,
            createdAt: new Date(), // Use Date object instead of string
            updatedAt: new Date(), // Use Date object instead of string
            // Champs optionnels avec valeurs par défaut
            sku: undefined,
            barcode: undefined,
            images: productData.images && productData.images.length > 0 ? productData.images : undefined
        };
        
        // Pour les non-administrateurs, exclure le prix d'achat
        if (currentUser?.role !== 'ADMIN') {
            const { costPrice, ...filteredData } = completeProductData;
            completeProductData = filteredData;
        }
        
        if (editingProduct) {
            // Update existing product
            await updateProductMutation.mutateAsync({ 
                id: editingProduct.id, 
                data: completeProductData 
            });
        } else {
            // Create new product
            await createProductMutation.mutateAsync({ 
                businessId: business.id, 
                data: completeProductData 
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
        { 
            header: 'Produit', 
            accessor: 'name',
            render: (item: Product) => (
                <div className="flex items-center">
                    <div>
                        <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                        <div className="text-xs text-orange-400 dark:text-gray-400">{item.category}</div>
                        {item.description && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                {item.description}
                            </div>
                        )}
                    </div>
                </div>
            )
        },
        { 
            header: 'Stock', 
            accessor: 'stock',
            render: (item: Product) => (
                <div className="flex flex-col">
                    <div className={`font-medium ${item.stock < item.minStock ? "text-red-600" : "text-gray-900 dark:text-white"}`}>
                        {item.stock} unités
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        Min: {item.minStock}
                    </div>
                    {item.stock < item.minStock && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-1">
                            Stock faible
                        </span>
                    )}
                </div>
            )
        },
        // Afficher le prix d'achat et la marge uniquement pour les administrateurs
        ...(currentUser?.role === 'ADMIN' ? [
            { 
                header: 'Prix d\'Achat', 
                accessor: 'costPrice',
                render: (item: Product) => (
                    <div className="text-gray-900 dark:text-white">
                        {item.costPrice.toLocaleString('fr-FR')} <span className="text-gray-500">FCFA</span>
                    </div>
                )
            }
        ] : []),
        { 
            header: 'Prix Détail', 
            accessor: 'retailPrice',
            render: (item: Product) => (
                <div className="font-medium text-gray-900 dark:text-white">
                    {item.retailPrice.toLocaleString('fr-FR')} <span className="text-gray-500">FCFA</span>
                </div>
            )
        },
        { 
            header: 'Prix Gros', 
            accessor: 'wholesalePrice',
            render: (item: Product) => (
                <div className="text-gray-900 dark:text-white">
                    {item.wholesalePrice.toLocaleString('fr-FR')} <span className="text-gray-500">FCFA</span>
                </div>
            )
        },
        // Afficher la marge uniquement pour les administrateurs
        ...(currentUser?.role === 'ADMIN' ? [
            { 
                header: 'Marge', 
                accessor: 'costPrice',
                render: (item: Product) => {
                    const margin = calculateProfitMargin(item.costPrice || 0, item.retailPrice);
                    return (
                        <div className={`font-medium ${getMarginColor(margin)}`}>
                            {margin.toFixed(1)}%
                        </div>
                    );
                }
            }
        ] : []),
        {
            header: 'Actions',
            accessor: 'id',
            render: (item: Product) => (
                <div className="flex flex-wrap gap-2">
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
                        className="p-2 bg-amber-500 hover:bg-amber-600 text-white"
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

    // Render loading state conditionally at the end to maintain hook order consistency
    if (isLoading || isSuppliersLoading) {
        return (
            <div className="flex w-full h-screen flex-col justify-center items-center  space-y-4">
                <div className="flex items-center space-x-4 p-6">
                    <div className="relative">
                        <div className="w-12 h-12 border-4 border-orange-200 rounded-full"></div>
                        <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                    </div>
                    <div className="space-y-2">
                        <p className="font-semibold text-gray-800 dark:text-white">Produits</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 animate-pulse">Chargement en cours...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* En-tête avec recherche et bouton d'ajout */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">Gestion des Produits</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">{business.name}</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    {/* Barre de recherche responsive */}
                    <div className="relative flex-grow md:flex-grow-0">
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                    
                    <Button 
                        onClick={() => handleOpenModal()}
                        className="flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                        <PackagePlus size={18} />
                        <span>Ajouter un Produit</span>
                    </Button>
                </div>
            </div>
            
            {/* Statistiques rapides */}
            <div className={`grid gap-4 ${currentUser?.role === 'ADMIN' ? 'grid-cols-1 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-3'}`}>
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-5 text-white">
                    <h3 className="text-sm font-medium opacity-80">Total Produits</h3>
                    <p className="text-2xl font-bold mt-1">{products.length}</p>
                </div>
                
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-5 text-white">
                    <h3 className="text-sm font-medium opacity-80">Stock Total</h3>
                    <p className="text-2xl font-bold mt-1">
                        {products.reduce((sum, product) => sum + product.stock, 0)}
                    </p>
                </div>
                
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl shadow-lg p-5 text-white">
                    <h3 className="text-sm font-medium opacity-80">Stock Faible</h3>
                    <p className="text-2xl font-bold mt-1">
                        {products.filter(p => p.stock < p.minStock).length}
                    </p>
                </div>
                
                {/* Afficher la valeur du stock uniquement pour les administrateurs */}
                {currentUser?.role === 'ADMIN' && (
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-5 text-white">
                        <h3 className="text-sm font-medium opacity-80">Valeur Stock</h3>
                        <p className="text-2xl font-bold mt-1">
                            {calculateStockValue.toLocaleString('fr-FR')} FCFA
                        </p>
                    </div>
                )}
            </div>
            
            {/* Tableau des produits avec design amélioré */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <Table 
                        columns={columns} 
                        data={paginatedProducts} 
                    />
                </div>
            </div>
            
            {/* Pagination améliorée */}
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                        Affichage de {(currentPage - 1) * itemsPerPage + 1} à {Math.min(currentPage * itemsPerPage, filteredProducts.length)} sur {filteredProducts.length} produits
                        {searchTerm && ` (filtrés sur ${products.length} au total)`}
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                        <Button 
                            variant="secondary" 
                            onClick={goToPrevPage} 
                            disabled={currentPage === 1}
                            className="px-3 py-1 text-sm"
                        >
                            Précédent
                        </Button>
                        
                        {/* Afficher les numéros de page */}
                        {[...Array(totalPages)].map((_, i) => {
                            const page = i + 1;
                            // Afficher uniquement les pages autour de la page actuelle
                            if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                                return (
                                    <Button
                                        key={page}
                                        variant={currentPage === page ? "primary" : "secondary"}
                                        onClick={() => goToPage(page)}
                                        className="px-3 py-1 text-sm"
                                    >
                                        {page}
                                    </Button>
                                );
                            } else if (page === currentPage - 2 || page === currentPage + 2) {
                                // Afficher des points de suspension pour les pages éloignées
                                return (
                                    <span key={page} className="px-2 py-1 text-gray-500 dark:text-gray-400">
                                        ...
                                    </span>
                                );
                            }
                            return null;
                        })}
                        
                        <Button 
                            variant="secondary" 
                            onClick={goToNextPage} 
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 text-sm"
                        >
                            Suivant
                        </Button>
                    </div>
                </div>
            )}
            
            {/* Modal d'ajout/modification de produit avec design amélioré */}
            <Modal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal} 
                title={editingProduct ? "Modifier le Produit" : "Ajouter un Produit"}
                size="lg"
            >
                <ProductForm 
                    product={editingProduct || undefined}
                    suppliers={suppliers}
                    onSubmit={handleSubmit}
                    onCancel={handleCloseModal}
                    isSubmitting={createProductMutation.isPending || updateProductMutation.isPending}
                />
            </Modal>
            
            {/* Modal de réapprovisionnement avec design amélioré */}
            <Modal 
                isOpen={isRestockModalOpen} 
                onClose={handleCloseRestockModal} 
                title="Réapprovisionner le Produit"
                size="md"
            >
                <form onSubmit={handleRestockSubmit} className="space-y-5">
                    <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">{restockingProduct?.name}</h3>
                        <div className="flex justify-between mt-2">
                            <p className="text-blue-700 dark:text-blue-300">Stock actuel: <span className="font-bold">{restockingProduct?.stock}</span></p>
                            <p className="text-blue-700 dark:text-blue-300">Stock minimum: <span className="font-bold">{restockingProduct?.minStock}</span></p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantité à ajouter</label>
                            <input
                                type="number"
                                id="quantity"
                                name="quantity"
                                value={restockData.quantity}
                                onChange={handleRestockChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                required
                                min="1"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="unitCost" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Coût unitaire (FCFA)</label>
                            <input
                                type="number"
                                id="unitCost"
                                name="unitCost"
                                value={restockData.unitCost}
                                onChange={handleRestockChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                required
                                min="0"
                                step="0.01"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="totalCost" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Coût total (FCFA)</label>
                        <input
                            type="number"
                            id="totalCost"
                            name="totalCost"
                            value={restockData.totalCost}
                            onChange={handleRestockChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            required
                            min="0"
                            step="0.01"
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="supplierId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fournisseur (optionnel)</label>
                        <select
                            id="supplierId"
                            name="supplierId"
                            value={restockData.supplierId || ''}
                            onChange={handleRestockChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="">Sélectionner un fournisseur</option>
                            {suppliers.map((supplier: Supplier) => (
                                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-2">
                        <Button variant="secondary" onClick={handleCloseRestockModal} className="px-5 py-2">
                            Annuler
                        </Button>
                        <Button type="submit" className="px-5 py-2">
                            Réapprovisionner
                        </Button>
                    </div>
                </form>
            </Modal>
            
            {/* Modal de confirmation de suppression avec design amélioré */}
            <Modal 
                isOpen={isDeleteModalOpen} 
                onClose={handleCloseDeleteModal}    
                title="Confirmer la suppression"
                size="sm"
            >
                <div className="space-y-5">
                    <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                                    Êtes-vous sûr de vouloir supprimer ce produit ?
                                </h3>
                                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                                    <p>
                                        Vous êtes sur le point de supprimer <span className="font-bold">{deletingProduct?.name}</span>. 
                                        Cette action est irréversible.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                        <Button variant="secondary" onClick={handleCloseDeleteModal} className="px-5 py-2">
                            Annuler
                        </Button>
                        <Button variant="danger" onClick={handleDeleteProduct} className="px-5 py-2">
                            Supprimer
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
