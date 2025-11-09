import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useBusinesses } from '@/hooks/useBusiness';
import { ChevronDown, Bell, ChevronUp, Moon, Sun } from 'lucide-react';
import type { User, Business, Product } from '../../types';

interface HeaderProps {
    currentUser: User;
    businesses: Business[];
    activeBusiness: Business;
    setActiveBusinessId: (id: string) => void;
    onLogout: () => void;
    lowStockProducts: Product[];
}

const AlertsDropdown: React.FC<{ products: Product[] }> = ({ products }) => (
    <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-md shadow-xl z-20">
        <div className="p-4 font-bold border-b border-gray-200 dark:border-gray-700">Alertes de Stock Faible</div>
        <ul className="py-2 max-h-64 overflow-y-auto">
            {products.length > 0 ? products.map((p: any) => (
                <li key={p.id} className="flex justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                    <span>{p.name}</span>
                    <span className="font-bold text-red-600">Stock: {p.stock}</span>
                </li>
            )) : (
                <li className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">Aucune alerte pour le moment.</li>
            )}
        </ul>
    </div>
);

export const Header: React.FC<HeaderProps> = ({ currentUser, businesses, activeBusiness, setActiveBusinessId, onLogout, lowStockProducts }) => {
    const { theme, toggleTheme } = useTheme();
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [alertsOpen, setAlertsOpen] = useState(false);

    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault();
        onLogout();
        setUserDropdownOpen(false);
        setAlertsOpen(false);
    };

    const handleBusinessChange = (id: string) => {
        setActiveBusinessId(id);
        setUserDropdownOpen(false);
        setAlertsOpen(false);
    };

    // Calculate total businesses for admin users
    const totalBusinesses = businesses.length;
    
    // Calculate total low stock products across all businesses for admins
    const totalLowStockProducts = currentUser.role === 'Admin' 
        ? businesses.reduce((total, business) => total + (business.products?.filter(p => p.stock < 10).length || 0), 0)
        : lowStockProducts.length;

    return (
        <header className="flex items-center justify-between h-20 px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{activeBusiness.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {currentUser.role === 'Admin' 
                        ? `${totalBusinesses} entreprise(s) gérée(s)` 
                        : activeBusiness.type}
                </p>
            </div>

            <div className="flex items-center space-x-6">
                {/* Theme Toggle */}
                <button 
                    onClick={toggleTheme}
                    className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    aria-label="Toggle theme"
                >
                    {theme === 'light' ? (
                        <Moon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                    ) : (
                        <Sun className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                    )}
                </button>

                {/* Business Switcher - Only show for non-admins or when there are multiple businesses */}
                {(currentUser.role !== 'Admin' || businesses.length > 1) && (
                    <div className="relative inline-block w-40">
                        <select
                            value={activeBusiness.id}
                            onChange={(e) => handleBusinessChange(e.target.value)}
                            className="block appearance-none w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            {businesses.map((business) => (
                                <option key={business.id} value={business.id}>
                                    {business.name}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                            <ChevronDown className="fill-current h-4 w-4" />
                        </div>
                    </div>
                )}

                {/* Alerts */}
                <div className="relative">
                    <button onClick={() => setAlertsOpen(!alertsOpen)} className="relative p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
                        <Bell className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                        {totalLowStockProducts > 0 && (
                            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-800 animate-ping"></span>
                        )}
                    </button>
                    {alertsOpen && <AlertsDropdown products={currentUser.role === 'Admin' ? businesses.flatMap(b => b.products?.filter(p => p.stock < 10) || []) : lowStockProducts} />}
                </div>

                {/* User Menu */}
                <div className="relative">
                    <button onClick={() => setUserDropdownOpen(!userDropdownOpen)} className="flex items-center space-x-2 focus:outline-none">
                        <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-10 h-10 rounded-full border-2 border-primary-500" />
                        <div>
                            <span className="text-sm font-semibold text-gray-700 dark:text-white">{currentUser.name}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-300 block">
                                {currentUser.role === 'Admin' ? 'Administrateur' : 'Gérant'}
                            </span>
                        </div>
                         {userDropdownOpen ? <ChevronUp className={`w-4 h-4 text-gray-500 dark:text-gray-300 transition-transform`} /> : <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-300 transition-transform`} />}
                    </button>
                    {userDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-xl z-20">
                             <a href="#" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-500 hover:text-white">Profil</a>
                            <a href="#" onClick={handleLogout} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-primary-500 hover:text-white">Déconnexion</a>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};