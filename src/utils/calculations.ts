/**
 * Fichier de calculs financiers pour l'application BizManager
 * Contient toutes les fonctions de calcul réutilisables dans l'application
 */

import type { Sale, Expense, Product } from '@/types';

/**
 * Calcule le chiffre d'affaires total à partir d'une liste de ventes
 * @param sales - Liste des ventes
 * @returns Chiffre d'affaires total
 */
export const calculateTotalSalesRevenue = (sales: Sale[]): number => {
    return sales.reduce((sum, sale) => sum + sale.total, 0);
};

/**
 * Calcule le total des dépenses
 * @param expenses - Liste des dépenses
 * @returns Total des dépenses
 */
export const calculateTotalExpenses = (expenses: Expense[]): number => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
};

/**
 * Calcule le coût des marchandises vendues (COGS)
 * @param sales - Liste des ventes
 * @param products - Liste des produits
 * @returns Coût total des marchandises vendues
 */
export const calculateCOGS = (sales: Sale[], products: Product[]): number => {
    return sales.reduce((sum, sale) => {
        // Trouver le produit pour obtenir son prix d'achat
        const product = products.find(p => p.id === sale.productId);
        // Vérifier que le produit existe et que la quantité est valide
        if (product && sale.quantity > 0) {
            // Utiliser le prix d'achat réel du produit (costPrice) si disponible
            // Sinon utiliser le prix de gros (wholesalePrice) par défaut
            const costPrice = product.costPrice > 0 ? product.costPrice : product.wholesalePrice || 0;
            return sum + (costPrice * sale.quantity);
        }
        return sum;
    }, 0);
};

/**
 * Calcule le profit brut (chiffre d'affaires - COGS)
 * @param sales - Liste des ventes
 * @param products - Liste des produits
 * @returns Profit brut
 */
export const calculateGrossProfit = (sales: Sale[], products: Product[]): number => {
    const totalRevenue = calculateTotalSalesRevenue(sales);
    const cogs = calculateCOGS(sales, products);
    return totalRevenue - cogs;
};

/**
 * Calcule les dépenses opérationnelles (excluant le COGS)
 * @param expenses - Liste des dépenses
 * @returns Total des dépenses opérationnelles
 */
export const calculateOperatingExpenses = (expenses: Expense[]): number => {
    // Filtrer les dépenses opérationnelles (en excluant les dépenses ponctuelles ou d'investissement)
    return expenses
        .filter(expense => !expense.category.toLowerCase().includes('capital') &&
            !expense.category.toLowerCase().includes('investment') &&
            !expense.category.toLowerCase().includes('ponctuel') &&
            !expense.category.toLowerCase().includes('equipement') &&
            !expense.category.toLowerCase().includes('matériel') &&
            !expense.category.toLowerCase().includes('véhicule') &&
            !expense.category.toLowerCase().includes('machine'))
        .reduce((sum, expense) => sum + expense.amount, 0);
};

/**
 * Calcule les dépenses ponctuelles ou d'investissement
 * @param expenses - Liste des dépenses
 * @returns Total des dépenses ponctuelles
 */
export const calculateOneTimeExpenses = (expenses: Expense[]): number => {
    return expenses
        .filter(expense => expense.category.toLowerCase().includes('capital') ||
            expense.category.toLowerCase().includes('investment') ||
            expense.category.toLowerCase().includes('ponctuel') ||
            expense.category.toLowerCase().includes('equipement') ||
            expense.category.toLowerCase().includes('matériel') ||
            expense.category.toLowerCase().includes('véhicule') ||
            expense.category.toLowerCase().includes('machine'))
        .reduce((sum, expense) => sum + expense.amount, 0);
};

/**
 * Calcule le profit d'exploitation (profit brut - dépenses opérationnelles)
 * @param sales - Liste des ventes
 * @param expenses - Liste des dépenses
 * @param products - Liste des produits
 * @returns Profit d'exploitation
 */
export const calculateOperatingProfit = (sales: Sale[], expenses: Expense[], products: Product[]): number => {
    const grossProfit = calculateGrossProfit(sales, products);
    const operatingExpenses = calculateOperatingExpenses(expenses);
    return grossProfit - operatingExpenses;
};

/**
 * Calcule le profit net (profit brut - toutes les dépenses)
 * @param sales - Liste des ventes
 * @param expenses - Liste des dépenses
 * @param products - Liste des produits
 * @returns Profit net
 */
export const calculateNetProfit = (sales: Sale[], expenses: Expense[], products: Product[]): number => {
    const grossProfit = calculateGrossProfit(sales, products);
    const totalExpenses = calculateTotalExpenses(expenses);
    return grossProfit - totalExpenses;
};

