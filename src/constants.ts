import type { User, Business } from './types';

// Date filter constants
export const DATE_FILTERS = {
    TODAY: 'today',
    THIS_WEEK: 'this_week',
    THIS_MONTH: 'this_month',
    THIS_YEAR: 'this_year',
    LAST_7_DAYS: 'last_7_days',
    LAST_30_DAYS: 'last_30_days',
    LAST_90_DAYS: 'last_90_days',
    CUSTOM: 'custom'
};

export const getDateRange = (filter: string) => {
    const today = new Date();
    const startDate = new Date();
    const endDate = new Date();

    switch (filter) {
        case DATE_FILTERS.TODAY:
            return { start: today.toISOString().split('T')[0], end: today.toISOString().split('T')[0] };
        case DATE_FILTERS.THIS_WEEK:
            startDate.setDate(today.getDate() - today.getDay());
            endDate.setDate(today.getDate() + (6 - today.getDay()));
            return { 
                start: startDate.toISOString().split('T')[0], 
                end: endDate.toISOString().split('T')[0] 
            };
        case DATE_FILTERS.THIS_MONTH:
            startDate.setDate(1);
            endDate.setMonth(today.getMonth() + 1, 0);
            return { 
                start: startDate.toISOString().split('T')[0], 
                end: endDate.toISOString().split('T')[0] 
            };
        case DATE_FILTERS.THIS_YEAR:
            startDate.setMonth(0, 1);
            endDate.setMonth(11, 31);
            return { 
                start: startDate.toISOString().split('T')[0], 
                end: endDate.toISOString().split('T')[0] 
            };
        case DATE_FILTERS.LAST_7_DAYS:
            startDate.setDate(today.getDate() - 6);
            return { 
                start: startDate.toISOString().split('T')[0], 
                end: today.toISOString().split('T')[0] 
            };
        case DATE_FILTERS.LAST_30_DAYS:
            startDate.setDate(today.getDate() - 29);
            return { 
                start: startDate.toISOString().split('T')[0], 
                end: today.toISOString().split('T')[0] 
            };
        case DATE_FILTERS.LAST_90_DAYS:
            startDate.setDate(today.getDate() - 89);
            return { 
                start: startDate.toISOString().split('T')[0], 
                end: today.toISOString().split('T')[0] 
            };
        default:
            return { start: '', end: '' };
    }
};

export const mockUsers: User[] = [
    {
        id: 'user-1',
        name: 'Koffi Adjoa',
        email: 'koffi.adjoa@devsonguesuite.ci',
        password: 'password123',
        role: 'Admin',
        avatarUrl: 'https://i.pravatar.cc/150?u=admin',
    },
    {
        id: 'user-2',
        name: 'Awa Diallo',
        email: 'awa.diallo@devsonguesuite.ci',
        password: 'password123',
        role: 'Gérant',
        avatarUrl: 'https://i.pravatar.cc/150?u=gerant',
        managedBusinessIds: ['biz-1'],
    },
];

export const mockBusinesses: Business[] = [
    {
        id: 'biz-1',
        name: 'Boutique Adjamé',
        type: 'Commerce de détail',
        sales: [
            { id: 'sale-1', date: '2023-10-26', clientId: 'client-1', clientName: 'Amara Koné', productId: 'prod-1', productName: 'Attiéké 1kg', quantity: 5, unitPrice: 500, total: 2500, saleType: 'Vente en gros' },
            { id: 'sale-2', date: '2023-10-25', clientId: 'client-2', clientName: 'Yao Assi', productId: 'prod-2', productName: 'Huile de palme 50cl', quantity: 3, unitPrice: 1200, total: 3600, saleType: 'Vente au détail' },
            { id: 'sale-3', date: '2023-09-15', clientId: 'client-1', clientName: 'Amara Koné', productId: 'prod-3', productName: 'Savon de Marseille', quantity: 2, unitPrice: 600, total: 1200, saleType: 'Vente au détail' },
        ],
        expenses: [
            { id: 'exp-1', date: '2023-10-20', category: 'Salaire', description: 'Salaire employé', amount: 75000 },
            { id: 'exp-2', date: '2023-10-15', category: 'Services publics', description: 'Facture CIE', amount: 15000 },
            { id: 'exp-3', date: '2023-09-10', category: 'Télécommunications', description: 'Achat de crédit mobile', amount: 10000 },
        ],
        products: [
            { id: 'prod-1', name: 'Attiéké 1kg', category: 'Alimentation', stock: 50, retailPrice: 500, wholesalePrice: 450 },
            { id: 'prod-2', name: 'Huile de palme 50cl', category: 'Alimentation', stock: 30, retailPrice: 1200, wholesalePrice: 1100 },
            { id: 'prod-3', name: 'Savon de Marseille', category: 'Hygiène', stock: 100, retailPrice: 600, wholesalePrice: 550 },
            { id: 'prod-4', name: 'Café Ivoirien 500g', category: 'Alimentation', stock: 25, retailPrice: 2500, wholesalePrice: 2300 },
        ],
        clients: [
            { id: 'client-1', name: 'Amara Koné', contact: '01 23 45 67', telephone: '07 01 23 45 67', email: 'amara.kone@email.ci', address: 'Abidjan, Cocody', balance: -12000 },
            { id: 'client-2', name: 'Yao Assi', contact: '02 34 56 78', telephone: '05 45 67 89 01', email: 'yao.assi@email.ci', address: 'Abidjan, Treichville', balance: 2500 },
        ],
        suppliers: [
            { id: 'sup-1', name: 'Grossiste Abidjan', product: 'Produits alimentaires', contacts: '01 20 30 40', description: 'Fournisseur de produits alimentaires locaux', productTypes: 'Produits de base, épicerie' },
            { id: 'sup-2', name: 'Savonnerie d\'Abidjan', product: 'Savons et détergents', contacts: '02 21 31 41', description: 'Fabricant local de savons artisanaux', productTypes: 'Savons, détergents, produits d\'entretien' },
        ]
    },
    {
        id: 'biz-2',
        name: 'Services Numériques CI',
        type: 'Fourniture de services',
        sales: [
             { id: 'sale-b2-1', date: '2023-10-22', clientId: 'client-b2-1', clientName: 'Société Ivoirienne de Services', productId: 'prod-b2-1', productName: 'Maintenance Informatique', quantity: 1, unitPrice: 150000, total: 150000, saleType: 'Vente au détail' },
        ],
        expenses: [
            { id: 'exp-b2-1', date: '2023-10-05', category: 'Loyer', description: 'Loyer bureau Abidjan', amount: 200000 },
        ],
        products: [
            { id: 'prod-b2-1', name: 'Maintenance Informatique', category: 'Service', stock: 999, retailPrice: 150000, wholesalePrice: 150000 },
        ],
        clients: [
            { id: 'client-b2-1', name: 'Société Ivoirienne de Services', contact: '03 45 67 89', telephone: '01 50 60 70 80', email: 'contact@siv.ci', address: 'Abidjan, Plateau', balance: -150000 },
        ],
        suppliers: [
            { id: 'sup-b2-1', name: 'Fournitures Bureau CI', product: 'Fournitures de bureau', contacts: '03 22 32 42', description: 'Spécialiste en fournitures de bureau et informatiques', productTypes: 'Fournitures de bureau, équipements informatiques' },
        ]
    }
];