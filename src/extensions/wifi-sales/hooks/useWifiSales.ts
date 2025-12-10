import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WifiSale, WeeklyStats } from '../types/wifiSales';
import { useAuth } from '@/contexts/AuthContext';
import { useActiveBusiness } from '@/contexts/ActiveBusinessContext';
import { Product } from '@/types';
import { 
  getWifiTickets, 
  getWifiSales, 
  createWifiSale, 
  createWifiTicket 
} from '../actions/wifiActions';

// Fonction utilitaire pour obtenir le numéro de semaine
const getWeekNumber = (date: Date): number => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

// Hook personnalisé pour gérer les ventes Wi-Fi avec les tables existantes
export const useWifiSales = () => {
  const { activeBusiness } = useActiveBusiness();
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  
  // Récupérer les produits Wi-Fi de l'entreprise
  const { data: wifiProductsData, isLoading: productsLoading, isError: productsError } = useQuery({
    queryKey: ['wifiProducts', activeBusiness?.id],
    queryFn: async () => {
      if (!activeBusiness?.id) return [];
      
      const result = await getWifiTickets(activeBusiness.id);
      if (result.success && result.data) {
        // Return the data as-is since Product interface expects Date objects
        return result.data as Product[];
      }
      return [];
    },
    enabled: !!activeBusiness?.id && !!currentUser,
  });
  
  const wifiProducts: Product[] = Array.isArray(wifiProductsData) ? wifiProductsData : [];
  
  // Récupérer les ventes Wi-Fi de l'entreprise
  const { data: wifiSalesData, isLoading: salesLoading, isError: salesError } = useQuery({
    queryKey: ['wifiSales', activeBusiness?.id],
    queryFn: async () => {
      if (!activeBusiness?.id) return [];
      
      const result = await getWifiSales(activeBusiness.id);
      if (result.success && result.data) {
        // Convertir les ventes en WifiSale
        return result.data.map(sale => ({
          id: sale.id,
          ticketName: sale.productName,
          unitPrice: sale.unitPrice,
          quantitySold: sale.quantity,
          totalAmount: sale.total,
          saleDate: sale.date instanceof Date ? sale.date : new Date(sale.date),
          weekNumber: getWeekNumber(sale.date instanceof Date ? sale.date : new Date(sale.date)),
          year: (sale.date instanceof Date ? sale.date : new Date(sale.date)).getFullYear()
        })) as unknown as WifiSale[];
      }
      return [];
    },
    enabled: !!activeBusiness?.id && !!currentUser,
  });
  
  const sales: WifiSale[] = Array.isArray(wifiSalesData) ? wifiSalesData : [];
  
  // Mutation pour ajouter une vente
  const addSaleMutation = useMutation({
    mutationFn: async (sale: Omit<WifiSale, 'id' | 'totalAmount' | 'weekNumber' | 'year' | 'saleDate'>) => {
      if (!activeBusiness?.id) throw new Error('No active business');
      
      // Validation des données
      if (!sale.ticketName || sale.ticketName.trim() === '') {
        throw new Error('Le nom du ticket est requis');
      }
      
      if (sale.unitPrice <= 0) {
        throw new Error('Le prix unitaire doit être supérieur à zéro');
      }
      
      if (sale.quantitySold <= 0) {
        throw new Error('La quantité vendue doit être supérieure à zéro');
      }
      
      // Trouver le produit correspondant
      const product = wifiProducts.find(p => p.name === sale.ticketName);
      
      // Vérifier le stock si applicable
      if (product && product.stock > 0 && product.stock < sale.quantitySold) {
        throw new Error(`Stock insuffisant. Il ne reste que ${product.stock} tickets disponibles.`);
      }
      
      // Créer la vente
      const result = await createWifiSale(
        activeBusiness.id,
        product?.id || '', // Passer l'ID du produit s'il existe
        sale.ticketName,
        sale.unitPrice,
        sale.quantitySold,
        currentUser?.id
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create Wi-Fi sale');
      }
      
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wifiSales', activeBusiness?.id] });
      queryClient.invalidateQueries({ queryKey: ['wifiProducts', activeBusiness?.id] });
    },
    onError: (error) => {
      console.error('Error in addSaleMutation:', error);
      // Vous pouvez ajouter ici une gestion d'erreur plus spécifique si nécessaire
    }
  });

  // Mutation pour créer un ticket
  const createTicketMutation = useMutation({
    mutationFn: async ({ name, unitPrice, stock }: { name: string; unitPrice: number; stock: number }) => {
      if (!activeBusiness?.id) throw new Error('No active business');
      
      // Validation des données
      if (!name || name.trim() === '') {
        throw new Error('Le nom du ticket est requis');
      }
      
      if (unitPrice <= 0) {
        throw new Error('Le prix unitaire doit être supérieur à zéro');
      }
      
      if (stock < 0) {
        throw new Error('Le stock doit être supérieur ou égal à zéro');
      }
      
      // Créer le ticket
      const result = await createWifiTicket(
        activeBusiness.id,
        name,
        unitPrice,
        stock
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create Wi-Fi ticket');
      }
      
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wifiProducts', activeBusiness?.id] });
    },
    onError: (error) => {
      console.error('Error in createTicketMutation:', error);
    }
  });

  // Ajouter une nouvelle vente
  const addSale = async (sale: Omit<WifiSale, 'id' | 'totalAmount' | 'weekNumber' | 'year' | 'saleDate'>) => {
    await addSaleMutation.mutateAsync(sale);
  };
  
  // Créer un nouveau ticket
  const createTicket = async (name: string, unitPrice: number, stock: number = 100) => {
    await createTicketMutation.mutateAsync({ name, unitPrice, stock });
  };

  // Mutation pour supprimer une vente
  const deleteSaleMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!activeBusiness?.id) throw new Error('No active business');
      
      // Dans une implémentation complète, cela supprimerait une vente de la base de données
      console.log('Deleting sale:', id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wifiSales', activeBusiness?.id] });
    },
  });
  
  // Supprimer une vente
  const deleteSale = async (id: string) => {
    await deleteSaleMutation.mutateAsync(id);
  };
  
  // Obtenir les statistiques de la semaine en cours
  const getCurrentWeekStats = (): WeeklyStats | null => {
    if (sales.length === 0) return null;
    
    const now = new Date();
    const currentWeek = getWeekNumber(now);
    const currentYear = now.getFullYear();
    
    const currentWeekSales = sales.filter(
      sale => sale.weekNumber === currentWeek && sale.year === currentYear
    );
    
    if (currentWeekSales.length === 0) return null;
    
    const totalTicketsSold = currentWeekSales.reduce((sum, sale) => sum + sale.quantitySold, 0);
    const totalRevenue = currentWeekSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const averageTicketPrice = totalRevenue / totalTicketsSold;
    const salesCount = currentWeekSales.length;
    
    return {
      weekNumber: currentWeek,
      year: currentYear,
      totalTicketsSold,
      totalRevenue,
      averageTicketPrice,
      salesCount
    };
  };
  
  // Obtenir l'historique des ventes
  const getSalesHistory = () => {
    return [...sales].sort((a, b) => 
      new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime()
    );
  };
  
  // Obtenir les statistiques hebdomadaires pour plusieurs semaines
  const getWeeklyStats = (weeksCount: number = 4): WeeklyStats[] => {
    if (sales.length === 0) return [];
    
    const now = new Date();
    const currentWeek = getWeekNumber(now);
    const currentYear = now.getFullYear();
    
    const statsMap: { [key: string]: WeeklyStats } = {};
    
    // Initialiser les statistiques pour les X dernières semaines
    for (let i = 0; i < weeksCount; i++) {
      const weekOffset = i;
      let weekNumber = currentWeek - weekOffset;
      let year = currentYear;
      
      // Gérer le passage à l'année précédente
      if (weekNumber <= 0) {
        weekNumber += 52;
        year -= 1;
      }
      
      const key = `${year}-${weekNumber}`;
      statsMap[key] = {
        weekNumber,
        year,
        totalTicketsSold: 0,
        totalRevenue: 0,
        averageTicketPrice: 0,
        salesCount: 0
      };
    }
    
    // Calculer les statistiques pour chaque vente
    sales.forEach(sale => {
      const key = `${sale.year}-${sale.weekNumber}`;
      if (statsMap[key]) {
        const stats = statsMap[key];
        stats.totalTicketsSold += sale.quantitySold;
        stats.totalRevenue += sale.totalAmount;
        stats.salesCount += 1;
        stats.averageTicketPrice = stats.totalRevenue / stats.totalTicketsSold;
      }
    });
    
    // Convertir en tableau et trier par date
    return Object.values(statsMap).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.weekNumber - a.weekNumber;
    });
  };
  
  return {
    wifiProducts,
    sales,
    loading: productsLoading || salesLoading,
    error: productsError || salesError,
    addSale,
    createTicket,
    deleteSale,
    getCurrentWeekStats,
    getSalesHistory,
    getWeeklyStats
  };
};