"use client";

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Package, 
  BarChart3, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Wallet,
  UserCircle,
  Building,
  FileText,
  CreditCard,
  Truck,
  Wrench,
  Puzzle,
  Wifi,
  Shield
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useExtensions } from '@/hooks/useExtension';
import { useActiveBusiness } from '@/contexts/ActiveBusinessContext';
import type { User } from '@/types';

interface SidebarProps {
  currentUser: User;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentUser }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();
  const { activeBusiness } = useActiveBusiness();
  const { extensions } = useExtensions(activeBusiness);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Filtrer pour ne montrer que les extensions activées et assignées à l'entreprise active
  const activeExtensions = extensions.filter(ext => {
    // Vérifier si l'extension est activée
    const isEnabled = ext.enabled;
    
    // Si une entreprise est active, vérifier si l'extension est assignée à cette entreprise
    if (activeBusiness?.id) {
      // Pour cette implémentation, on suppose que l'extension Wi-Fi Sales est assignée à toutes les entreprises
      // Dans une implémentation complète, on vérifierait dans la base de données
      return isEnabled && (ext.id === 'wifi-sales' || true); // Temporairement toujours vrai pour test
    }
    
    // Si aucune entreprise n'est active, montrer les extensions activées
    return isEnabled;
  });

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const menuItems = [
    { 
      name: 'Tableau de bord', 
      href: '/dashboard', 
      icon: LayoutDashboard,
      roles: ['ADMIN', 'MANAGER', 'STAFF']
    },
    { 
      name: 'Ventes', 
      href: '/sales', 
      icon: ShoppingCart,
      roles: ['ADMIN', 'MANAGER', 'STAFF']
    },
    { 
      name: 'Produits', 
      href: '/products', 
      icon: Package,
      roles: ['ADMIN', 'MANAGER']
    },
    { 
      name: 'Clients', 
      href: '/clients', 
      icon: Users,
      roles: ['ADMIN', 'MANAGER']
    },
    { 
      name: 'Fournisseurs', 
      href: '/suppliers', 
      icon: Truck,
      roles: ['ADMIN', 'MANAGER']
    },
    { 
      name: 'Employés', 
      href: '/employees', 
      icon: UserCircle,
      roles: ['ADMIN']
    },
    { 
      name: 'Entreprises', 
      href: '/business', 
      icon: Building,
      roles: ['ADMIN']
    },
    { 
      name: 'Dépenses', 
      href: '/expenses', 
      icon: CreditCard,
      roles: ['ADMIN', 'MANAGER']
    },
    { 
      name: 'Rapports', 
      href: '/reports', 
      icon: FileText,
      roles: ['ADMIN', 'MANAGER']
    },
    { 
      name: 'Panneau d\'Admin', 
      href: '/admin-panel', 
      icon: Shield,
      roles: ['ADMIN']
    },
    { 
      name: 'Paramètres', 
      href: '/settings', 
      icon: Settings,
      roles: ['ADMIN']
    },
    {
      name: 'Extensions',
      href: '/extensions',
      icon: Puzzle,
      roles: ['ADMIN']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(currentUser.role)
  );

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  // Obtenir l'icône appropriée pour une extension
  const getExtensionIcon = (iconName: string) => {
    switch (iconName) {
      case 'Package': return Package;
      case 'Users': return Users;
      case 'BarChart3': return BarChart3;
      case 'Wrench': return Wrench;
      case 'Wifi': return Wifi;
      default: return Puzzle;
    }
  };

  return (
    <aside className={`bg-white dark:bg-gray-800 shadow-md transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'} flex flex-col h-full`}>
      <div className="flex h-20 items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed && (
          <h1 className=" text-base text-center font-bold text-primary-600 dark:text-primary-400">DEV SONGUE SUITE</h1>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={`flex items-center p-3 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon size={20} />
                  {!isCollapsed && (
                    <span className="ml-3 font-medium">{item.name}</span>
                  )}
                </a>
              </li>
            );
          })}
          
          {/* Afficher les extensions actives */}
          {activeExtensions.length > 0 && (
            <>
              {!isCollapsed && (
                <li className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Extensions
                </li>
              )}
              {activeExtensions.map((extension) => {
                const Icon = getExtensionIcon(extension.icon || 'Puzzle');
                return (
                  <li key={extension.id}>
                    <a
                      href={`/extensions/${extension.id}`}
                      className={`flex items-center p-3 rounded-lg transition-colors ${
                        isActive(`/extensions/${extension.id}`)
                          ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon size={20} />
                      {!isCollapsed && (
                        <span className="ml-3 font-medium">{extension.name}</span>
                      )}
                    </a>
                  </li>
                );
              })}
            </>
          )}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center w-full p-3 text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
        >
          <LogOut size={20} />
          {!isCollapsed && (
            <span className="ml-3 font-medium">Déconnexion</span>
          )}
        </button>
      </div>
    </aside>
  );
};