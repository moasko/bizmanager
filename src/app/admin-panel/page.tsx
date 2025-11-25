"use client";

import React from 'react';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { MainLayout } from '@/components/layout/MainLayout';
import { useBusinesses } from '@/hooks/useBusiness';
import { useUsers } from '@/hooks/useUser';


export default function AdminPanelPage() {
  const { data: businesses = [], isLoading: isBusinessesLoading, error: businessesError } = useBusinesses();
  const { data: users = [], isLoading: isUsersLoading, error: usersError } = useUsers();
  
  console.log('Businesses data:', businesses);
  console.log('Users data:', users);
  console.log('Businesses loading:', isBusinessesLoading);
  console.log('Users loading:', isUsersLoading);
  console.log('Businesses error:', businessesError);
  console.log('Users error:', usersError);

if (isBusinessesLoading || isUsersLoading) {
  return (
    <div className="flex w-full h-screen flex-col justify-center items-center  space-y-4">
   <div className="flex items-center space-x-4 p-6">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-orange-200 rounded-full"></div>
          <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <div className="space-y-2">
          <p className="font-semibold text-gray-800">Panneau d'administration</p>
          <p className="text-sm text-gray-600 animate-pulse">Chargement en cours...</p>
        </div>
      </div>
    </div>
  );
}

  return (
    <MainLayout businesses={businesses}>
      <div className="p-4 md:p-8">
        <AdminPanel allBusinesses={businesses} allUsers={users} />
      </div>
    </MainLayout>
  );
}