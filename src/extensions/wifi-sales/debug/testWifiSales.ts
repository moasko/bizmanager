// Script de débogage pour tester la récupération des ventes Wi-Fi
import { getWifiSales, getWifiTickets } from '../actions/wifiActions';

async function debugWifiSales(businessId: string) {
  console.log('=== Debug Wi-Fi Sales ===');
  console.log('Business ID:', businessId);
  
  // Récupérer les tickets Wi-Fi
  console.log('\n1. Récupération des tickets Wi-Fi:');
  const ticketsResult = await getWifiTickets(businessId);
  console.log('Success:', ticketsResult.success);
  if (ticketsResult.success && ticketsResult.data) {
    console.log('Tickets trouvés:', ticketsResult.data.length);
    ticketsResult.data.forEach((ticket: any) => {
      console.log(`  - ${ticket.name} (${ticket.id})`);
    });
  } else {
    console.log('Erreur:', ticketsResult.error);
  }
  
  // Récupérer les ventes Wi-Fi
  console.log('\n2. Récupération des ventes Wi-Fi:');
  const salesResult = await getWifiSales(businessId);
  console.log('Success:', salesResult.success);
  if (salesResult.success && salesResult.data) {
    console.log('Ventes trouvées:', salesResult.data.length);
    salesResult.data.forEach((sale: any) => {
      console.log(`  - ${sale.productName} x${sale.quantity} = ${sale.total} FCFA (${sale.date})`);
    });
  } else {
    console.log('Erreur:', salesResult.error);
  }
}

// Exemple d'utilisation:
// debugWifiSales('YOUR_BUSINESS_ID_HERE');

export default debugWifiSales;