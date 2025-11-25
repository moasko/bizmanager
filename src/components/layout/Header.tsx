import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import type { User, Business, Product } from '../../types';
import { NotificationPanel } from '../shared/NotificationPanel';
import { useNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead, useDeleteNotification } from '@/hooks/useNotification';
import { Bell, Sun, Moon, AlertTriangle, Building, User as UserIcon, LogOut, UserCircle } from 'lucide-react';

interface HeaderProps {
    currentUser: User;
    businesses: Business[];
    activeBusiness: Business | null;
    setActiveBusinessId: (id: string) => void;
    onLogout: () => void;
    lowStockProducts: Product[];
}

const AlertsDropdown: React.FC<{ products: Product[] }> = ({ products }) => (
    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg z-50 border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
                <AlertTriangle className="text-orange-500 mr-2" size={20} />
                <h3 className="font-semibold text-gray-800 dark:text-white">Alertes de Stock</h3>
            </div>
        </div>
        <div className="max-h-80 overflow-y-auto">
            {products.length > 0 ? products.map((p: any) => (
                <div key={p.id} className="flex justify-between items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                    <div className="flex items-center">
                        <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg mr-3">
                            <AlertTriangle className="text-orange-500" size={16} />
                        </div>
                        <div>
                            <p className="font-medium text-gray-800 dark:text-gray-200">{p.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Stock faible</p>
                        </div>
                    </div>
                    <span className="font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded text-sm">
                        {p.stock}
                    </span>
                </div>
            )) : (
                <div className="px-4 py-6 text-center">
                    <AlertTriangle className="mx-auto text-gray-400 mb-2" size={24} />
                    <p className="text-gray-500 dark:text-gray-400">Aucune alerte pour le moment</p>
                </div>
            )}
        </div>
    </div>
);

export const Header: React.FC<HeaderProps> = ({ currentUser, businesses, activeBusiness, setActiveBusinessId, onLogout, lowStockProducts }) => {
    const { theme, toggleTheme } = useTheme();
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [alertsOpen, setAlertsOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    
    // Hooks pour les notifications
    const { data: notifications = [], refetch } = useNotifications(activeBusiness?.id || '');
    const markAsReadMutation = useMarkNotificationAsRead();
    const markAllAsReadMutation = useMarkAllNotificationsAsRead();
    const deleteNotificationMutation = useDeleteNotification();

    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault();
        onLogout();
        setUserDropdownOpen(false);
        setAlertsOpen(false);
        setNotificationsOpen(false);
    };

    // Calculate total businesses for admin users
    const totalBusinesses = businesses.length;
    
    // Calculate total low stock products across all businesses for admins
    const totalLowStockProducts = currentUser.role === 'ADMIN' 
        ? businesses.reduce((total, business) => total + (business.products?.filter(p => p.stock < 10).length || 0), 0)
        : lowStockProducts.length;

    // Handle business switch with persistence
    const handleBusinessSwitch = (businessId: string) => {
        setActiveBusinessId(businessId);
        // The persistence is handled in MainLayout via useEffect
    };
    
    // Gérer les notifications
    const handleMarkAsRead = (id: string) => {
        markAsReadMutation.mutate(id, {
            onSuccess: () => {
                refetch();
            }
        });
    };
    
    const handleMarkAllAsRead = () => {
        if (activeBusiness?.id) {
            markAllAsReadMutation.mutate(activeBusiness.id, {
                onSuccess: () => {
                    refetch();
                }
            });
        }
    };
    
    const handleDeleteNotification = (id: string) => {
        deleteNotificationMutation.mutate(id, {
            onSuccess: () => {
                refetch();
            }
        });
    };

    return (
        <header className="flex items-center justify-between h-20 px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center">
                {activeBusiness?.logoUrl ? (
                    <img 
                        src={activeBusiness.logoUrl} 
                        alt={`${activeBusiness.name} logo`} 
                        className="w-10 h-10 object-contain rounded-md"
                    />
                ) : (
                    <div className="bg-orange-100 dark:bg-orange-900/20 w-10 h-10 rounded-md flex items-center justify-center">
                        <Building className="text-orange-600 dark:text-orange-400" size={20} />
                    </div>
                )}
                <div className="ml-3">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white truncate max-w-xs">
                        {activeBusiness ? activeBusiness.name : (businesses.length > 0 ? 'Sélectionnez une entreprise' : 'Aucune entreprise')}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {currentUser.role === 'ADMIN' 
                            ? `${totalBusinesses} entreprise${totalBusinesses > 1 ? 's' : ''}` 
                            : (activeBusiness ? activeBusiness.type : 'Aucune entreprise')}
                    </p>
                </div>
            </div>

            <div className="flex items-center space-x-4">
                {/* Business Switcher */}
                {businesses.length > 1 && activeBusiness && (
                    <div className="relative hidden md:block">
                        <select 
                            className="appearance-none bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-white py-2 pl-3 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            value={activeBusiness.id}
                            onChange={(e) => handleBusinessSwitch(e.target.value)}
                        >
                            {businesses.map((b: any) => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                )}

                {/* Theme Toggle */}
                <button 
                    onClick={toggleTheme}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
                    aria-label="Toggle theme"
                >
                    {theme === 'light' ? (
                        <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    ) : (
                        <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    )}
                </button>

                {/* Alerts */}
                <div className="relative">
                    <button 
                        onClick={() => {
                            setAlertsOpen(!alertsOpen);
                            setNotificationsOpen(false);
                        }} 
                        className="relative p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
                    >
                        <AlertTriangle className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        {totalLowStockProducts > 0 && (
                            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                {totalLowStockProducts > 9 ? '9+' : totalLowStockProducts}
                            </span>
                        )}
                    </button>
                    {alertsOpen && <AlertsDropdown products={currentUser.role === 'ADMIN' ? businesses.flatMap(b => b.products?.filter(p => p.stock < 10) || []) : lowStockProducts} />}
                </div>

                {/* Notifications */}
                <div className="relative">
                    <button 
                        onClick={() => {
                            setNotificationsOpen(!notificationsOpen);
                            setAlertsOpen(false);
                        }} 
                        className="relative p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
                    >
                        <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        {notifications.filter(n => !n.read).length > 0 && (
                            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                {notifications.filter(n => !n.read).length > 9 ? '9+' : notifications.filter(n => !n.read).length}
                            </span>
                        )}
                    </button>
                </div>

                {/* User Menu */}
                <div className="relative">
                    <button 
                        onClick={() => setUserDropdownOpen(!userDropdownOpen)} 
                        className="flex items-center space-x-2 focus:outline-none group"
                    >
                        <div className="relative">
                            <img 
                                src={currentUser.avatarUrl || '/default-avatar.png'} 
                                alt={currentUser.name} 
                                className="w-9 h-9 rounded-full border-2 border-orange-500"
                            />
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></span>
                        </div>
                        <div className="hidden md:block">
                            <span className="text-sm font-semibold text-gray-700 dark:text-white">{currentUser.name}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 block">
                                {currentUser.role === 'ADMIN' ? 'Administrateur' : 'Manager'}
                            </span>
                        </div>
                    </button>
                    
                    {userDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg z-50 border border-gray-200 dark:border-gray-700 py-2">
                            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center">
                                    <img 
                                        src={currentUser.avatarUrl || '/default-avatar.png'} 
                                        alt={currentUser.name} 
                                        className="w-10 h-10 rounded-full border-2 border-orange-500"
                                    />
                                    <div className="ml-3">
                                        <p className="font-medium text-gray-800 dark:text-white">{currentUser.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {currentUser.role === 'ADMIN' ? 'Administrateur' : 'Manager'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                                <UserCircle className="mr-3" size={18} />
                                Profil
                            </a>
                            
                            <div className="border-t border-gray-200 dark:border-gray-700 mt-1 pt-1">
                                <button 
                                    onClick={handleLogout}
                                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                    <LogOut className="mr-3" size={18} />
                                    Déconnexion
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Panneau de notifications */}
            {notificationsOpen && activeBusiness && (
                <NotificationPanel
                    notifications={notifications}
                    onMarkAsRead={handleMarkAsRead}
                    onMarkAllAsRead={handleMarkAllAsRead}
                    onDelete={handleDeleteNotification}
                    onClose={() => setNotificationsOpen(false)}
                />
            )}
        </header>
    );
};