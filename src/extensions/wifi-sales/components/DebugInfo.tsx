import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { useWifiSales } from '../hooks/useWifiSales';

const DebugInfo: React.FC = () => {
  const { wifiProducts, sales } = useWifiSales();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchDebugInfo = async () => {
    setLoading(true);
    try {
      // Simuler la récupération des informations de débogage
      const info = {
        products: wifiProducts,
        sales: sales,
        productCount: wifiProducts.length,
        salesCount: sales.length,
        timestamp: new Date().toISOString()
      };
      setDebugInfo(info);
    } catch (error) {
      console.error('Error fetching debug info:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-8 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-gray-800 dark:text-white">
          Informations de Débogage
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">Tickets Wi-Fi:</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">{wifiProducts.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">Ventes Wi-Fi:</span>
            <span className="font-semibold text-green-600 dark:text-green-400">{sales.length}</span>
          </div>
          
          <Button 
            onClick={fetchDebugInfo}
            disabled={loading}
            className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white"
          >
            {loading ? 'Chargement...' : 'Actualiser les données'}
          </Button>
          
          {debugInfo && (
            <div className="mt-4 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-600">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Détails:</h3>
              <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-auto max-h-40">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DebugInfo;