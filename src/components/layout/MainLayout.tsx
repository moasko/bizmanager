"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '@/contexts/AuthContext';
import type { Business } from '@/types';

interface MainLayoutProps {
  children: React.ReactNode;
  businesses: Business[];
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  businesses 
}) => {
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  const [activeBusinessId, setActiveBusinessId] = useState<string>(businesses[0]?.id || '');
  
  const activeBusiness = useMemo(() => {
    if (!currentUser) return businesses[0]; 

    const currentActiveBusiness = businesses.find(b => b.id === activeBusinessId);
    
    // For admins, allow access to any business but default to first business
    if (currentUser.role === 'Admin') {
      return currentActiveBusiness || businesses[0];
    }
    
    // For managers, ensure they can only access businesses they manage
    if (currentUser.role === 'Gérant' && currentActiveBusiness && currentUser.managedBusinessIds?.includes(currentActiveBusiness.id)) {
       return currentActiveBusiness;
    }
   
    // Default to first business they manage
    const firstManagedId = currentUser.managedBusinessIds?.[0];
    return businesses.find(b => b.id === firstManagedId) || businesses[0];
  }, [businesses, activeBusinessId, currentUser]);

  const lowStockProducts = useMemo((): any[] => {
    if (!activeBusiness) return [];
    return activeBusiness.products?.filter((p: any) => p.stock < 10) || [];
  }, [activeBusiness]);

  const managedBusinesses = useMemo(() => {
    if (!currentUser) return [];
    
    // Admins can manage all businesses
    if (currentUser.role === 'Admin') {
      return businesses;
    }
    
    // Managers can only manage businesses they're assigned to
    return businesses.filter((b: any) => currentUser.managedBusinessIds?.includes(b.id));
  }, [currentUser, businesses]);

  const handleLogout = () => {
    // Call the logout function from AuthContext
    logout();
    // Redirect to login page
    router.push('/login');
  };

  // Si l'utilisateur n'est pas connecté, le rediriger vers la page de login
  if (!currentUser) {
    router.push('/login');
    return null; // Retourne null pendant la redirection
  }

  return (
    <>
      <Sidebar currentUser={currentUser} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          currentUser={currentUser as any} 
          businesses={managedBusinesses}
          activeBusiness={activeBusiness}
          setActiveBusinessId={setActiveBusinessId}
          onLogout={handleLogout}
          lowStockProducts={lowStockProducts}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </>
  );
};