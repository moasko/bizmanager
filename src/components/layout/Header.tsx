import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import type { User, Business, Product } from '../../types';

interface HeaderProps {
    currentUser: User;
    businesses: Business[];
    activeBusiness: Business | null; // Correspondre au type du MainLayout
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

    return (
        <header className="flex items-center justify-between h-20 px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {activeBusiness ? activeBusiness.name : (businesses.length > 0 ? 'Sélectionnez une entreprise' : 'Aucune entreprise disponible')}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {currentUser.role === 'ADMIN' 
                        ? `${totalBusinesses} entreprise(s) gérée(s)` 
                        : (activeBusiness ? activeBusiness.type : (businesses.length > 0 ? 'Aucune entreprise sélectionnée' : 'Aucune entreprise disponible'))}
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
                        <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                        </svg>
                    ) : (
                        <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
                        </svg>
                    )}
                </button>

                {/* Business Switcher - Show for all users when there are multiple businesses */}
                {businesses.length > 1 && activeBusiness && (
                    <div className="relative">
                        <select 
                            className="appearance-none w-full bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-white py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white dark:focus:bg-gray-600 focus:border-primary-500"
                            value={activeBusiness.id}
                            onChange={(e) => handleBusinessSwitch(e.target.value)}
                        >
                            {businesses.map((b: any) => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-3300">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                )}

                {/* Alerts */}
                <div className="relative">
                    <button onClick={() => setAlertsOpen(!alertsOpen)} className="relative p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
                        <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                        {totalLowStockProducts > 0 && (
                            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-800 animate-ping"></span>
                        )}
                    </button>
                    {alertsOpen && <AlertsDropdown products={currentUser.role === 'ADMIN' ? businesses.flatMap(b => b.products?.filter(p => p.stock < 10) || []) : lowStockProducts} />}
                </div>

                {/* User Menu */}
                <div className="relative">
                    <button onClick={() => setUserDropdownOpen(!userDropdownOpen)} className="flex items-center space-x-2 focus:outline-none">
                        <img src={currentUser.avatarUrl || '/default-avatar.png'} alt={currentUser.name} className="w-10 h-10 rounded-full border-2 border-primary-500" />
                        <div>
                            <span className="text-sm font-semibold text-gray-700 dark:text-white">{currentUser.name}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-300 block">
                                {currentUser.role === 'ADMIN' ? 'Administrateur' : 'MANAGER'}
                            </span>
                        </div>
                         <svg className={`w-4 h-4 text-gray-500 dark:text-gray-300 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
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