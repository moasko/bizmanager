"use client";

import React, { useState, useMemo } from 'react';
import type { Business, Sale, Product, Client } from '@/types';
import { Button } from '../shared/Button';
import { Modal } from '../shared/Modal';
import { Table } from '../shared/Table';
import { useSales, useCreateSale, useUpdateSale, useDeleteSale } from '@/hooks/useSale';
import { useProducts } from '@/hooks/useProduct';
import { useClients } from '@/hooks/useClient';
import { Plus, Trash2, Printer, Search, Filter, X, ShoppingCart, Users, TrendingUp, DollarSign, Calendar, User } from 'lucide-react';
import { Receipt } from './Receipt';
import { useAuth } from '@/contexts/AuthContext';

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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Sale; direction: 'asc' | 'desc' } | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [formData, setFormData] = useState<{
    date: string;
    clientId: string;
    clientName: string;
    saleType: 'RETAIL' | 'WHOLESALE';
    lineItems: SaleLineItem[];
  }>({ 
    date: new Date().toISOString().split('T')[0], 
    clientId: '', 
    clientName: '', 
    saleType: 'RETAIL',
    lineItems: [{
      id: Date.now().toString(),
      productId: '',
      productName: '',
      quantity: 1,
      unitPrice: 0
    }]
  });

  // État pour gérer l'affichage des détails de la vente
  const [showSaleDetails, setShowSaleDetails] = useState(false);
  const [selectedSaleGroup, setSelectedSaleGroup] = useState<Sale[] | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Utiliser le contexte d'authentification pour vérifier le rôle
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';

  // Utiliser useMemo pour s'assurer que les données sont rechargées lorsque l'entreprise change
  const businessId = useMemo(() => business.id, [business.id]);
    
  const { data: sales = [], isLoading: salesLoading } = useSales(businessId);
  const { data: products = [], isLoading: productsLoading } = useProducts(businessId);
  const { data: clients = [], isLoading: clientsLoading } = useClients(businessId);
  const createSaleMutation = useCreateSale();
  const updateSaleMutation = useUpdateSale();
  const deleteSaleMutation = useDeleteSale();
  
  // Convert database sale objects to Sale type
  const formattedSales: Sale[] = useMemo(() => {
        return sales.map((sale: any) => ({
            ...sale,
            date: typeof sale.date === 'string' ? sale.date : sale.date.toISOString().split('T')[0],
            saleType: sale.saleType as 'RETAIL' | 'WHOLESALE'
        }));
    }, [sales]);

    const handleOpenModal = () => {
        setFormData({ 
            date: new Date().toISOString().split('T')[0], 
            clientId: '', 
            clientName: '', 
            saleType: "RETAIL",
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
    
    const handleOpenEditModal = (sale: Sale) => {
      setEditingSale(sale);
      setIsEditModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedSaleGroup(null);
        setShowSaleDetails(false);
    };
    
    const handleCloseEditModal = () => {
      setIsEditModalOpen(false);
      setEditingSale(null);
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
        const client = clients.find((c: any) => c.id === clientId);
        if (client) {
            setFormData(prev => ({
                ...prev,
                clientId,
                clientName: client.name
            }));
        }
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
        const product = products.find((p: any) => p.id === productId);
        if (product) {
            updateLineItem(lineItemId, 'productId', productId);
            updateLineItem(lineItemId, 'productName', product.name);
            updateLineItem(lineItemId, 'unitPrice', 
                formData.saleType === 'WHOLESALE' ? product.wholesalePrice : product.retailPrice
            );
            
            // Mettre à jour automatiquement la quantité si le stock est inférieur à 1
            if (product.stock < 1) {
                updateLineItem(lineItemId, 'quantity', 0);
            }
        }
    };

    // Fonction pour calculer le total d'une ligne de vente
    const calculateLineTotal = (quantity: number, unitPrice: number) => {
        return quantity * unitPrice;
    };

    // Fonction pour calculer le total de la vente
    const calculateSaleTotal = () => {
        return formData.lineItems.reduce((total, item) => {
            return total + calculateLineTotal(item.quantity, item.unitPrice);
        }, 0);
    };

    // Fonction pour vérifier la disponibilité du stock
    const checkStockAvailability = (productId: string, quantity: number) => {
        const product = products.find((p: any) => p.id === productId);
        if (product) {
            return product.stock >= quantity;
        }
        return false;
    };

    // Fonction pour obtenir la couleur en fonction de la disponibilité du stock
    const getStockColor = (productId: string, quantity: number) => {
        const product = products.find((p: any) => p.id === productId);
        if (product) {
            if (product.stock >= quantity) {
                return 'text-green-600';
            } else if (product.stock > 0) {
                return 'text-yellow-600';
            } else {
                return 'text-red-600';
            }
        }
        return '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate form based on sale type
        if (formData.saleType === 'WHOLESALE' && !formData.clientId) {
            alert('Veuillez sélectionner un client pour les ventes en gros');
            return;
        }
        
        // Validate line items
        for (const item of formData.lineItems) {
            if (!item.productId || item.quantity <= 0 || item.unitPrice <= 0) {
                alert('Veuillez remplir tous les champs des produits');
                return;
            }
            
            // Vérifier la disponibilité du stock
            if (!checkStockAvailability(item.productId, item.quantity)) {
                const product = products.find((p: any) => p.id === item.productId);
                if (product) {
                    alert(`Stock insuffisant pour le produit ${product.name}. Stock disponible : ${product.stock}`);
                    return;
                }
            }
        }
        
        // Create separate sales for each line item
        for (const item of formData.lineItems) {
            const total = item.quantity * item.unitPrice;
            
            // Trouver le produit pour obtenir son prix d'achat (costPrice ou wholesalePrice)
            const product = products.find((p: any) => p.id === item.productId);
            const costPrice = product ? (product.costPrice > 0 ? product.costPrice : product.wholesalePrice) : 0;
            
            // Calculer le profit correctement : Profit = Total - (Coût unitaire * Quantité)
            const profit = total - (costPrice * item.quantity);
            
            // Préparer les données pour la vente (sans les champs gérés par le serveur)
            const saleData = { 
                date: formData.date,
                clientId: formData.clientId || null,
                productId: item.productId,
                productName: item.productName,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                discount: 0,
                tax: 0,
                total,
                profit,
                saleType: formData.saleType,
                paymentStatus: 'PAID' as const,
                paymentMethod: 'CASH' as const,
                userId: undefined
            };
            
            console.log('Tentative de création de vente avec les données:', { businessId: business.id, data: saleData });
            
            try {
                const result = await createSaleMutation.mutateAsync({ 
                    businessId: business.id, 
                    data: saleData
                });
                console.log('Vente créée avec succès:', result);
            } catch (error) {
                console.error('Erreur lors de la création de la vente:', error);
                alert('Erreur lors de la création de la vente. Veuillez réessayer.');
                return;
            }
        }
        
        // Fermer le modal et rafraîchir les données
        handleCloseModal();
    };
    
    const handlePrintReceipt = (saleId: string) => {
        // Trouver la vente correspondante
        const sale = sales.find(s => s.id === saleId);
        if (!sale) return;
        
        // Trouver toutes les ventes du même groupe (même date et client)
        const saleGroupKey = `${sale.date}-${sale.clientId}`;
        const saleGroup = Object.values(groupedSales).find(group => 
            group.some(s => `${s.date}-${s.clientId}` === saleGroupKey)
        ) || [sale];
        
        setSelectedSaleGroup(saleGroup as Sale[]);
        setShowSaleDetails(true);
    };
    
    // Regrouper les ventes par date et client pour créer des reçus
    const groupedSales = useMemo(() => {
        return formattedSales.reduce((acc: Record<string, Sale[]>, sale) => {
            const key = `${sale.date}-${sale.clientId}`;
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(sale);
            return acc;
        }, {});
    }, [formattedSales]);
    
    // Fonction pour filtrer les ventes par date et par terme de recherche
    const filteredSales = useMemo(() => {
    let filtered = formattedSales;
    
    // Filtrer par date
    if (startDate || endDate) {
      filtered = filtered.filter(sale => {
        const saleDate = new Date(sale.date);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        
        if (start && saleDate < start) return false;
        if (end && saleDate > end) return false;
        return true;
      });
    }
    
    // Filtrer par terme de recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(sale => 
        (sale.clientName && sale.clientName.toLowerCase().includes(term)) ||
        (sale.productName && sale.productName.toLowerCase().includes(term)) ||
        sale.total.toString().includes(term) ||
        sale.date.includes(term)
      );
    }
    
    return filtered;
  }, [formattedSales, startDate, endDate, searchTerm]);
    
    // Fonction de tri appliquée aux ventes filtrées
    const sortedAndFilteredSales = useMemo(() => {
        if (!sortConfig) return filteredSales;
        
        return [...filteredSales].sort((a, b) => {
            if (!sortConfig) return 0;
            
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];
            
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
    }, [filteredSales, sortConfig]);
    
    // Calcul des statistiques
    const totalSales = sortedAndFilteredSales.reduce((sum, sale) => sum + sale.total, 0);
    const averageSale = sortedAndFilteredSales.length > 0 ? Math.round(totalSales / sortedAndFilteredSales.length) : 0;
    const uniqueClients = [...new Set(sortedAndFilteredSales.map(sale => sale.clientId))].filter(id => id).length;
    
    // Colonnes du tableau
  const columns = useMemo(() => {
    const baseColumns = [
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
        sortable: true,
        render: (item: Sale) => (
          <span className={getStockColor(item.productId || '', item.quantity)}>
            {item.quantity}
          </span>
        )
      },
      { 
        header: 'Prix Unitaire', 
        accessor: 'unitPrice' as keyof Sale,
        sortable: true,
        render: (item: Sale) => `${item.unitPrice.toLocaleString('fr-FR')} FCFA`
      },
      { 
        header: 'Total', 
        accessor: 'total' as keyof Sale,
        sortable: true,
        render: (item: Sale) => (
          <span className="font-semibold text-gray-900">
            {item.total.toLocaleString('fr-FR')} FCFA
          </span>
        )
      },
      { 
        header: 'Type', 
        accessor: 'saleType' as keyof Sale,
        sortable: true,
        render: (item: Sale) => (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            item.saleType === 'RETAIL' 
              ? 'bg-orange-100 text-orange-800' 
              : 'bg-purple-100 text-purple-800'
          }`}>
            {item.saleType === 'RETAIL' ? 'Détail' : 'Gros'}
          </span>
        )
      }
    ];

    // Ajouter la colonne Actions seulement pour les administrateurs
    if (isAdmin) {
      baseColumns.push({
        header: 'Actions',
        accessor: 'id' as keyof Sale,
        sortable: false,
        render: (item: Sale) => (
          <div className="flex space-x-1">
            <button
              onClick={() => handleOpenEditModal(item)}
              className="inline-flex items-center p-2 rounded-lg text-orange-600 hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200"
              title="Éditer"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </button>
            <button
              onClick={() => handleDeleteSale(item.id)}
              className="inline-flex items-center p-2 rounded-lg text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
              title="Supprimer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => handlePrintReceipt(item.id)}
              className="inline-flex items-center p-2 rounded-lg text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
              title="Détails"
            >
              <Printer className="h-4 w-4" />
            </button>
          </div>
        )
      });
    } else {
      // Pour les non-administrateurs, afficher uniquement le bouton Détails
      baseColumns.push({
        header: 'Actions',
        accessor: 'id' as keyof Sale,
        sortable: false,
        render: (item: Sale) => (
          <div className="flex space-x-1">
            <button
              onClick={() => handlePrintReceipt(item.id)}
              className="inline-flex items-center p-2 rounded-lg text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
              title="Détails"
            >
              <Printer className="h-4 w-4" />
            </button>
          </div>
        )
      });
    }

    return baseColumns;
  }, [products, isAdmin]);
    
    // Fonction pour gérer le tri
    const handleSort = (key: keyof Sale) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };
    
    const handleEditSale = async (updatedSale: Partial<Sale>) => {
      if (!editingSale) return;
      
      try {
        await updateSaleMutation.mutateAsync({ 
          id: editingSale.id, 
          data: updatedSale 
        });
        handleCloseEditModal();
      } catch (error) {
        console.error('Error updating sale:', error);
        alert('Erreur lors de la mise à jour de la vente');
      }
    };
    
    const handleDeleteSale = async (saleId: string) => {
      if (window.confirm('Êtes-vous sûr de vouloir supprimer cette vente ?')) {
        try {
          await deleteSaleMutation.mutateAsync(saleId);
        } catch (error) {
          console.error('Error deleting sale:', error);
          alert('Erreur lors de la suppression de la vente');
        }
      }
    };
    
    if (salesLoading || productsLoading || clientsLoading) {
        return (
          <div className="flex w-full h-screen flex-col justify-center items-center space-y-4">
            <div className="flex items-center space-x-4 p-6">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-orange-200 rounded-full"></div>
                <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-gray-800">Ventes</p>
                <p className="text-sm text-gray-600 animate-pulse">Chargement en cours...</p>
              </div>
            </div>
          </div>
        );
    }

    return (
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Gestion des Ventes</h1>
              <p className="text-gray-600 mt-1">{business.name}</p>
            </div>
            <Button 
              onClick={handleOpenModal} 
              className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-medium py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center"
            >
              <Plus size={20} className="mr-2" />
              Nouvelle Vente
            </Button>
          </div>
          
          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-orange-50">
                  <DollarSign className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total des ventes</p>
                  <p className="text-xl font-bold text-gray-900">
                    {totalSales.toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-50">
                  <ShoppingCart className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Nombre de ventes</p>
                  <p className="text-xl font-bold text-gray-900">{sortedAndFilteredSales.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-amber-50">
                  <Users className="h-6 w-6 text-amber-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Clients uniques</p>
                  <p className="text-xl font-bold text-gray-900">{uniqueClients}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-50">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Moyenne par vente</p>
                  <p className="text-xl font-bold text-gray-900">
                    {averageSale.toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Barre de recherche et filtres */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Barre de recherche */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Rechercher par client, produit, montant..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
              </div>
              
              {/* Bouton filtre */}
              <div className="flex gap-3">
                <Button 
                  variant="secondary"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filtres
                  {(startDate || endDate) && (
                    <span className="bg-orange-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                      1
                    </span>
                  )}
                </Button>
                
                {(startDate || endDate || searchTerm) && (
                  <Button 
                    variant="secondary"
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                      setSearchTerm('');
                      setSortConfig(null);
                    }}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Réinitialiser
                  </Button>
                )}
              </div>
            </div>
            
            {/* Filtres avancés */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Date de début
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Date de fin
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <div className="text-sm text-gray-500">
                      {sortedAndFilteredSales.length} vente{sortedAndFilteredSales.length > 1 ? 's' : ''} trouvée{sortedAndFilteredSales.length > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Tableau des ventes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <Table 
                columns={columns} 
                data={sortedAndFilteredSales} 
                onSort={handleSort}
                sortConfig={sortConfig}
              />
            </div>
          </div>
          
          {/* Modal pour afficher les détails de la vente */}
          <Modal 
              isOpen={showSaleDetails} 
              onClose={handleCloseModal} 
              title="Détails de la Vente"
          >
              {selectedSaleGroup && (
                  <Receipt 
                      sales={selectedSaleGroup} 
                      client={clients.find(c => c.id === selectedSaleGroup[0].clientId) as unknown as Client || null} 
                      products={products as unknown as Product[]} 
                      businessName={business.name} 
                  />
              )}
          </Modal>
          
          {/* Modal Nouvelle Vente */}
          <Modal 
            isOpen={isModalOpen} 
            onClose={handleCloseModal} 
            title="Nouvelle Vente"
            size="xl"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-sm"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type de Vente</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, saleType: 'RETAIL' }))}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        formData.saleType === 'RETAIL'
                          ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-md'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-orange-300'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <span className="font-semibold">Détail</span>
                        <span className="text-xs opacity-80">Comptoir</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, saleType: 'WHOLESALE' }))}
                      className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        formData.saleType === 'WHOLESALE'
                          ? 'bg-gradient-to-r from-purple-600 to-orange-700 text-white shadow-md'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <span className="font-semibold">Gros</span>
                        <span className="text-xs opacity-80">Client</span>
                      </div>
                    </button>
                  </div>
                </div>
                
                <div className="md:col-span-3">
                  <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {formData.saleType === 'WHOLESALE' ? 'Client *' : 'Client (optionnel)'}
                  </label>
                  <div className="relative">
                    <select
                      id="clientId"
                      name="clientId"
                      value={formData.clientId}
                      onChange={handleClientChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-sm appearance-none"
                      required={formData.saleType === 'WHOLESALE'}
                    >
                      <option value="">Sélectionner un client</option>
                      {clients.map((client: any) => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Produits</h3>
                  <button 
                    type="button" 
                    onClick={addLineItem} 
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Ajouter un produit
                  </button>
                </div>
                
                <div className="space-y-4">
                  {formData.lineItems.map((item, index) => {
                    const product = item.productId ? products.find(p => p.id === item.productId) : null;
                    return (
                      <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div className="md:col-span-5">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Produit</label>
                          <select
                            value={item.productId}
                            onChange={(e) => handleProductChange(item.id, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                            required
                          >
                            <option value="">Sélectionner un produit</option>
                            {products.map((product: any) => (
                              <option key={product.id} value={product.id}>
                                {product.name}
                              </option>
                            ))}
                          </select>
                          {product && (
                            <div className="mt-2 text-xs text-gray-500">
                              <div className="flex justify-between">
                                <span>Prix détail:</span>
                                <span className="font-medium">{product.retailPrice.toLocaleString('fr-FR')} FCFA</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Prix gros:</span>
                                <span className="font-medium">{product.wholesalePrice.toLocaleString('fr-FR')} FCFA</span>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Quantité</label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 ${
                              getStockColor(item.productId, item.quantity) === 'text-red-600' 
                                ? 'border-red-500 bg-red-50' 
                                : getStockColor(item.productId, item.quantity) === 'text-yellow-600' 
                                  ? 'border-yellow-500 bg-yellow-50' 
                                  : 'border-gray-300'
                            }`}
                            min="1"
                            required
                          />
                          {product && (
                            <div className="mt-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Stock:</span>
                                <span className={`font-medium ${getStockColor(item.productId, item.quantity)}`}>
                                  {product.stock}
                                </span>
                              </div>
                              {getStockColor(item.productId, item.quantity) === 'text-red-600' && (
                                <p className="text-xs text-red-600 font-medium mt-1">
                                  Stock épuisé!
                                </p>
                              )}
                              {getStockColor(item.productId, item.quantity) === 'text-yellow-600' && (
                                <p className="text-xs text-yellow-600 font-medium mt-1">
                                  Stock faible
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="md:col-span-3">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Prix Unitaire (FCFA)
                          </label>
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => updateLineItem(item.id, 'unitPrice', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                            min="0"
                            required
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Total ligne: <span className="font-medium">
                              {calculateLineTotal(item.quantity, item.unitPrice).toLocaleString('fr-FR')} FCFA
                            </span>
                          </p>
                        </div>
                        
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => removeLineItem(item.id)}
                            disabled={formData.lineItems.length <= 1}
                            className="w-10 h-10 flex justify-center items-center bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Récapitulatif</h3>
                    <p className="text-sm text-gray-600">
                      {formData.lineItems.length} produit{formData.lineItems.length > 1 ? 's' : ''} dans cette vente
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {calculateSaleTotal().toLocaleString('fr-FR')} FCFA
                      </p>
                    </div>
                    
                    <div className="flex gap-3">
                      <button 
                        type="button" 
                        onClick={handleCloseModal}
                        className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg shadow-sm hover:bg-gray-50 transition-all duration-300"
                      >
                        Annuler
                      </button>
                      <button 
                        type="submit" 
                        className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                      >
                        Enregistrer la Vente
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </Modal>
          
          {/* Modal pour éditer une vente */}
          <Modal 
            isOpen={isEditModalOpen} 
            onClose={handleCloseEditModal} 
            title="Modifier une Vente"
            size="lg"
          >
            {editingSale && (
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);
                const updatedSale = {
                  clientId: formData.get('clientId') as string,
                  productName: formData.get('productName') as string,
                  quantity: parseInt(formData.get('quantity') as string),
                  unitPrice: parseInt(formData.get('unitPrice') as string),
                  total: parseInt(formData.get('total') as string),
                  saleType: formData.get('saleType') as 'RETAIL' | 'WHOLESALE'
                };
                handleEditSale(updatedSale);
              }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="edit-date" className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      id="edit-date"
                      name="date"
                      defaultValue={editingSale.date}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-sm"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-clientId" className="block text-sm font-medium text-gray-700 mb-2">Client</label>
                    <select
                      id="edit-clientId"
                      name="clientId"
                      defaultValue={editingSale.clientId || ''}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-sm"
                    >
                      <option value="">Sélectionner un client</option>
                      {clients.map((client: any) => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="edit-productName" className="block text-sm font-medium text-gray-700 mb-2">Produit</label>
                    <input
                      type="text"
                      id="edit-productName"
                      name="productName"
                      defaultValue={editingSale.productName}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-sm"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-quantity" className="block text-sm font-medium text-gray-700 mb-2">Quantité</label>
                    <input
                      type="number"
                      id="edit-quantity"
                      name="quantity"
                      defaultValue={editingSale.quantity}
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-sm"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-unitPrice" className="block text-sm font-medium text-gray-700 mb-2">Prix Unitaire</label>
                    <input
                      type="number"
                      id="edit-unitPrice"
                      name="unitPrice"
                      defaultValue={editingSale.unitPrice}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-sm"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-total" className="block text-sm font-medium text-gray-700 mb-2">Total</label>
                    <input
                      type="number"
                      id="edit-total"
                      name="total"
                      defaultValue={editingSale.total}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-sm"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="edit-saleType" className="block text-sm font-medium text-gray-700 mb-2">Type de Vente</label>
                    <select
                      id="edit-saleType"
                      name="saleType"
                      defaultValue={editingSale.saleType}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 shadow-sm"
                      required
                    >
                      <option value="RETAIL">Détail</option>
                      <option value="WHOLESALE">Gros</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-4 pt-6">
                  <button 
                    type="button" 
                    onClick={handleCloseEditModal}
                    className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg shadow-sm hover:bg-gray-50 transition-all duration-300"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    Mettre à jour
                  </button>
                </div>
              </form>
            )}
          </Modal>
        </div>
    );
};