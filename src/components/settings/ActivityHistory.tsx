import React from 'react';
import type { AuditLog } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ActivityHistoryProps {
  activities: AuditLog[];
}

export const ActivityHistory: React.FC<ActivityHistoryProps> = ({ activities }) => {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucune activité récente</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Aucune activité n'a été enregistrée pour cette entreprise.
        </p>
      </div>
    );
  }

  // Regrouper les activités par date
  const groupedActivities: { [key: string]: AuditLog[] } = {};
  
  activities.forEach(activity => {
    const date = format(new Date(activity.createdAt), 'yyyy-MM-dd');
    if (!groupedActivities[date]) {
      groupedActivities[date] = [];
    }
    groupedActivities[date].push(activity);
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {Object.entries(groupedActivities).map(([date, dayActivities]) => (
          <div key={date} className="p-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              {format(new Date(date), 'dd MMMM yyyy', { locale: fr })}
            </h3>
            <ul className="space-y-3">
              {dayActivities.map((activity) => (
                <li key={activity.id} className="flex items-start">
                  <div className="relative px-1">
                    <div className="h-4 w-4 bg-primary-500 rounded-full ring-4 ring-primary-100 dark:ring-gray-700"></div>
                  </div>
                  <div className="min-w-0 flex-1 ml-3">
                    <p className="text-sm text-gray-800 dark:text-white">
                      {activity.action}
                    </p>
                    {activity.details && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {JSON.stringify(activity.details)}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {format(new Date(activity.createdAt), 'HH:mm', { locale: fr })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};