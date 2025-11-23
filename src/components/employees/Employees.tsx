"use client";

import React, { useState } from 'react';
import type { User, Business, UserRole } from '@/types';
import { Button } from '../shared/Button';
import { Modal } from '../shared/Modal';
import { Table, Column } from '../shared/Table';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '@/hooks/useUser';
import { Pen, PenBox, TrashIcon } from 'lucide-react';

interface EmployeesProps {
    users: User[];
    onAddUser: (newUser: User) => void;
    onUpdateUser: (updatedUser: User) => void;
    allBusinesses: Business[];
}

// Form data interface to ensure all fields are strings for form inputs
interface UserFormData {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    avatarUrl: string;
    managedBusinessIds: string[];
}

export const Employees: React.FC<EmployeesProps> = ({ users, allBusinesses }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState<UserFormData>({ 
        name: '', 
        email: '', 
        password: '', 
        role: 'MANAGER', 
        avatarUrl: '', 
        managedBusinessIds: [] 
    });
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    const { data: fetchedUsers = [], isLoading } = useUsers();
    const createUserMutation = useCreateUser();
    const updateUserMutation = useUpdateUser();
    const deleteUserMutation = useDeleteUser();

    const handleOpenModal = (user?: User) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                name: user.name,
                email: user.email,
                password: '', // Always reset password when editing
                role: user.role,
                avatarUrl: user.avatarUrl || '', // Handle null/undefined avatarUrl
                managedBusinessIds: user.managedBusinessIds || []
            });
        } else {
            setEditingUser(null);
            setFormData({ 
                name: '', 
                email: '', 
                password: '', 
                role: 'MANAGER', 
                avatarUrl: '', 
                managedBusinessIds: [] 
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const role = e.target.value as UserRole;
        setFormData(prev => ({
            ...prev,
            role,
            managedBusinessIds: role === 'ADMIN' ? [] : prev.managedBusinessIds
        }));
    };

    const handleBusinessChange = (businessId: string, checked: boolean) => {
        setFormData(prev => {
            const managedBusinessIds = checked 
                ? [...(prev.managedBusinessIds || []), businessId]
                : (prev.managedBusinessIds || []).filter(id => id !== businessId);
            return { ...prev, managedBusinessIds };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingUser) {
            // Update existing user
            await updateUserMutation.mutateAsync({ 
                id: editingUser.id, 
                data: formData 
            });
        } else {
            // Create new user
            await createUserMutation.mutateAsync(formData);
        }
        
        handleCloseModal();
    };

    const handleDeleteUser = (user: User) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteUser = async () => {
        if (userToDelete) {
            await deleteUserMutation.mutateAsync(userToDelete.id);
            setIsDeleteModalOpen(false);
            setUserToDelete(null);
        }
    };

    const columns: Column<User>[] = [
        { header: 'Nom', accessor: 'name' },
        { header: 'Email', accessor: 'email' },
        { 
            header: 'Entreprises Gérées', 
            accessor: 'managedBusinessIds',
            render: (item: User) => {
                if (item.role === 'ADMIN') {
                    return <span className="text-gray-500">Toutes les entreprises</span>;
                }
                
                const businessCount = item.managedBusinessIds?.length || 0;
                return <span>{businessCount} entreprise{businessCount > 1 ? 's' : ''}</span>;
            }
        },
      
        { 
            header: 'Rôle', 
            accessor: 'role',
            render: (item: User) => {
                return item.role === 'ADMIN' ? 'Administrateur' : 'Gérant';
            }
        },
        {
            header: 'Actions',
            accessor: 'id',
            render: (item: User) => (
                <div className="flex gap-2">
                    <button onClick={() => handleOpenModal(item)} className="text-blue-500 hover:underline p-2 hover:bg-blue-200 rounded">
                        <PenBox className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteUser(item)} className="text-red-500 hover:underline p-2 hover:bg-red-200 rounded">
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    if (isLoading) {
        return (
              <div className="flex w-full h-screen flex-col justify-center items-center  space-y-4">
   <div className="flex items-center space-x-4 p-6">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-orange-200 rounded-full"></div>
          <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <div className="space-y-2">
          <p className="font-semibold text-gray-800">Employees</p>
          <p className="text-sm text-gray-600 animate-pulse">Chargement en cours...</p>
        </div>
      </div>
    </div>
        );
    }

    // Use fetched users if available, otherwise use the prop users
    const displayedUsers = fetchedUsers.length > 0 ? fetchedUsers : users;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Employés</h1>
                <Button onClick={() => handleOpenModal()}>Ajouter un Employé</Button>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <Table 
                    columns={columns} 
                    data={displayedUsers} 
                />
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingUser ? "Modifier l'Employé" : "Ajouter un Employé"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            {editingUser ? 'Nouveau Mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe'}
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required={!editingUser}
                        />
                    </div>
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleRoleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        >
                            <option value="MANAGER">Gérant</option>
                            <option value="ADMIN">Administrateur</option>
                        </select>
                    </div>
                    {formData.role === 'MANAGER' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Entreprises à gérer</label>
                            <div className="space-y-2 max-h-40 overflow-y-auto p-2 border border-gray-300 rounded-md">
                                {allBusinesses.map((business: any) => (
                                    <div key={business.id} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={`business-${business.id}`}
                                            checked={formData.managedBusinessIds?.includes(business.id) || false}
                                            onChange={(e) => handleBusinessChange(business.id, e.target.checked)}
                                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor={`business-${business.id}`} className="ml-2 block text-sm text-gray-700">
                                            {business.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <div>
                        <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-700 mb-1">URL de l'avatar</label>
                        <input
                            type="text"
                            id="avatarUrl"
                            name="avatarUrl"
                            value={formData.avatarUrl}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="https://example.com/avatar.jpg"
                        />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="secondary" onClick={handleCloseModal}>Annuler</Button>
                        <Button type="submit" disabled={createUserMutation.isPending || updateUserMutation.isPending}>
                            {createUserMutation.isPending || updateUserMutation.isPending ? 'Enregistrement...' : 
                             editingUser ? 'Mettre à Jour' : 'Ajouter'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Modal de confirmation de suppression */}
            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirmer la suppression">
                <div className="space-y-4">
                    <p className="text-gray-700 dark:text-gray-300">
                        Êtes-vous sûr de vouloir supprimer l'employé <strong>{userToDelete?.name}</strong> ? Cette action est irréversible.
                    </p>
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button 
                            type="button" 
                            variant="secondary" 
                            onClick={() => setIsDeleteModalOpen(false)}
                            disabled={deleteUserMutation.isPending}
                        >
                            Annuler
                        </Button>
                        <Button 
                            type="button" 
                            variant="danger" 
                            onClick={confirmDeleteUser}
                            disabled={deleteUserMutation.isPending}
                        >
                            {deleteUserMutation.isPending ? 'Suppression...' : 'Supprimer'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};