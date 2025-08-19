
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

interface RealTimeDataContextType {
  isConnected: boolean;
  lastUpdate: Date | null;
  subscribe: (callback: (data: any) => void) => () => void;
  unsubscribe: (callback: (data: any) => void) => void;
}

const RealTimeDataContext = createContext<RealTimeDataContextType | undefined>(undefined);

interface RealTimeDataProviderProps {
  children: ReactNode;
  refreshInterval?: number;
}

export const RealTimeDataProvider: React.FC<RealTimeDataProviderProps> = ({
  children,
  refreshInterval = 30000 // 30 seconds default
}) => {
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [subscribers, setSubscribers] = useState<((data: any) => void)[]>([]);
  const { toast } = useToast();

  const subscribe = (callback: (data: any) => void) => {
    setSubscribers(prev => [...prev, callback]);
    return () => unsubscribe(callback);
  };

  const unsubscribe = (callback: (data: any) => void) => {
    setSubscribers(prev => prev.filter(sub => sub !== callback));
  };

  const fetchAndBroadcastData = async () => {
    try {
      setIsConnected(true);
      
      // Aggregate data from multiple sources
      const [dashboardData, alertsData, trendsData] = await Promise.allSettled([
        window.ezsite.apis.run({ path: 'getAnalyticsDashboardData', param: [1, 'Administrator', 'daily'] }),
        window.ezsite.apis.run({ path: 'checkAnalyticsAlerts', param: [] }),
        window.ezsite.apis.run({ path: 'getAnalyticsTrends', param: ['all', 'daily'] })
      ]);

      const aggregatedData = {
        dashboard: dashboardData.status === 'fulfilled' ? dashboardData.value.data : null,
        alerts: alertsData.status === 'fulfilled' ? alertsData.value.data : null,
        trends: trendsData.status === 'fulfilled' ? trendsData.value.data : null,
        timestamp: new Date().toISOString()
      };

      // Notify all subscribers
      subscribers.forEach(callback => {
        try {
          callback(aggregatedData);
        } catch (error) {
          console.error('Error in real-time data subscriber:', error);
        }
      });

      setLastUpdate(new Date());
      
    } catch (error) {
      console.error('Failed to fetch real-time data:', error);
      setIsConnected(false);
      
      toast({
        title: "Connection Error",
        description: "Failed to fetch real-time updates. Retrying...",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchAndBroadcastData();

    // Set up polling interval
    const interval = setInterval(fetchAndBroadcastData, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, subscribers.length]);

  const value: RealTimeDataContextType = {
    isConnected,
    lastUpdate,
    subscribe,
    unsubscribe
  };

  return (
    <RealTimeDataContext.Provider value={value}>
      {children}
    </RealTimeDataContext.Provider>
  );
};

export const useRealTimeData = () => {
  const context = useContext(RealTimeDataContext);
  if (context === undefined) {
    throw new Error('useRealTimeData must be used within a RealTimeDataProvider');
  }
  return context;
};
