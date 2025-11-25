import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { User } from '../../types';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Wallet, 
  Package, 
  Users, 
  Truck, 
  BarChart3, 
  Settings, 
  Shield, 
  Building,
  User as UserIcon
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Tableau de bord', icon: <LayoutDashboard size={20} /> },
  { path: '/sales', label: 'Ventes', icon: <ShoppingCart size={20} /> },
  { path: '/expenses', label: 'Dépenses', icon: <Wallet size={20} /> },
  { path: '/products', label: 'Produits', icon: <Package size={20} /> },
  { path: '/clients', label: 'Clients', icon: <Users size={20} /> },
  { path: '/suppliers', label: 'Fournisseurs', icon: <Truck size={20} /> },
  { path: '/reports', label: 'Rapports', icon: <BarChart3 size={20} /> },
  { path: '/employees', label: 'Employés', icon: <UserIcon size={20} />, adminOnly: true },
  { path: '/finance', label: 'Finances', icon: <Wallet size={20} />, adminOnly: true },
  { path: '/settings', label: 'Paramètres', icon: <Settings size={20} />, adminOnly: true },
  { path: '/admin-panel', label: 'Administration', icon: <Shield size={20} />, adminOnly: true }
];

interface SidebarProps {
    currentUser: User;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentUser }) => {
    const pathname = usePathname();

    return (
        <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-lg h-screen sticky top-0">
            <div className="flex items-center justify-center h-20 shadow-md dark:shadow-gray-900 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                    <div className="bg-orange-500 rounded-lg w-10 h-10 flex items-center justify-center">
                        <Building className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-800 dark:text-white">DevSongue Suite</h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Gestion d'entreprise</p>
                    </div>
                </div>
            </div>
            
            <nav className="flex-1 px-3 py-4 overflow-y-auto">
                <div className="space-y-1">
                    {(currentUser.role === 'ADMIN' ? navItems : navItems.filter(item => !item.adminOnly)).map((item) => {
                        const isActive = pathname === item.path;
                        const linkClasses = `flex items-center w-full p-3 my-1 rounded-lg transition-all duration-200 ${
                            isActive 
                                ? 'bg-orange-500 text-white shadow-md' 
                                : 'text-gray-700 hover:bg-orange-100 dark:text-gray-300 dark:hover:bg-gray-700 hover:text-orange-600 dark:hover:text-white'
                        }`;
                        
                        return (
                            <Link 
                                key={item.path}
                                href={item.path}
                                className={linkClasses}
                            >
                                <span className={`${isActive ? 'text-white' : 'text-gray-500'}`}>
                                    {item.icon}
                                </span>
                                <span className="ml-3 font-medium text-sm">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
            
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
                    <img 
                        src={currentUser.avatarUrl || '/default-avatar.png'} 
                        alt={currentUser.name} 
                        className="w-10 h-10 rounded-full border-2 border-orange-500"
                    />
                    <div className="ml-3 overflow-hidden">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {currentUser.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {currentUser.role === 'ADMIN' ? 'Administrateur' : 'Manager'}
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
};
