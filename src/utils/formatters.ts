// Helper function to format currency
export const formatCurrency = (amount: number): string => {
    return `${amount?.toLocaleString('fr-FR')} FCFA`;
};