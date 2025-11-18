"use client";

import React, { useState } from 'react';
import type { Business, BusinessType, User, AuditLog } from '@/types';
import { Button } from '../shared/Button';
import { Modal } from '../shared/Modal';
import { Table } from '../shared/Table';
import { useBusinesses, useCreateBusiness, useUpdateBusiness, useDeleteBusiness, useTransferData } from '@/hooks/useBusiness';
import { useUsers } from '@/hooks/useUser'; // Ajout de l'import pour useUsers
import { Edit, Eye, Trash2, BarChart, ArrowRightLeft } from 'lucide-react';
import { BusinessDetails } from './BusinessDetails';
import { BusinessComparison } from './BusinessComparison';
import { DataTransfer } from '../dataTransfer/DataTransfer';

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return `${amount?.toLocaleString('fr-FR')} FCFA`;
};

// Helper function to export business data to CSV
const exportBusinessDataToCSV = (business: Business) => {
  const csvContent = [
    ['Nom', business.name],
    ['Type', business.type],
    ['Pays', business.country || ''],
    ['Ville', business.city || ''],
    ['Devise', business.currency || ''],
    ['Nombre de ventes', business.sales?.length || 0],
    ['Nombre de dépenses', business.expenses?.length || 0],
    ['Nombre de produits', business.products?.length || 0],
    ['Nombre de clients', business.clients?.length || 0],
    ['Nombre de fournisseurs', business.suppliers?.length || 0],
  ].map(row => row.join(',')).join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `entreprise-${business.name}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

interface SettingsProps {
  businesses: Business[];
  onAddBusiness: (newBusiness: Business) => void;
  onUpdateBusiness: (updatedBusiness: Business) => void;
  onDeleteBusiness: (businessId: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({ businesses, onAddBusiness, onUpdateBusiness, onDeleteBusiness }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false); // Nouvel état pour la duplication
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null); // Pour afficher les détails
  const [isComparisonOpen, setIsComparisonOpen] = useState(false); // Pour afficher la comparaison
  const [isDataTransferOpen, setIsDataTransferOpen] = useState(false); // Pour afficher le transfert de données
  const [formData, setFormData] = useState<Omit<Business, 'id' | 'sales' | 'expenses' | 'products' | 'clients' | 'suppliers' | 'createdAt' | 'updatedAt' | 'deletedAt'>>({
    name: '',
    type: 'SHOP' as BusinessType,
    country: '',
    city: '',
    currency: 'XOF',
    logoUrl: '',
    settings: undefined
  });
  
  // État pour gérer les employés assignés à l'entreprise
  const [assignedEmployeeIds, setAssignedEmployeeIds] = useState<string[]>([]);

  // État pour la recherche d'entreprises
  const [searchTerm, setSearchTerm] = useState('');

  const { data: fetchedBusinesses = [], isLoading: isBusinessesLoading } = useBusinesses();
  const { data: fetchedUsers = [], isLoading: isUsersLoading } = useUsers(); // Récupération des utilisateurs
  const createBusinessMutation = useCreateBusiness();
  const updateBusinessMutation = useUpdateBusiness();
  const deleteBusinessMutation = useDeleteBusiness();
  const transferDataMutation = useTransferData();

  // Utiliser les données récupérées ou les props
  const displayedBusinesses = fetchedBusinesses.length > 0 ? fetchedBusinesses : businesses;
  const allUsers = fetchedUsers.length > 0 ? fetchedUsers : [];

  const handleOpenModal = (business?: Business, duplicate = false) => {
    if (business) {
      setIsEditing(true);
      setIsDuplicating(duplicate);
      setCurrentBusiness(business);
      setFormData({
        name: duplicate ? `${business.name} (Copie)` : business.name,
        type: business.type,
        country: business.country || '',
        city: business.city || '',
        currency: business.currency || 'XOF',
        logoUrl: business.logoUrl || '',
        settings: business.settings
      });
      
      // Initialiser les employés assignés
      const employeeIds = allUsers
        .filter(user => user.managedBusinessIds?.includes(business.id))
        .map(user => user.id);
      setAssignedEmployeeIds(employeeIds);
    } else {
      setIsEditing(false);
      setIsDuplicating(false);
      setCurrentBusiness(null);
      setFormData({ 
        name: '', 
        type: 'SHOP' as BusinessType,
        country: '',
        city: '',
        currency: 'XOF',
        logoUrl: '',
        settings: undefined
      });
      setAssignedEmployeeIds([]);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setIsDuplicating(false);
    setCurrentBusiness(null);
    setAssignedEmployeeIds([]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Gérer le changement d'assignation d'un employé
  const handleEmployeeAssignmentChange = (employeeId: string, checked: boolean) => {
    if (checked) {
      setAssignedEmployeeIds(prev => [...prev, employeeId]);
    } else {
      setAssignedEmployeeIds(prev => prev.filter(id => id !== employeeId));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing && currentBusiness && !isDuplicating) {
        // Update existing business
        await updateBusinessMutation.mutateAsync({
          id: currentBusiness.id,
          data: formData
        });
        
        // Mettre à jour les assignations des employés
        await updateEmployeeAssignments(currentBusiness.id, assignedEmployeeIds);
      } else {
        // Create new business (or duplicate)
        await createBusinessMutation.mutateAsync(formData);
      }

      handleCloseModal();
    } catch (error) {
      console.error('Error saving business:', error);
    }
  };

  // Fonction pour mettre à jour les assignations des employés
  const updateEmployeeAssignments = async (businessId: string, assignedIds: string[]) => {
    try {
      // Pour chaque utilisateur, mettre à jour ses managedBusinessIds
      for (const user of allUsers) {
        const currentlyAssigned = user.managedBusinessIds?.includes(businessId) || false;
        const shouldBeAssigned = assignedIds.includes(user.id);
        
        // Si l'état d'assignation a changé, mettre à jour l'utilisateur
        if (currentlyAssigned !== shouldBeAssigned) {
          let newManagedBusinessIds = user.managedBusinessIds || [];
          
          if (shouldBeAssigned) {
            // Ajouter l'entreprise aux managedBusinessIds
            newManagedBusinessIds = [...newManagedBusinessIds, businessId];
          } else {
            // Retirer l'entreprise des managedBusinessIds
            newManagedBusinessIds = newManagedBusinessIds.filter(id => id !== businessId);
          }
          
          // Appeler l'action de mise à jour de l'utilisateur
          // Note: Dans une implémentation complète, vous auriez besoin d'une action côté serveur
          // pour mettre à jour les managedBusinessIds de l'utilisateur
          console.log(`Updating user ${user.id} with managedBusinessIds:`, newManagedBusinessIds);
        }
      }
    } catch (error) {
      console.error('Error updating employee assignments:', error);
    }
  };

  const handleDelete = async (businessId: string) => {
    if (displayedBusinesses.length <= 1) {
      alert("Vous ne pouvez pas supprimer la dernière entreprise.");
      return;
    }

    if (confirm("Êtes-vous sûr de vouloir supprimer cette entreprise ?")) {
      try {
        await deleteBusinessMutation.mutateAsync(businessId);
        // Si l'entreprise supprimée était celle sélectionnée, désélectionner
        if (selectedBusiness?.id === businessId) {
          setSelectedBusiness(null);
        }
      } catch (error) {
        console.error('Error deleting business:', error);
      }
    }
  };

  // Helper function to calculate cost of goods sold (COGS)
  const calculateCOGS = (sales: any[], products: any[]): number => {
    return sales.reduce((sum, sale) => {
      // Find the product to get its wholesale price
      const product = products.find((p: any) => p.id === sale.productId);
      const wholesalePrice = product ? product.wholesalePrice : 0;
      return sum + (wholesalePrice * sale.quantity);
    }, 0);
  };

  // Helper function to calculate operational expenses
  const calculateOperationalExpenses = (expenses: any[]): number => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const columns = [
    { header: 'Nom', accessor: 'name' as keyof Business },
    { header: 'Type', accessor: 'type' as keyof Business },
    { 
      header: 'Localisation', 
      accessor: 'id' as keyof Business,
      render: (item: Business) => (
        <div className="text-sm">
          <div>{item.city || 'N/A'}</div>
          <div className="text-gray-500 dark:text-gray-400">{item.country || 'N/A'}</div>
        </div>
      )
    },
    {
      header: 'Statistiques',
      accessor: 'id' as keyof Business,
      render: (item: Business) => {
        const totalSales = item.sales?.reduce((sum, sale) => sum + sale.total, 0) || 0;
        const totalCOGS = calculateCOGS(item.sales || [], item.products || []);
        const totalOperationalExpenses = calculateOperationalExpenses(item.expenses || []);
        const netProfit = totalSales - totalCOGS - totalOperationalExpenses;

        return (
          <div className="flex flex-wrap gap-2 text-sm">
            <div className="bg-orange-100 dark:bg-orange-900/50 px-2 py-1 rounded">
              <span className="font-medium">Ventes:</span> {item.sales?.length || 0}
            </div>
            <div className="bg-red-100 dark:bg-red-900/50 px-2 py-1 rounded">
              <span className="font-medium">Dépenses:</span> {item.expenses?.length || 0}
            </div>
            <div className="bg-green-100 dark:bg-green-900/50 px-2 py-1 rounded">
              <span className="font-medium">Produits:</span> {item.products?.length || 0}
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/50 px-2 py-1 rounded">
              <span className="font-medium">Bénéfice:</span> {formatCurrency(netProfit)}
            </div>
          </div>
        );
      }
    },
    {
      header: 'Actions',
      accessor: 'id' as keyof Business,
      render: (item: Business) => (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenModal(item);
            }}
            className="p-2"
            aria-label="Modifier"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenModal(item, true);
            }}
            className="p-2"
            aria-label="Dupliquer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </Button>
          <Button
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              exportBusinessDataToCSV(item);
            }}
            className="p-2"
            aria-label="Exporter"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </Button>
          <Button
            variant="primary"
            onClick={(e) => {
              e.stopPropagation();
              // Afficher les détails de l'entreprise
              setSelectedBusiness(item);
            }}
            className="p-2"
            aria-label="Voir"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="danger"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(item.id);
            }}
            disabled={displayedBusinesses.length <= 1}
            className="p-2"
            aria-label="Supprimer"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    }
  ];

  // Filtrer les entreprises selon le terme de recherche
  const filteredBusinesses = displayedBusinesses.filter(business =>
    business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (business.city && business.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (business.country && business.country.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Fonction de transfert de données
  const handleDataTransfer = async (sourceBusinessId: string, targetBusinessId: string, dataTypes: string[]) => {
    try {
      const sourceBusiness = displayedBusinesses.find(b => b.id === sourceBusinessId);
      const targetBusiness = displayedBusinesses.find(b => b.id === targetBusinessId);
      
      if (!sourceBusiness || !targetBusiness) {
        throw new Error('Entreprises non trouvées');
      }
      
      await transferDataMutation.mutateAsync({
        sourceBusiness,
        targetBusiness,
        dataTypes
      });
    } catch (error) {
      console.error('Erreur lors du transfert de données:', error);
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des Entreprises</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Rechercher une entreprise..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <Button onClick={() => handleOpenModal()}>
            Ajouter une entreprise
          </Button>
          <Button 
            onClick={() => setIsComparisonOpen(true)}
            variant="secondary"
          >
            <BarChart className="h-4 w-4 mr-2" />
            Comparer
          </Button>
          <Button 
            onClick={() => setIsDataTransferOpen(true)}
            variant="secondary"
          >
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            Transférer
          </Button>
        </div>
      </div>

      {/* Tableau des entreprises */}
      <Table
        columns={columns}
        data={filteredBusinesses}
        // Supprimé car non supporté par le composant Table
      />

      {/* Modal pour ajouter/modifier une entreprise */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={isEditing ? (isDuplicating ? "Dupliquer l'entreprise" : "Modifier l'entreprise") : "Ajouter une entreprise"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nom de l'entreprise *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type d'entreprise *
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="SHOP">Boutique</option>
              <option value="WAREHOUSE">Entrepôt</option>
              <option value="SERVICE">Service</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pays
              </label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ville
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Devise
            </label>
            <select
              id="currency"
              name="currency"
              value={formData.currency || 'XOF'}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="XOF">Franc CFA (XOF)</option>
              <option value="XAF">Franc CFA (XAF)</option>
              <option value="EUR">Euro (€)</option>
              <option value="USD">Dollar ($)</option>
            </select>
          </div>

          <div>
            <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              URL du logo
            </label>
            <input
              type="text"
              id="logoUrl"
              name="logoUrl"
              value={formData.logoUrl || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          {/* Section pour assigner des employés */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Assigner des employés
            </label>
            <div className="border border-gray-300 dark:border-gray-600 rounded-md p-3 max-h-40 overflow-y-auto bg-white dark:bg-gray-800">
              {isUsersLoading ? (
                <p className="text-gray-500 dark:text-gray-400">Chargement des employés...</p>
              ) : allUsers.length > 0 ? (
                allUsers.map(user => (
                  <div key={user.id} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id={`employee-${user.id}`}
                      checked={assignedEmployeeIds.includes(user.id)}
                      onChange={(e) => handleEmployeeAssignmentChange(user.id, e.target.checked)}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label 
                      htmlFor={`employee-${user.id}`}
                      className="text-sm text-gray-700 dark:text-gray-300"
                    >
                      {user.name}
                    </label>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Aucun employé disponible</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseModal}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={updateBusinessMutation.isPending || createBusinessMutation.isPending}
            >
              {isEditing ? (isDuplicating ? "Dupliquer" : "Modifier") : "Ajouter"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal pour afficher les détails de l'entreprise */}
      {selectedBusiness && (
        <Modal
          isOpen={!!selectedBusiness}
          onClose={() => setSelectedBusiness(null)}
          title={`Détails de l'entreprise: ${selectedBusiness?.name}`}
        >
          <BusinessDetails 
            business={selectedBusiness} 
            onEdit={() => {
              setSelectedBusiness(null);
              handleOpenModal(selectedBusiness);
            }}
            onDelete={() => handleDelete(selectedBusiness.id)}
            businessesCount={displayedBusinesses.length}
            assignedEmployees={allUsers.filter(u => u.managedBusinessIds?.includes(selectedBusiness.id))}
            onRemoveEmployee={() => {}}
            auditLogs={[]} // À implémenter si nécessaire
            onUpdateSettings={() => {}} // À implémenter si nécessaire
          />
        </Modal>
      )}

      {/* Modal pour la comparaison d'entreprises */}
      {isComparisonOpen && (
        <BusinessComparison 
          businesses={displayedBusinesses} 
          onClose={() => setIsComparisonOpen(false)} 
        />
      )}

      {/* Modal pour le transfert de données */}
      {isDataTransferOpen && (
        <DataTransfer
          businesses={displayedBusinesses}
          onClose={() => setIsDataTransferOpen(false)}
          onTransfer={handleDataTransfer}
        />
      )}
    </div>
  );
};