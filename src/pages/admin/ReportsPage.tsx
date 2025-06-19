import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const useLocalApi = import.meta.env.VITE_USE_LOCAL_API === 'true';
const apiUrl = import.meta.env.VITE_API_URL;

interface TrendData {
  month: string;
  value: number;
}

interface RevenueData {
  month: string;
  revenue: number;
  orderCount: number;
  averageOrderValue: number;
}

const ReportsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthlyRevenueTrend, setMonthlyRevenueTrend] = useState<TrendData[]>([]);
  const [monthlyOrdersTrend, setMonthlyOrdersTrend] = useState<TrendData[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);

  const fetchTrends = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/analytics/trends`);
      if (!response.ok) {
        throw new Error('Failed to fetch trends');
      }
      const data = await response.json();
      setMonthlyRevenueTrend(data.monthlyRevenueTrend);
      setMonthlyOrdersTrend(data.monthlyOrdersTrend);
      setError(null);
    } catch (err) {
      console.error('Error fetching trends:', err);
      setError('Failed to fetch trends');
      toast.error('Failed to fetch trends');
    }
  };

  const fetchRevenueData = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/analytics/revenue`);
      if (!response.ok) {
        throw new Error('Failed to fetch revenue data');
      }
      const data = await response.json();
      setRevenueData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching revenue data:', err);
      setError('Failed to fetch revenue data');
      toast.error('Failed to fetch revenue data');
    }
  };

  useEffect(() => {
    Promise.all([fetchTrends(), fetchRevenueData()])
      .finally(() => setIsLoading(false));
  }, []);

  const handleExport = async (type: 'orders' | 'customers' | 'revenue') => {
    try {
      const response = await fetch(`${apiUrl}/api/analytics/${type}?format=csv`);
      if (!response.ok) {
        throw new Error(`Failed to export ${type}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-report.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} report exported successfully`);
    } catch (err) {
      console.error(`Error exporting ${type}:`, err);
      toast.error(`Failed to export ${type} report`);
    }
  };

  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split('-');
    return `${new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleString('default', { month: 'short' })} ${year}`;
  };

  if (isLoading) {
    return <div className="p-8">Loading reports...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">{error}</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('orders')}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700"
          >
            <Download className="w-4 h-4" />
            Export Orders
          </button>
          <button
            onClick={() => handleExport('customers')}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700"
          >
            <Download className="w-4 h-4" />
            Export Customers
          </button>
          <button
            onClick={() => handleExport('revenue')}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700"
          >
            <Download className="w-4 h-4" />
            Export Revenue
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Monthly Revenue Trend</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyRevenueTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickFormatter={formatMonth}
                />
                <YAxis
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                  labelFormatter={formatMonth}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  name="Revenue"
                  stroke="#4f46e5"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Trend Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Monthly Orders Trend</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyOrdersTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickFormatter={formatMonth}
                />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [value, 'Orders']}
                  labelFormatter={formatMonth}
                />
                <Legend />
                <Bar
                  dataKey="value"
                  name="Orders"
                  fill="#4f46e5"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly Stats Table */}
      <div className="mt-6">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Month</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Orders</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Avg. Order Value</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {revenueData.map((data) => (
                <tr key={data.month}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    {formatMonth(data.month)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    ${data.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    {data.orderCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    ${data.averageOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;