// Interface pour les ventes de tickets Wi-Fi
export interface WifiSale {
  id: string;
  ticketName: string;
  unitPrice: number;
  quantitySold: number;
  totalAmount: number;
  saleDate: string; // Format ISO string
  weekNumber: number;
  year: number;
}

// Interface pour les statistiques hebdomadaires
export interface WeeklyStats {
  weekNumber: number;
  year: number;
  totalTicketsSold: number;
  totalRevenue: number;
  averageTicketPrice: number;
  salesCount: number;
}