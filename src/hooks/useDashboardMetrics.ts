import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { ensureStockSnapshot } from '../lib/stockHistory';

export interface DashboardMetrics {
  totalStock: number;
  lowStockCount: number;
  totalOrders: number;
  totalRevenue: number;
  trends: {
    stock: number;
    orders: number;
    revenue: number;
  };
}

export interface MonthlyData {
  month: string;
  orders?: number;
  revenue?: number;
}

export interface RecentOrder {
  id: string;
  customerId: string;
  amount: number;
  status: string;
  createdAt: string;
  customer: string;
}

const useLocalApi = import.meta.env.VITE_USE_LOCAL_API === 'true';
const apiUrl = import.meta.env.VITE_API_URL;

export const useDashboardMetrics = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalStock: 0,
    lowStockCount: 0,
    totalOrders: 0,
    totalRevenue: 0,
    trends: {
      stock: 0,
      orders: 0,
      revenue: 0,
    },
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const fetchLocalMetrics = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/dashboard/metrics`);
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard metrics');
      }
      
      const data = await response.json();
      
      // Update metrics
      setMetrics({
        totalStock: data.totalStock,
        lowStockCount: data.lowStockCount,
        totalOrders: data.totalOrders,
        totalRevenue: data.totalRevenue,
        trends: {
          stock: 0, // Local API doesn't provide trends yet
          orders: 0,
          revenue: 0,
        },
      });

      // Combine orders and revenue trends into monthly data
      const combinedMonthlyData = data.monthlyOrdersTrend.map((orderData: any, index: number) => ({
        month: orderData.month,
        orders: orderData.orders,
        revenue: data.monthlyRevenueTrend[index].revenue,
      }));

      setMonthlyData(combinedMonthlyData);
      setRecentOrders(data.recentOrders);
      setError(null);
    } catch (err) {
      console.error('Error fetching local metrics:', err);
      setError('Failed to fetch dashboard metrics');
      toast.error('Failed to fetch dashboard metrics');
    }
  };

  const fetchSupabaseMetrics = async () => {
    try {
      await ensureStockSnapshot();
      
      // Original Supabase fetching logic
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

      // Fetch current bricks data
      const { data: bricksData, error: bricksError } = await supabase
        .from('bricks')
        .select('stock, minStockThreshold');

      if (bricksError) throw bricksError;

      // Fetch current month's orders
      const { data: currentOrdersData, error: currentOrdersError } = await supabase
        .from('orders')
        .select('total_amount')
        .gte('created_at', currentMonthStart.toISOString());

      if (currentOrdersError) throw currentOrdersError;

      // Fetch previous month's orders
      const { data: previousOrdersData, error: previousOrdersError } = await supabase
        .from('orders')
        .select('total_amount')
        .gte('created_at', previousMonthStart.toISOString())
        .lt('created_at', currentMonthStart.toISOString());

      if (previousOrdersError) throw previousOrdersError;

      // Calculate metrics
      const totalStock = bricksData.reduce((sum, brick) => sum + (brick.stock || 0), 0);
      const lowStockCount = bricksData.filter(
        brick => (brick.stock || 0) < (brick.minStockThreshold || 10)
      ).length;

      const totalOrders = currentOrdersData.length;
      const totalRevenue = currentOrdersData.reduce(
        (sum, order) => sum + (order.total_amount || 0),
        0
      );

      const previousOrders = previousOrdersData.length;
      const previousRevenue = previousOrdersData.reduce(
        (sum, order) => sum + (order.total_amount || 0),
        0
      );

      // Get previous month's stock snapshot
      const { data: previousStockData } = await supabase
        .from('stock_history')
        .select('total_stock')
        .eq('month', previousMonthStart.toISOString().slice(0, 7))
        .single();

      const previousStock = previousStockData?.total_stock || totalStock;

      // Calculate trends
      const trends = {
        stock: calculateTrend(totalStock, previousStock),
        orders: calculateTrend(totalOrders, previousOrders),
        revenue: calculateTrend(totalRevenue, previousRevenue),
      };

      setMetrics({
        totalStock,
        lowStockCount,
        totalOrders,
        totalRevenue,
        trends,
      });
    } catch (err) {
      console.error('Error fetching Supabase metrics:', err);
      setError('Failed to fetch dashboard metrics');
      toast.error('Failed to fetch dashboard metrics');
    }
  };

  const setupRealtimeSubscriptions = () => {
    if (useLocalApi) {
      // For local API, we'll just refetch periodically
      const interval = setInterval(fetchLocalMetrics, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    } else {
      // Original Supabase subscriptions
      const bricksSubscription = supabase
        .channel('bricks-changes')
        .on('postgres_changes',
            { event: '*', schema: 'public', table: 'bricks' },
            () => {
              fetchSupabaseMetrics();
            })
        .subscribe();

      const ordersSubscription = supabase
        .channel('orders-changes')
        .on('postgres_changes',
            { event: '*', schema: 'public', table: 'orders' },
            () => {
              fetchSupabaseMetrics();
            })
        .subscribe();

      return () => {
        bricksSubscription.unsubscribe();
        ordersSubscription.unsubscribe();
      };
    }
  };

  useEffect(() => {
    setIsLoading(true);
    const fetchData = useLocalApi ? fetchLocalMetrics : fetchSupabaseMetrics;
    
    fetchData()
      .finally(() => setIsLoading(false));

    const cleanup = setupRealtimeSubscriptions();
    return cleanup;
  }, []);

  return {
    metrics,
    monthlyData,
    recentOrders,
    isLoading,
    error,
    refetch: useLocalApi ? fetchLocalMetrics : fetchSupabaseMetrics,
  };
}; 