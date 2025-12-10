"use client";

import React, { useState, useMemo } from 'react';
import type { Business, Sale, Product, Client } from '@/types';
import { Button } from '../shared/Button';
import { Modal } from '../shared/Modal';
import { Table } from '../shared/Table';
import { useSales, useCreateSale, useUpdateSale, useDeleteSale } from '@/hooks/useSale';
import { useProducts } from '@/hooks/useProduct';
import { useClients } from '@/hooks/useClient';
import { 
  Plus, 
  Trash2, 
  Printer, 
  Search, 
  Filter, 
  X, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  User,
  Edit,
  Download,
  MoreVertical,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import { Receipt } from './Receipt';
import { useAuth } from '@/contexts/AuthContext';

interface SalesProps {
  business: Business;
  onAddSale: (newSale: Sale) => void;
}

interface SaleLineItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

// Define a type for the form data
type SaleFormData = {
  date: Date; // Use Date object instead of string
  clientId: string;
  clientName: string;
  saleType: 'RETAIL' | 'WHOLESALE';
  lineItems: SaleLineItem[];
};

export const Sales: React.FC<SalesProps> = ({ business, onAddSale }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Sale; direction: 'asc' | 'desc' } | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [formData, setFormData] = useState<SaleFormData>({ 
    date: new Date(), // Use Date object instead of string
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

  const [showSaleDetails, setShowSaleDetails] = useState(false);
  const [selectedSaleGroup, setSelectedSaleGroup] = useState<Sale[] | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'retail' | 'wholesale'>('all');

  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';

  const businessId = useMemo(() => business.id, [business.id]);
    
  const { data: sales = [], isLoading: salesLoading } = useSales(businessId);
  const { data: products = [], isLoading: productsLoading } = useProducts(businessId);
  const { data: clients = [], isLoading: clientsLoading } = useClients(businessId);
  const createSaleMutation = useCreateSale();
  const updateSaleMutation = useUpdateSale();
  const deleteSaleMutation = useDeleteSale();

  // Convert database sale objects to Sale type
  const formattedSales: Sale[] = useMemo(() => {
    return sales.map((sale: any) => {
      let clientName = '';
      if (sale.clientId) {
        const client = clients.find((c: any) => c.id === sale.clientId);
        clientName = client ? client.name : '';
      }
      
      return {
        ...sale,
        date: typeof sale.date === 'string' ? new Date(sale.date) : sale.date,
        saleType: sale.saleType as 'RETAIL' | 'WHOLESALE',
        clientName: sale.clientName || clientName
      };
    });
  }, [sales, clients]);

  // Filtrage par type de vente
  const filteredSalesByType = useMemo(() => {
    switch (activeTab) {
      case 'retail':
        return formattedSales.filter(sale => sale.saleType === 'RETAIL');
      case 'wholesale':
        return formattedSales.filter(sale => sale.saleType === 'WHOLESALE');
      default:
        return formattedSales;
    }
  }, [formattedSales, activeTab]);

  const handleOpenModal = () => {
    setFormData({ 
      date: new Date(), // Use Date object instead of string
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
      [name]: name === 'date' ? new Date(value) : value // Convert date string to Date object
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
      
      if (product.stock < 1) {
        updateLineItem(lineItemId, 'quantity', 0);
      }
    }
  };

  const calculateLineTotal = (quantity: number, unitPrice: number) => {
    return quantity * unitPrice;
  };

  const calculateSaleTotal = () => {
    return formData.lineItems.reduce((total, item) => {
      return total + calculateLineTotal(item.quantity, item.unitPrice);
    }, 0);
  };

  const checkStockAvailability = (productId: string, quantity: number) => {
    const product = products.find((p: any) => p.id === productId);
    if (product) {
      return product.stock >= quantity;
    }
    return false;
  };

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

  const getStockBadge = (productId: string, quantity: number) => {
    const product = products.find((p: any) => p.id === productId);
    if (!product) return null;

    if (product.stock >= quantity) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Stock OK
        </span>
      );
    } else if (product.stock > 0) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Stock faible
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <X className="w-3 h-3 mr-1" />
          Rupture
        </span>
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.saleType === 'WHOLESALE' && !formData.clientId) {
      alert('Veuillez sélectionner un client pour les ventes en gros');
      return;
    }
    
    for (const item of formData.lineItems) {
      if (!item.productId || item.quantity <= 0 || item.unitPrice <= 0) {
        alert('Veuillez remplir tous les champs des produits');
        return;
      }
      
      if (!checkStockAvailability(item.productId, item.quantity)) {
        const product = products.find((p: any) => p.id === item.productId);
        if (product) {
          alert(`Stock insuffisant pour le produit "${product.name}". Stock disponible: ${product.stock}`);
          return;
        }
      }
    }
    
    // Process each line item as a separate sale
    for (const item of formData.lineItems) {
      const product = products.find((p: any) => p.id === item.productId);
      const costPrice = product ? (product.costPrice > 0 ? product.costPrice : product.wholesalePrice) : 0;
      
      const saleData: any = {
        reference: `SL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        date: formData.date,
        clientId: formData.clientId || null,
        clientName: formData.clientName || null,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: 0, // Valeur par défaut
        tax: 0, // Valeur par défaut
        total: item.quantity * item.unitPrice,
        profit: (item.quantity * item.unitPrice) - (item.quantity * costPrice),
        saleType: formData.saleType,
        paymentStatus: 'PAID' as const,
        paymentMethod: 'CASH' as const,
        userId: undefined
      };
      
      try {
        await createSaleMutation.mutateAsync({ 
          businessId: business.id, 
          data: saleData
        });
      } catch (error) {
        console.error('Erreur lors de la création de la vente:', error);
        alert('Erreur lors de la création de la vente. Veuillez réessayer.');
        return;
      }
    }
    
    handleCloseModal();
  };
    
  const handlePrintReceipt = (saleId: string) => {
    const sale = sales.find(s => s.id === saleId);
    if (!sale) return;
    
    const saleGroupKey = `${sale.date}-${sale.clientId}`;
    const saleGroup = Object.values(groupedSales).find(group => 
      group.some(s => `${s.date}-${s.clientId}` === saleGroupKey)
    ) || [sale];
    
    setSelectedSaleGroup(saleGroup as Sale[]);
    setShowSaleDetails(true);
  };
    
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
    
  const filteredSales = useMemo(() => {
    let filtered = filteredSalesByType;
    
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
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(sale => 
        (sale.clientName && sale.clientName.toLowerCase().includes(term)) ||
        (sale.productName && sale.productName.toLowerCase().includes(term)) ||
        sale.total.toString().includes(term) ||
        new Date(sale.date).toLocaleDateString('fr-FR').includes(term) // Convert date to string for search
      );
    }
    
    return filtered;
  }, [filteredSalesByType, startDate, endDate, searchTerm]);
    
  const sortedAndFilteredSales = useMemo(() => {
    if (!sortConfig) return filteredSales;
    
    return [...filteredSales].sort((a, b) => {
      if (!sortConfig) return 0;
      
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
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
    
  const totalSales = sortedAndFilteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const averageSale = sortedAndFilteredSales.length > 0 ? Math.round(totalSales / sortedAndFilteredSales.length) : 0;
  const uniqueClients = [...new Set(sortedAndFilteredSales.map(sale => sale.clientId))].filter(id => id).length;
  // Calcul du profit total selon la formule : Cumul des ventes - Cumul des prix d'achat des produits vendus
  const totalRevenue = sortedAndFilteredSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
  const totalCOGS = sortedAndFilteredSales.reduce((sum, sale) => {
    const product = products.find(p => p.id === sale.productId);
    const costPrice = product ? (product.costPrice > 0 ? product.costPrice : product.wholesalePrice) : 0;
    return sum + (costPrice * (sale.quantity || 0));
  }, 0);
  const totalProfit = totalRevenue - totalCOGS;

  const columns = useMemo(() => {
    const baseColumns = [
      { 
        header: 'Date', 
        accessor: 'date' as keyof Sale,
        sortable: true,
        render: (item: Sale) => (
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            <span className="font-medium text-gray-900">{new Date(item.date).toLocaleDateString('fr-FR')}</span>
          </div>
        )
      },
      { 
        header: 'Client', 
        accessor: 'clientName' as keyof Sale,
        sortable: true,
        render: (item: Sale) => (
          <div className="flex items-center">
            <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg mr-3">
              <User className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <span className={`font-semibold ${item.clientName ? "text-gray-900 dark:text-gray-200" : "text-gray-500 dark:text-gray-400"}`}>
                {item.clientName || 'Non spécifié'}
              </span>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {item.saleType === 'RETAIL' ? 'Vente au détail' : 'Vente en gros'}
              </div>
            </div>
          </div>
        )
      },
      { 
        header: 'Produit', 
        accessor: 'productName' as keyof Sale,
        sortable: true,
        render: (item: Sale) => (
          <div className="flex items-center">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
              <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <span className="font-semibold text-gray-900 dark:text-gray-200">{item.productName}</span>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {item.quantity} {item.quantity > 1 ? 'unités' : 'unité'}
              </div>
            </div>
          </div>
        )
      },
      { 
        header: 'Prix Unitaire', 
        accessor: 'unitPrice' as keyof Sale,
        sortable: true,
        render: (item: Sale) => (
          <div className="text-right">
            <span className="font-mono font-semibold text-gray-900">
              {item.unitPrice.toLocaleString('fr-FR')} <span className="text-xs">FCFA</span>
            </span>
          </div>
        )
      },
      { 
        header: 'Total', 
        accessor: 'total' as keyof Sale,
        sortable: true,
        render: (item: Sale) => (
          <div className="text-right">
            <span className="font-mono font-bold text-lg text-orange-600 dark:text-orange-400">
              {item.total.toLocaleString('fr-FR')} <span className="text-sm dark:text-gray-400">FCFA</span>
            </span>
          </div>
        )
      },
      { 
        header: 'Type', 
        accessor: 'saleType' as keyof Sale,
        sortable: true,
        render: (item: Sale) => (
          <div className="flex justify-center">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
              item.saleType === 'RETAIL' 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm' 
                : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-sm'
            }`}>
              {item.saleType === 'RETAIL' ? (
                <>
                  <ShoppingCart className="w-3 h-3 mr-1" />
                  Détail
                </>
              ) : (
                <>
                  <BarChart3 className="w-3 h-3 mr-1" />
                  Gros
                </>
              )}
            </span>
          </div>
        )
      }
    ];

    if (isAdmin) {
      baseColumns.push({
        header: 'Actions',
        accessor: 'id' as keyof Sale,
        sortable: false,
        render: (item: Sale) => (
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => handlePrintReceipt(item.id)}
              className="inline-flex items-center p-2 text-gray-600 hover:text-white hover:bg-orange-500 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              title="Imprimer"
            >
              <Printer className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleOpenEditModal(item)}
              className="inline-flex items-center p-2 text-blue-600 hover:text-white hover:bg-blue-500 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              title="Éditer"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDeleteSale(item.id)}
              className="inline-flex items-center p-2 text-red-600 hover:text-white hover:bg-red-500 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              title="Supprimer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )
      });
    } else {
      baseColumns.push({
        header: 'Actions',
        accessor: 'id' as keyof Sale,
        sortable: false,
        render: (item: Sale) => (
          <div className="flex justify-end">
            <button
              onClick={() => handlePrintReceipt(item.id)}
              className="inline-flex items-center p-2 text-gray-600 hover:text-white hover:bg-orange-500 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              title="Imprimer"
            >
              <Printer className="h-4 w-4" />
            </button>
          </div>
        )
      });
    }

    return baseColumns;
  }, [products, isAdmin]);
    
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
      let clientName = updatedSale.clientName || '';
      if (updatedSale.clientId) {
        const client = clients.find((c: any) => c.id === updatedSale.clientId);
        clientName = client ? client.name : '';
      }
      
      const saleData = {
        ...updatedSale,
        clientName
      };
      
      await updateSaleMutation.mutateAsync({ 
        id: editingSale.id, 
        data: saleData
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
      <div className="flex w-full h-96 flex-col justify-center items-center space-y-4">
        <div className="flex flex-col items-center space-y-4 p-6">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-orange-200 rounded-full"></div>
            <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <div className="space-y-2 text-center">
            <p className="font-semibold text-gray-800 text-lg">Chargement des ventes</p>
            <p className="text-sm text-gray-600">Récupération des données en cours...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Ventes</h1>
          <p className="text-gray-600 mt-2 flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
            <span className="font-medium">{business.name}</span>
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="secondary"
            className="flex items-center gap-2 border border-gray-300 hover:bg-gray-100 transition-colors"
          >
            <Download className="h-5 w-5" />
            Exporter
          </Button>
          <Button 
            onClick={handleOpenModal} 
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
          >
            <Plus size={20} className="mr-2" />
            Nouvelle Vente
          </Button>
        </div>
      </div>
      
      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-900/30">
              <DollarSign className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total des ventes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {totalSales.toLocaleString('fr-FR')} <span className="text-sm font-normal dark:text-gray-400">FCFA</span>
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 dark:text-green-400 mr-1" />
            <span className="text-green-600 dark:text-green-400 font-medium">+12% ce mois</span>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Nombre de ventes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{sortedAndFilteredSales.length}</p>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium dark:text-gray-300">{filteredSalesByType.length}</span> cette période
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
              <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Clients uniques</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{uniqueClients}</p>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Clients actifs
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Profit total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {totalProfit.toLocaleString('fr-FR')} <span className="text-sm font-normal dark:text-gray-400">FCFA</span>
              </p>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Marge bénéficiaire
          </div>
        </div>
      </div>

      {/* Filtres et Recherche */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            {/* Tabs */}
            <div className="flex-1">
              <div className="flex space-x-1 p-1 bg-gray-100 rounded-xl w-fit">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    activeTab === 'all'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Toutes les ventes
                </button>
                <button
                  onClick={() => setActiveTab('retail')}
                  className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    activeTab === 'retail'
                      ? 'bg-white text-blue-900 shadow-sm'
                      : 'text-gray-600 hover:text-blue-900'
                  }`}
                >
                  <div className="flex items-center">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Détail
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('wholesale')}
                  className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    activeTab === 'wholesale'
                      ? 'bg-white text-purple-900 shadow-sm'
                      : 'text-gray-600 hover:text-purple-900'
                  }`}
                >
                  <div className="flex items-center">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Gros
                  </div>
                </button>
              </div>
            </div>

            {/* Barre de recherche */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Rechercher une vente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-gray-50"
                />
              </div>
            </div>
            
            {/* Boutons d'action */}
            <div className="flex gap-3">
              <Button 
                variant="secondary"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 border border-gray-300 hover:bg-gray-100 transition-colors"
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
                  className="flex items-center gap-2 border border-gray-300 hover:bg-gray-100 transition-colors"
                >
                  <X className="h-4 w-4" />
                  Réinitialiser
                </Button>
              )}
            </div>
          </div>
          
          {/* Filtres avancés */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date de début
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-gray-50"
                  />
                </div>
                
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date de fin
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-gray-50"
                  />
                </div>
                
                <div className="flex items-end">
                  <div className="text-sm text-gray-600 bg-gray-100 px-4 py-3 rounded-xl w-full">
                    <span className="font-semibold text-gray-900">{sortedAndFilteredSales.length}</span> vente{sortedAndFilteredSales.length > 1 ? 's' : ''} trouvée{sortedAndFilteredSales.length > 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tableau des ventes */}
        <div className="border-t border-gray-200">
          <div className="overflow-x-auto">
            <Table 
              columns={columns} 
              data={sortedAndFilteredSales} 
              onSort={handleSort}
              sortConfig={sortConfig}
            />
          </div>
        </div>
      </div>
      
      {/* Modal pour afficher les détails de la vente */}
      <Modal 
        isOpen={showSaleDetails} 
        onClose={handleCloseModal} 
        title="Détails de la Vente"
        size="lg"
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
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date.toISOString().split('T')[0]}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Type de Vente</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, saleType: 'RETAIL' }))}
                  className={`px-4 py-5 rounded-xl text-sm font-semibold transition-all duration-200 border-2 ${
                    formData.saleType === 'RETAIL'
                      ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <ShoppingCart className="h-6 w-6 mb-2" />
                    <span className="font-semibold">Détail</span>
                    <span className="text-xs opacity-80 mt-1">Comptoir</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, saleType: 'WHOLESALE' }))}
                  className={`px-4 py-5 rounded-xl text-sm font-semibold transition-all duration-200 border-2 ${
                    formData.saleType === 'WHOLESALE'
                      ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-sm'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-purple-300'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <BarChart3 className="h-6 w-6 mb-2" />
                    <span className="font-semibold">Gros</span>
                    <span className="text-xs opacity-80 mt-1">Client</span>
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-gray-50 appearance-none"
                  required={formData.saleType === 'WHOLESALE'}
                >
                  <option value="">Sélectionner un client</option>
                  {clients.map((client: any) => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                  <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Produits</h3>
                <p className="text-sm text-gray-600 mt-1">Ajoutez les produits vendus</p>
              </div>
              <button 
                type="button" 
                onClick={addLineItem} 
                className="inline-flex items-center px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
              >
                <Plus className="h-5 w-5 mr-2" />
                Ajouter un produit
              </button>
            </div>
            
            <div className="space-y-5">
              {formData.lineItems.map((item, index) => {
                const product = item.productId ? products.find(p => p.id === item.productId) : null;
                return (
                  <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-5 p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
                    <div className="md:col-span-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Produit</label>
                      <select
                        value={item.productId}
                        onChange={(e) => handleProductChange(item.id, e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white"
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
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex justify-between text-sm py-1">
                            <span className="text-gray-600">Prix détail:</span>
                            <span className="font-semibold text-gray-900">{product.retailPrice.toLocaleString('fr-FR')} FCFA</span>
                          </div>
                          <div className="flex justify-between text-sm py-1">
                            <span className="text-gray-600">Prix gros:</span>
                            <span className="font-semibold text-gray-900">{product.wholesalePrice.toLocaleString('fr-FR')} FCFA</span>
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
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 ${
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
                        <div className="mt-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Stock:</span>
                            <span className={`font-semibold ${getStockColor(item.productId, item.quantity)}`}>
                              {product.stock}
                            </span>
                          </div>
                          {getStockColor(item.productId, item.quantity) === 'text-red-600' && (
                            <p className="text-xs text-red-600 font-medium mt-1 flex items-center">
                              <X className="w-3 h-3 mr-1" />
                              Stock épuisé!
                            </p>
                          )}
                          {getStockColor(item.productId, item.quantity) === 'text-yellow-600' && (
                            <p className="text-xs text-yellow-600 font-medium mt-1 flex items-center">
                              <AlertTriangle className="w-3 h-3 mr-1" />
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                        min="0"
                        required
                      />
                      <div className="mt-2 p-2 bg-orange-50 rounded-lg">
                        <p className="text-xs text-gray-700">
                          Total ligne: <span className="font-semibold text-orange-700">
                            {calculateLineTotal(item.quantity, item.unitPrice).toLocaleString('fr-FR')} FCFA
                          </span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removeLineItem(item.id)}
                        disabled={formData.lineItems.length <= 1}
                        className="w-11 h-11 flex justify-center items-center bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-2xl border border-gray-200">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Récapitulatif</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {formData.lineItems.length} produit{formData.lineItems.length > 1 ? 's' : ''} dans cette vente
                </p>
              </div>
              
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl shadow-sm hover:bg-gray-50 transition-all duration-300"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Enregistrer la Vente
                </button>
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
                  defaultValue={editingSale.date.toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-gray-50"
                  required
                />
              </div>
              <div>
                <label htmlFor="edit-clientId" className="block text-sm font-medium text-gray-700 mb-2">Client</label>
                <select
                  id="edit-clientId"
                  name="clientId"
                  defaultValue={editingSale.clientId || ''}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-gray-50"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-gray-50"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-gray-50"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-gray-50"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-gray-50"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="edit-saleType" className="block text-sm font-medium text-gray-700 mb-2">Type de Vente</label>
                <select
                  id="edit-saleType"
                  name="saleType"
                  defaultValue={editingSale.saleType}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-gray-50"
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
                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl shadow-sm hover:bg-gray-50 transition-all duration-300"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
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