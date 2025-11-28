'use client';

import React, { useState } from 'react';
import { Extension, User, Business } from '@/types';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Switch } from '@/components/shared';
import { 
  Package, 
  Users, 
  BarChart3, 
  Plus, 
  Trash2, 
  Settings as SettingsIcon,
  Puzzle,
  UserPlus,
  Building,
  CheckCircle,
  XCircle,
  Wifi,
  AlertTriangle
} from 'lucide-react';
import { Modal } from '@/components/shared/Modal';
import { MainLayout } from '@/components/layout/MainLayout';
import { useBusinesses } from '@/hooks/useBusiness';
import Link from 'next/link';
import { useUsers } from '@/hooks/useUser';

// Données simulées pour les extensions
const mockExtensions: Extension[] = [
  {
    id: 'wifi-sales',
    name: 'Ventes Wi-Fi',
    description: 'Suivi et analyse des ventes de tickets Wi-Fi avec statistiques détaillées',
    version: '1.0.0',
    author: 'Équipe DevSongue',
    icon: 'Wifi',
    enabled: true,
    installed: true,
    settings: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

const ExtensionsPage = () => {
  // Gérer le contexte de l'entreprise active de manière sécurisée
  let activeBusiness: Business | null = null;
  try {
    // Nous ne pouvons pas utiliser useActiveBusiness ici car cela provoquerait une erreur
    // Le contexte est géré par le MainLayout
    activeBusiness = null; // Pour l'instant, nous ne pouvons pas accéder au contexte directement
  } catch (error) {
    // En cas d'erreur, activeBusiness reste null
    activeBusiness = null;
  }

  const { data: businesses = [], isLoading: businessesLoading } = useBusinesses();
  const { data: usersData = [], isLoading: usersLoading } = useUsers();
  const [extensions] = useState<Extension[]>(mockExtensions);
  const [loading] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false);
  const [selectedExtension, setSelectedExtension] = useState<Extension | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [extensionToToggle, setExtensionToToggle] = useState<Extension | null>(null);

  // Fonction simulée pour activer/désactiver une extension
  const toggleExtension = (extension: Extension) => {
    // Afficher le modal de confirmation avant d'activer/désactiver
    setExtensionToToggle(extension);
    setIsActivationModalOpen(true);
  };

  // Confirmer l'activation/désactivation d'une extension
  const confirmToggleExtension = () => {
    if (extensionToToggle) {
      console.log(`Toggle extension ${extensionToToggle.id}`);
      // Lier l'extension à l'entreprise active lors de l'activation
      if (!extensionToToggle.enabled) {
        console.log(`Extension ${extensionToToggle.id} would be linked to business`);
        // Ici, on appellerait le hook pour lier l'extension à l'entreprise
      }
    }
    setIsActivationModalOpen(false);
    setExtensionToToggle(null);
  };

  // Fonction simulée pour installer une extension
  const installExtension = (extension: Extension) => {
    console.log(`Install extension ${extension.name}`);
  };

  // Fonction simulée pour désinstaller une extension
  const uninstallExtension = (id: string) => {
    console.log(`Uninstall extension ${id}`);
  };

  // Fonction simulée pour assigner une extension à une entreprise
  const assignExtensionToBusiness = (extensionId: string, businessId: string) => {
    console.log(`Assign extension ${extensionId} to business ${businessId}`);
  };

  // Fonction simulée pour retirer une extension d'une entreprise
  const unassignExtensionFromBusiness = (extensionId: string, businessId: string) => {
    console.log(`Unassign extension ${extensionId} from business ${businessId}`);
  };

  // Fonction simulée pour assigner une extension à un utilisateur
  const assignExtensionToUser = (extensionId: string, userId: string) => {
    console.log(`Assign extension ${extensionId} to user ${userId}`);
  };

  // Fonction simulée pour retirer une extension d'un utilisateur
  const unassignExtensionFromUser = (extensionId: string, userId: string) => {
    console.log(`Unassign extension ${extensionId} from user ${userId}`);
  };

  // Gérer l'ouverture du modal d'assignation
  const handleOpenAssignmentModal = (extension: Extension) => {
    setSelectedExtension(extension);
    setIsAssignmentModalOpen(true);
  };

  // Gérer la fermeture du modal d'assignation
  const handleCloseAssignmentModal = () => {
    setIsAssignmentModalOpen(false);
    setSelectedExtension(null);
    setSelectedBusiness('');
    setSelectedUser('');
  };

  // Gérer la fermeture du modal d'activation
  const handleCloseActivationModal = () => {
    setIsActivationModalOpen(false);
    setExtensionToToggle(null);
  };

  // Gérer l'assignation d'une extension
  const handleAssignExtension = () => {
    if (!selectedExtension) return;

    if (selectedBusiness) {
      assignExtensionToBusiness(selectedExtension.id, selectedBusiness);
    }

    if (selectedUser) {
      assignExtensionToUser(selectedExtension.id, selectedUser);
    }

    handleCloseAssignmentModal();
  };

  // Obtenir les icônes pour les extensions
  const getExtensionIcon = (iconName: string | undefined) => {
    if (!iconName) return <Puzzle className="h-6 w-6" />;
    
    switch (iconName) {
      case 'BarChart3': return <BarChart3 className="h-6 w-6" />;
      case 'Package': return <Package className="h-6 w-6" />;
      case 'Users': return <Users className="h-6 w-6" />;
      case 'Wifi': return <Wifi className="h-6 w-6" />;
      default: return <Puzzle className="h-6 w-6" />;
    }
  };

  if (loading || businessesLoading || usersLoading) {
    return (
      <MainLayout businesses={businesses}>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout businesses={businesses}>
      <div className="space-y-8">
        {/* En-tête de la page */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Extensions</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Gérez vos extensions et personnalisez votre expérience
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {extensions.filter(e => e.enabled).length} activées
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Grille des extensions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {extensions.map((extension) => (
            <Card 
              key={extension.id} 
              className={`
                group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 
                border border-gray-200 dark:border-gray-700 rounded-2xl
                ${extension.enabled ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900/50'}
              `}
            >
              {/* Badge d'état */}
              <div className="absolute top-3 right-3">
                {extension.enabled ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-400" />
                )}
              </div>

              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`
                      p-3 rounded-xl shadow-sm transition-all duration-300 group-hover:shadow-md
                      ${extension.enabled 
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}
                    `}>
                      {getExtensionIcon(extension.icon)}
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                        {extension.name}
                      </CardTitle>
                      <CardDescription className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        v{extension.version}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">
                  {extension.description}
                </p>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                    {extension.author}
                  </span>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                  <Switch
                    checked={extension.enabled}
                    onCheckedChange={() => toggleExtension(extension)}
                  />
                  <div className="flex space-x-2">
                    <Button
                      variant="secondary"
                      onClick={() => handleOpenAssignmentModal(extension)}
                      className="text-xs px-3 py-1.5 h-8 rounded-lg transition-colors"
                    >
                      <UserPlus className="h-3.5 w-3.5 mr-1" />
                      Assigner
                    </Button>
                    {extension.id === 'wifi-sales' ? (
                      <Link href="/extensions/wifi-sales">
                        <Button variant="secondary" className="text-xs px-3 py-1.5 h-8 rounded-lg transition-colors">
                          <SettingsIcon className="h-3.5 w-3.5 mr-1" />
                          Configurer
                        </Button>
                      </Link>
                    ) : (
                      <Link href={`/extensions/${extension.id}`}>
                        <Button variant="secondary" className="text-xs px-3 py-1.5 h-8 rounded-lg transition-colors">
                          <SettingsIcon className="h-3.5 w-3.5 mr-1" />
                          Configurer
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Modal d'assignation */}
      <Modal
        isOpen={isAssignmentModalOpen}
        onClose={handleCloseAssignmentModal}
        title={`Assigner "${selectedExtension?.name}"`}
      >
        <div className="space-y-5">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <UserPlus className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Assignation d'extension
                </h3>
                <div className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                  <p>Sélectionnez une entreprise ou un utilisateur pour assigner cette extension.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Assigner à une entreprise
              </label>
              <select
                value={selectedBusiness}
                onChange={(e) => setSelectedBusiness(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Sélectionner une entreprise</option>
                {businesses.map((business: Business) => (
                  <option key={business.id} value={business.id}>
                    {business.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Assigner à un utilisateur
              </label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Sélectionner un utilisateur</option>
                {usersData.map((user: User) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <Button variant="secondary" onClick={handleCloseAssignmentModal} className="px-4 py-2">
              Annuler
            </Button>
            <Button onClick={handleAssignExtension} className="px-4 py-2">
              Assigner
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de confirmation d'activation */}
      <Modal
        isOpen={isActivationModalOpen}
        onClose={handleCloseActivationModal}
        title={extensionToToggle?.enabled ? "Désactiver l'extension" : "Activer l'extension"}
      >
        <div className="space-y-5">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Confirmation requise
                </h3>
                <div className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                  <p>
                    {extensionToToggle?.enabled 
                      ? "Êtes-vous sûr de vouloir désactiver cette extension ?" 
                      : "Êtes-vous sûr de vouloir activer cette extension ?"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {extensionToToggle && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg mr-3">
                  {getExtensionIcon(extensionToToggle.icon)}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{extensionToToggle.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Version {extensionToToggle.version}
                  </p>
                </div>
              </div>
              
              {/* Section supprimée car activeBusiness n'est pas accessible dans ce contexte */}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-2">
            <Button variant="secondary" onClick={handleCloseActivationModal} className="px-4 py-2">
              Annuler
            </Button>
            <Button 
              onClick={confirmToggleExtension} 
              className={extensionToToggle?.enabled ? "px-4 py-2 bg-red-500 hover:bg-red-600" : "px-4 py-2"}
            >
              {extensionToToggle?.enabled ? "Désactiver" : "Activer"}
            </Button>
          </div>
        </div>
      </Modal>
    </MainLayout>
  );
};

export default ExtensionsPage;