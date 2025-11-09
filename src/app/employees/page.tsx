"use client";

import React from 'react';
import { Employees } from '@/components/employees/Employees';
import { MainLayout } from '@/components/layout/MainLayout';
import { useUsers, useCreateUser, useUpdateUser } from '@/hooks/useUser';
import { useBusinesses } from '@/hooks/useBusiness';

export default function EmployeesPage() {
  const { data: users = [], isLoading: isUsersLoading } = useUsers();
  const { data: businesses = [], isLoading: isBusinessesLoading } = useBusinesses();
  const { mutateAsync: createUser } = useCreateUser();
  const { mutateAsync: updateUser } = useUpdateUser();
  
  if (isUsersLoading || isBusinessesLoading) {
    return <div className="flex justify-center items-center h-64">Chargement des employés...</div>;
  }
  
  const handleAddUser = async (newUser: any) => {
    try {
      await createUser(newUser);
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };
  
  const handleUpdateUser = async (updatedUser: any) => {
    try {
      await updateUser(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  return (
    <MainLayout businesses={businesses}>
      <div className="p-4 md:p-8">
        <Employees 
          users={users} 
          onAddUser={handleAddUser}
          onUpdateUser={handleUpdateUser}
          allBusinesses={businesses} 
        />
      </div>
    </MainLayout>
  );
}