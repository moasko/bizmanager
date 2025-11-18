import React from 'react';
import type { Notification, NotificationType, NotificationPriority } from '@/types';
import { Bell, X, Check, AlertTriangle, ShoppingCart, TrendingUp, AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface NotificationPanelProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'LOW_STOCK':
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case 'SALES_TARGET':
      return <TrendingUp className="h-5 w-5 text-green-500" />;
    case 'EXPENSE_ALERT':
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    case 'NEW_SALE':
      return <ShoppingCart className="h-5 w-5 text-blue-500" />;
    case 'NEW_EXPENSE':
      return <AlertCircle className="h-5 w-5 text-orange-500" />;
    default:
      return <Bell className="h-5 w-5 text-gray-500" />;
  }
};

const getPriorityColor = (priority: NotificationPriority) => {
  switch (priority) {
    case 'LOW':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    case 'MEDIUM':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
    case 'HIGH':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100';
    case 'URGENT':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
};

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClose
}) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md h-full overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center">
            <Bell className="h-6 w-6 text-gray-600 dark:text-gray-300 mr-2" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Notifications
            </h2>
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                {unreadCount}
              </span>
            )}
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {notifications.length > 0 ? (
          <>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {unreadCount} non lue{unreadCount !== 1 ? 's' : ''}
              </span>
              <Button 
                variant="secondary" 
                onClick={onMarkAllAsRead}
                disabled={unreadCount === 0}
                className="px-3 py-1 text-sm"
              >
                <Check className="h-4 w-4 mr-1" />
                Tout marquer comme lu
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex">
                    <div className="flex-shrink-0 mr-3">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {notification.title}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                          {notification.priority}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {notification.message}
                      </p>
                      <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <span>
                          {new Date(notification.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end space-x-2">
                    {!notification.read && (
                      <Button 
                        variant="secondary" 
                        onClick={() => onMarkAsRead(notification.id)}
                        className="px-2 py-1 text-xs"
                      >
                        Marquer comme lu
                      </Button>
                    )}
                    <Button 
                      variant="danger" 
                      onClick={() => onDelete(notification.id)}
                      className="px-2 py-1 text-xs"
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <Bell className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
              Aucune notification
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Vous n'avez aucune notification pour le moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};