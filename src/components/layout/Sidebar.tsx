import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { User } from '../../types';

const NavIcon = ({ path }: { path: string }) => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={path}></path>
    </svg>
);

const navItems = [
    { path: '/dashboard', label: 'Tableau de bord', iconPath: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { path: '/sales', label: 'Ventes', iconPath: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01' },
    { path: '/expenses', label: 'Dépenses', iconPath: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 14l-6-6m5.5.5h.01M5 14l6-6m-5.5.5h.01' },
    { path: '/products', label: 'Produits', iconPath: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { path: '/clients', label: 'Clients', iconPath: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { path: '/suppliers', label: 'Fournisseurs', iconPath: 'M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z' },
    { path: '/reports', label: 'Rapports', iconPath: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { path: '/employees', label: 'Employés', iconPath: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.995 5.995 0 0012 12a5.995 5.995 0 00-3-5.197M15 21a9 9 0 00-9-9', adminOnly: true },
    { path: '/settings', label: 'Entreprises', iconPath: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m5-4h1m-1 4h1m-1-8h1m-5 8h1m-1-4h1', adminOnly: true },
    { path: '/admin-panel', label: 'Panneau Admin', iconPath: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426-1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z', adminOnly: true },
];

interface SidebarProps {
    currentUser: User;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentUser }) => {
    const pathname = usePathname();
    
    // Special navigation items for admin users
    const adminNavItems = [
        ...navItems
    ];

    return (
        <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 shadow-lg">
            <div className="flex items-center justify-center h-20 shadow-md dark:shadow-gray-900">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10m16-10v10M4 7h16M4 17h16M9 7v10m6-10v10" />
                </svg>
                <h1 className="text-xl font-bold ml-2 text-gray-800 dark:text-white">BizSuite</h1>
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
                            <NavIcon path={item.iconPath} />
                            <span className="ml-4 font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
};