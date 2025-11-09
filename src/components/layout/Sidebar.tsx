import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { User as UserType } from '../../types';
import {
  Home,
  ShoppingCart,
  Wallet,
  Package,
  Users,
  Truck,
  BarChart,
  User,
  Settings,
  Shield,
  Eye,
  Building,
  UserCircle
} from 'lucide-react';

const NavIcon = ({ icon }: { icon: React.ReactNode }) => (
  <div className="w-6 h-6">
    {icon}
  </div>
);

const navItems = [
  { path: '/dashboard', label: 'Tableau de bord', icon: <Home /> },
  { path: '/sales', label: 'Ventes', icon: <ShoppingCart /> },
  { path: '/expenses', label: 'Dépenses', icon: <Wallet /> },
  { path: '/products', label: 'Produits', icon: <Package /> },
  { path: '/clients', label: 'Clients', icon: <Users /> },
  { path: '/suppliers', label: 'Fournisseurs', icon: <Truck /> },
  { path: '/reports', label: 'Rapports', icon: <BarChart /> },
  { path: '/employees', label: 'Employés', icon: <UserCircle />, adminOnly: true },
  { path: '/settings', label: 'Entreprises', icon: <Settings />, adminOnly: true },
  { path: '/admin-panel', label: 'Panneau Admin', icon: <Shield />, adminOnly: true },
];

interface SidebarProps {
  currentUser: UserType;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentUser }) => {
  const pathname = usePathname();
  
  // Special navigation items for admin users
  const adminNavItems = [
    ...navItems,
    { path: '/admin-panel?view=overview', label: 'Vue d\'Ensemble', icon: <Eye />, adminOnly: true },
    { path: '/admin-panel?view=businesses', label: 'Toutes les Entreprises', icon: <Building />, adminOnly: true },
    { path: '/admin-panel?view=users', label: 'Gestion des Utilisateurs', icon: <User />, adminOnly: true },
    { path: '/admin-panel?view=financial', label: 'Rapports Financiers', icon: <BarChart />, adminOnly: true },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 shadow-lg">
      <div className="flex items-center justify-center h-20 shadow-md dark:shadow-gray-900">
        <img src="/logo.png" alt="Logo" className="h-10 w-10 rounded-2xl text-primary-600" />
        <h1 className="text-xl font-bold ml-2 text-gray-800 dark:text-white">dev Suite</h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {(currentUser.role === 'Admin' ? adminNavItems : navItems).map((item: any) => {
          // Show admin-only items only to admins
          if (item.adminOnly && currentUser.role !== 'Admin') return null;

          const isActive = pathname === item.path;
          const linkClasses = `flex items-center p-3 my-1 rounded-lg transition-colors duration-200 
            ${isActive 
              ? 'bg-primary-500 text-white shadow-md' 
              : 'hover:bg-primary-100 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-white'
            }`;
          
          return (
            <Link 
              key={item.path}
              href={item.path} 
              className={linkClasses}
            >
              <NavIcon icon={item.icon} />
              <span className="ml-4 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};