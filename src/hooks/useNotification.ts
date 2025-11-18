import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Notification } from '@/types';
import { generateNotifications } from '@/services/notificationService';

// Simuler une API de notifications
let mockNotifications: Notification[] = [
  {
    id: '1',
    businessId: '1',
    type: 'LOW_STOCK',
    priority: 'HIGH',
    title: 'Stock faible',
    message: 'Le produit "iPhone 13" est presque en rupture de stock (2 unités restantes)',
    read: false,
    createdAt: new Date().toISOString(),
    relatedEntityId: 'prod1'
  },
  {
    id: '2',
    businessId: '1',
    type: 'SALES_TARGET',
    priority: 'MEDIUM',
    title: 'Objectif de ventes atteint',
    message: 'Félicitations ! Vous avez atteint 80% de votre objectif mensuel de ventes',
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    businessId: '2',
    type: 'EXPENSE_ALERT',
    priority: 'URGENT',
    title: 'Dépense importante',
    message: 'Une nouvelle dépense de 500.000 FCFA a été enregistrée',
    read: true,
    createdAt: new Date().toISOString(),
    relatedEntityId: 'exp1'
  }
];

// Simuler des appels API
const getNotifications = async (businessId: string): Promise<Notification[]> => {
  // Dans une vraie application, cela ferait un appel API
  // Pour l'instant, nous générons des notifications dynamiquement
  // En production, cela viendrait du serveur
  
  // Filtrer les notifications existantes pour cette entreprise
  const existingNotifications = mockNotifications.filter(n => n.businessId === businessId);
  
  // Dans une vraie application, nous appellerions le service de génération de notifications
  // avec les données réelles de l'entreprise
  // const newNotifications = generateNotifications(businessData);
  
  // Pour cette démonstration, nous retournons les notifications existantes
  return existingNotifications;
};

const markAsRead = async (notificationId: string): Promise<void> => {
  // Dans une vraie application, cela ferait un appel API
  const notification = mockNotifications.find(n => n.id === notificationId);
  if (notification) {
    notification.read = true;
  }
  return Promise.resolve();
};

const markAllAsRead = async (businessId: string): Promise<void> => {
  // Dans une vraie application, cela ferait un appel API
  mockNotifications
    .filter(n => n.businessId === businessId)
    .forEach(n => n.read = true);
  return Promise.resolve();
};

const deleteNotification = async (notificationId: string): Promise<void> => {
  // Dans une vraie application, cela ferait un appel API
  const index = mockNotifications.findIndex(n => n.id === notificationId);
  if (index !== -1) {
    mockNotifications.splice(index, 1);
  }
  return Promise.resolve();
};

// Hook pour récupérer les notifications
export const useNotifications = (businessId: string) => {
  return useQuery({
    queryKey: ['notifications', businessId],
    queryFn: () => getNotifications(businessId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook pour marquer une notification comme lue
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

// Hook pour marquer toutes les notifications comme lues
export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

// Hook pour supprimer une notification
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};