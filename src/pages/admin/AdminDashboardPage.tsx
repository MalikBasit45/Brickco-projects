import React, { useEffect, useState } from 'react';
import { Package, AlertTriangle, ShoppingBag, DollarSign } from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useDashboardMetrics } from '../../hooks/useDashboardMetrics';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
};

const MetricCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}> = ({ title, value, icon, description, trend }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-neutral-600">{title}</p>
        <p className="mt-2 text-3xl font-bold text-neutral-900">{value}</p>
        {description && (
          <p className="mt-1 text-sm text-neutral-500">{description}</p>
        )}
        {trend && (
          <div className={`mt-2 flex items-center gap-1 text-sm font-medium
            ${trend.value === 0 ? 'text-neutral-500' : trend.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
            {trend.value === 0 ? (
              <span className="inline-block">→</span>
            ) : trend.isPositive ? (
              <span className="inline-block">↑</span>
            ) : (
              <span className="inline-block">↓</span>
            )}
            <span>{Math.abs(trend.value)}% from last month</span>
          </div>
        )}
      </div>
      <div className="p-3 bg-primary-50 rounded-full">
        {icon}
      </div>
    </div>
  </div>
);

// Add UserRole type
type UserRole = "admin" | "customer";

const AdminDashboardPage: React.FC = () => {
  const { metrics, monthlyData, recentOrders, isLoading, error } = useDashboardMetrics();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const verifyAdminAccess = async () => {
      try {
        if (!user) {
          toast.error('Please log in to access the admin dashboard');
          navigate('/login');
          return;
        }

        if (user.user_metadata?.role !== "admin") {
          toast.error('You do not have admin access');
          navigate('/');
          return;
        }
      } catch (error) {
        console.error('Error verifying admin access:', error);
        toast.error('Error verifying admin access');
        navigate('/');
      }
    };

    verifyAdminAccess();
  }, [navigate, user]);

  if (!user || user.user_metadata?.role !== "admin") {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-neutral-900 mb-8">Loading dashboard...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Dashboard</h1>
          <p className="text-neutral-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-neutral-900 mb-8">Dashboard Overview</h1>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Stock"
            value={metrics.totalStock.toString()}
            icon={<Package className="w-6 h-6 text-primary-600" />}
            trend={{
              value: metrics.trends.stock,
              isPositive: metrics.trends.stock > 0,
            }}
          />
          <MetricCard
            title="Low Stock Items"
            value={metrics.lowStockCount.toString()}
            icon={<AlertTriangle className="w-6 h-6 text-primary-600" />}
            description="Items below threshold"
          />
          <MetricCard
            title="Monthly Orders"
            value={metrics.totalOrders.toString()}
            icon={<ShoppingBag className="w-6 h-6 text-primary-600" />}
            trend={{
              value: metrics.trends.orders,
              isPositive: metrics.trends.orders > 0,
            }}
          />
          <MetricCard
            title="Monthly Revenue"
            value={formatCurrency(metrics.totalRevenue)}
            icon={<DollarSign className="w-6 h-6 text-primary-600" />}
            trend={{
              value: metrics.trends.revenue,
              isPositive: metrics.trends.revenue > 0,
            }}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Revenue Trend</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#4f46e5"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Orders Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Orders Trend</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-neutral-200">
            <h2 className="text-lg font-semibold text-neutral-900">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {order.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      {formatCurrency(order.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage; 