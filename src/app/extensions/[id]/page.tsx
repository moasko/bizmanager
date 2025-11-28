'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ExtensionRunner from '@/components/extensions/ExtensionRunner';
import { useExtensions } from '@/hooks/useExtension';
import { WifiSalesExtension } from '@/extensions';
import { MainLayout } from '@/components/layout/MainLayout';
import { useBusinesses } from '@/hooks/useBusiness';

const ExtensionDetailPage = () => {
  const params = useParams();
  const extensionId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { extensions } = useExtensions();
  const extension = extensions.find(ext => ext.id === extensionId);
  const { data: businesses = [], isLoading } = useBusinesses();

  if (isLoading) {
    return (
      <div className="flex w-full h-screen flex-col justify-center items-center space-y-4">
        <div className="flex items-center space-x-4 p-6">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-orange-200 rounded-full"></div>
            <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-gray-800">Chargement de l'extension</p>
            <p className="text-sm text-gray-600 animate-pulse">Chargement en cours...</p>
          </div>
        </div>
      </div>
    );
  }

  // Gérer l'extension spécifique Bilan des Ventes Wi-Fi
  if (extensionId === 'wifi-sales') {
    return (
      <MainLayout businesses={businesses}>
        <WifiSalesExtension />
      </MainLayout>
    );
  }

  if (!extension) {
    return (
      <MainLayout businesses={businesses}>
        <div className="p-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Extension non trouvée
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              L'extension avec l'ID "{extensionId}" n'existe pas ou n'est pas installée.
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout businesses={businesses}>
      <div className="h-full flex flex-col">
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {extension.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {extension.description}
          </p>
        </div>
        
        <div className="flex-1 bg-gray-50 dark:bg-gray-900">
          <ExtensionRunner 
            extensionId={extensionId!} 
            onMessage={(data) => {
              console.log('Message de l\'extension:', data);
              // Traiter les messages de l'extension ici
            }}
            onError={(error) => {
              console.error('Erreur de l\'extension:', error);
              // Gérer les erreurs de l'extension ici
            }}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default ExtensionDetailPage;