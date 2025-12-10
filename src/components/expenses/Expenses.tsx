"use client";

import React, { useState, useMemo } from 'react';
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

// Define a type for the form data that omits certain fields from Expense
type ExpenseFormData = Omit<Expense, 'id' | 'businessId' | 'reference' | 'paymentMethod' | 'approvedById' | 'receiptUrl' | 'createdAt' | 'updatedAt' | 'deletedAt'>;

export const Expenses: React.FC<ExpensesProps> = ({ business, onAddExpense }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<ExpenseFormData>({ 
        date: new Date(), // Use Date object internally
        category: '', 
        description: '', 
        amount: 0 
    });

    // Catégories prédéfinies pour les dépenses
    const expenseCategories = [
        'Marketing',
        'Nourriture',
        'Transport',
        'Unité',
        'Salaire',
        'Location',
        'Électricité',
        'Internet',
        'Fournitures de bureau',
        'Voyages',
        'Maintenance',
        'Assurances',
        'Autre'
    ];

    // Utiliser useMemo pour s'assurer que les données sont rechargées lorsque l'entreprise change
    const businessId = useMemo(() => business.id, [business.id]);
    
    const { data: expenses = [], isLoading } = useExpenses(businessId);
    const createExpenseMutation = useCreateExpense();

    const handleOpenModal = () => {
        setFormData({ 
            date: new Date(), // Use Date object internally
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
        setFormData((prev: ExpenseFormData) => ({
            ...prev,
            [name]: name === 'amount' ? Number(value) : 
                   name === 'date' ? new Date(value) : value // Convert date string to Date object
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Create new expense with all required fields
        const expenseData: any = {
            ...formData,
            businessId: business.id,
            reference: `EXP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            paymentMethod: 'CASH', // Valeur par défaut
            approvedById: undefined, // Optionnel
            receiptUrl: undefined, // Optionnel
            createdAt: new Date(), // Use Date object instead of string
            updatedAt: new Date()  // Use Date object instead of string
        };
        
        await createExpenseMutation.mutateAsync({ 
            businessId: business.id, 
            data: expenseData
        });
        
        handleCloseModal();
    };

    const columns = useMemo(() => [
        { header: 'Date', accessor: 'date' as keyof Expense },
        { header: 'Catégorie', accessor: 'category' as keyof Expense },
        { header: 'Description', accessor: 'description' as keyof Expense },
        { 
            header: 'Montant', 
            accessor: 'amount' as keyof Expense,
            render: (item: Expense) => `${item.amount.toLocaleString('fr-FR')} FCFA`
        }
    ], []);

    // Convert database expense objects to Expense type
    const formattedExpenses = useMemo(() => {
        return expenses.map((expense: any) => ({
            ...expense,
            // Format date for display purposes
            date: typeof expense.date === 'string' ? 
                new Date(expense.date).toLocaleDateString('fr-FR') : 
                expense.date.toLocaleDateString('fr-FR')
        }));
    }, [expenses]);

    // Calculer le total des dépenses par catégorie
    const expensesByCategory = useMemo(() => {
        const categoryMap: { [key: string]: number } = {};
        expenses.forEach((expense: any) => {
            const category = expense.category || 'Non catégorisé';
            categoryMap[category] = (categoryMap[category] || 0) + expense.amount;
        });
        return categoryMap;
    }, [expenses]);

    if (isLoading) {
        return (
              <div className="flex w-full h-screen flex-col justify-center items-center  space-y-4">
   <div className="flex items-center space-x-4 p-6">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-orange-200 rounded-full"></div>
          <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <div className="space-y-2">
          <p className="font-semibold text-gray-800">Dépenses</p>
          <p className="text-sm text-gray-600 animate-pulse">Chargement en cours...</p>
        </div>
      </div>
    </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Dépenses - {business.name}</h1>
                <Button onClick={handleOpenModal}>Ajouter une Dépense</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-lg overflow-hidden">
                    <Table 
                        columns={columns} 
                        data={formattedExpenses} 
                    />
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Répartition par catégorie</h3>
                    <ul className="space-y-3">
                        {Object.entries(expensesByCategory)
                            .sort((a, b) => b[1] - a[1])
                            .map(([category, amount]) => (
                                <li key={category} className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="font-medium text-gray-700">{category}</span>
                                    <span className="font-bold text-primary-600">{amount.toLocaleString('fr-FR')} FCFA</span>
                                </li>
                            ))
                        }
                    </ul>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Ajouter une Dépense">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            value={formData.date instanceof Date ? formData.date.toISOString().split('T')[0] : formData.date}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        >
                            <option value="">Sélectionner une catégorie</option>
                            {expenseCategories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                        <p className="mt-1 text-sm text-gray-500">Sélectionnez une catégorie ou entrez une nouvelle catégorie</p>
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            
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