/**
 * Calcule la valeur totale de l'inventaire
 * @param products - Liste des produits
 * @returns Valeur totale de l'inventaire
 */
export const calculateInventoryValue = (products: Product[]): number => {
    return products.reduce((sum, product) => {
        // Utiliser le prix d'achat si disponible, sinon le prix de gros
        const unitCost = product.costPrice > 0 ? product.costPrice : product.wholesalePrice;
        return sum + (product.stock * unitCost);
    }, 0);
};

/**
 * Calcule les bénéfices avant intérêts, taxes, dépréciation et amortissement (EBITDA)
 * @param sales - Liste des ventes
 * @param expenses - Liste des dépenses
 * @param products - Liste des produits
 * @returns EBITDA
 */
export const calculateEBITDA = (sales: Sale[], expenses: Expense[], products: Product[]): number => {
    // Pour simplifier, nous supposons qu'il n'y a pas d'intérêts, taxes, dépréciation ou amortissement dans ce modèle
    // Dans un vrai système, vous ajusteriez pour ces facteurs
    return calculateOperatingProfit(sales, expenses, products);
};

/**
 * Calcule la marge bénéficiaire en pourcentage
 * @param costPrice - Prix d'achat
 * @param sellingPrice - Prix de vente
 * @returns Marge bénéficiaire en pourcentage
 */
export const calculateProfitMargin = (costPrice: number, sellingPrice: number): number => {
    if (costPrice <= 0 || sellingPrice <= 0) return 0;
    return ((sellingPrice - costPrice) / costPrice) * 100;
};

/**
 * Répartition des dépenses par catégorie
 * @param expenses - Liste des dépenses
 * @returns Objet avec les catégories et leurs montants
 */
export const calculateExpenseBreakdown = (expenses: Expense[]): Record<string, number> => {
    const breakdown: Record<string, number> = {};

    expenses.forEach(expense => {
        const category = expense.category || 'Autre';
        breakdown[category] = (breakdown[category] || 0) + expense.amount;
    });

    return breakdown;
};

/**
 * Calcule le retour sur investissement (ROI)
 * @param sales - Liste des ventes
 * @param expenses - Liste des dépenses
 * @param products - Liste des produits
 * @returns ROI en pourcentage
 */
export const calculateROI = (sales: Sale[], expenses: Expense[], products: Product[]): number => {
    const totalInvestment = calculateOneTimeExpenses(expenses);
    if (totalInvestment === 0) return 0;

    const netProfit = calculateNetProfit(sales, expenses, products);
    return (netProfit / totalInvestment) * 100;
};

/**
 * Calcule la marge brute en pourcentage
 * @param sales - Liste des ventes
 * @param products - Liste des produits
 * @returns Marge brute en pourcentage
 */
export const calculateGrossProfitMargin = (sales: Sale[], products: Product[]): number => {
    const totalRevenue = calculateTotalSalesRevenue(sales);
    if (totalRevenue === 0) return 0;

    const grossProfit = calculateGrossProfit(sales, products);
    return (grossProfit / totalRevenue) * 100;
};

/**
 * Calcule la marge d'exploitation en pourcentage
 * @param sales - Liste des ventes
 * @param expenses - Liste des dépenses
 * @param products - Liste des produits
 * @returns Marge d'exploitation en pourcentage
 */
export const calculateOperatingProfitMargin = (sales: Sale[], expenses: Expense[], products: Product[]): number => {
    const totalRevenue = calculateTotalSalesRevenue(sales);
    if (totalRevenue === 0) return 0;

    const operatingProfit = calculateOperatingProfit(sales, expenses, products);
    return (operatingProfit / totalRevenue) * 100;
};

/**
 * Calcule la marge nette en pourcentage
 * @param sales - Liste des ventes
 * @param expenses - Liste des dépenses
 * @param products - Liste des produits
 * @returns Marge nette en pourcentage
 */
export const calculateNetProfitMargin = (sales: Sale[], expenses: Expense[], products: Product[]): number => {
    const totalRevenue = calculateTotalSalesRevenue(sales);
    if (totalRevenue === 0) return 0;

    const netProfit = calculateNetProfit(sales, expenses, products);
    return (netProfit / totalRevenue) * 100;
};

/**
 * Formate un montant en devise locale
 * @param amount - Montant à formater
 * @returns Montant formaté en devise CFA
 */
export const formatCurrency = (amount: number): string => {
    return `${amount?.toLocaleString('fr-FR')} FCFA`;
};

/**
 * Formate une valeur en pourcentage
 * @param value - Valeur à formater
 * @returns Valeur formatée en pourcentage
 */
export const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
};