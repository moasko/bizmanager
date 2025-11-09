"use client";

import React from 'react';
import { AdminPanel } from '@/components/admin/AdminPanel';
import { MainLayout } from '@/components/layout/MainLayout';
import { useBusinesses } from '@/hooks/useBusiness';
import { useUsers } from '@/hooks/useUser';

export default function AdminPanelPage() {
  const { data: businesses = [], isLoading: isBusinessesLoading } = useBusinesses();
  const { data: users = [], isLoading: isUsersLoading } = useUsers();
  
  if (isBusinessesLoading || isUsersLoading) {
    return <div className="flex justify-center items-center h-64">Chargement du panneau d'administration...</div>;
  }

  return (
    <MainLayout businesses={businesses}>
      <div className="p-4 md:p-8">
        <AdminPanel allBusinesses={businesses} allUsers={users} />
      </div>
    </MainLayout>
  );
}