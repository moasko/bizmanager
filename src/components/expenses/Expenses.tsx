"use client";

import React, { useState } from 'react';
import type { Business, Expense } from '@/types';
import { Button } from '../shared/Button';
import { Modal } from '../shared/Modal';
import { Table } from '../shared/Table';
import { DateFilter } from '../shared';
import { useExpenses, useCreateExpense } from '@/hooks/useExpense';

interface ExpensesProps {
    business: Business;
    onAddExpense: (newExpense: Expense) => void;
}

export const Expenses: React.FC<ExpensesProps> = ({ business, onAddExpense }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<Omit<Expense, 'id'>>({ 
        date: new Date().toISOString().split('T')[0], 
        category: '', 
        description: '', 
        amount: 0 
    });

    const { data: expenses = [], isLoading } = useExpenses(business.id);
    const createExpenseMutation = useCreateExpense();

    // Convert database expense objects to Expense type
    const formattedExpenses = expenses.map((expense: any) => ({
        ...expense,
        date: typeof expense.date === 'string' ? expense.date : expense.date.toISOString().split('T')[0]
    }));

    const handleOpenModal = () => {
        setFormData({ 
            date: new Date().toISOString().split('T')[0], 
            category: '', 
            description: '', 
            amount: 0 
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'amount' ? Number(value) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Create new expense
        await createExpenseMutation.mutateAsync({ 
            businessId: business.id, 
            data: formData 
        });
        
        handleCloseModal();
    };

    const columns = [
        { header: 'Date', accessor: 'date' as keyof Expense },
        { header: 'Catégorie', accessor: 'category' as keyof Expense },
        { header: 'Description', accessor: 'description' as keyof Expense },
        { 
            header: 'Montant', 
            accessor: 'amount' as keyof Expense,
            render: (item: Expense) => `${item.amount.toLocaleString('fr-FR')} FCFA`
        }
    ];

    if (isLoading) {
        return <div className="flex justify-center items-center h-64">Chargement des dépenses...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Dépenses</h1>
                <Button onClick={handleOpenModal}>Ajouter une Dépense</Button>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <Table 
                    columns={columns} 
                    data={formattedExpenses} 
                />
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Ajouter une Dépense">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                        <input
                            type="text"
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Montant (FCFA)</label>
                        <input
                            type="number"
                            id="amount"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="secondary" onClick={handleCloseModal}>Annuler</Button>
                        <Button type="submit" disabled={createExpenseMutation.isPending}>
                            {createExpenseMutation.isPending ? 'Enregistrement...' : 'Ajouter'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};