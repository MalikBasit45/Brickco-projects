import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';

const useLocalApi = import.meta.env.VITE_USE_LOCAL_API === 'true';
const apiUrl = import.meta.env.VITE_API_URL;

interface Spend {
  id: string;
  labour: number;
  clay: number;
  coal: number;
  transport: number;
  other: number;
  month: string;
  year: string;
  total: number;
  createdAt: string;
}

const SpendsPage: React.FC = () => {
  const [spends, setSpends] = useState<Spend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    labour: '',
    clay: '',
    coal: '',
    transport: '',
    other: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  const fetchSpends = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/spends`);
      if (!response.ok) {
        throw new Error('Failed to fetch spends');
      }
      const data = await response.json();
      setSpends(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching spends:', err);
      setError('Failed to fetch spends');
      toast.error('Failed to fetch spends');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSpends();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${apiUrl}/api/spends`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          labour: parseFloat(formData.labour) || 0,
          clay: parseFloat(formData.clay) || 0,
          coal: parseFloat(formData.coal) || 0,
          transport: parseFloat(formData.transport) || 0,
          other: parseFloat(formData.other) || 0
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create spend');
      }

      await fetchSpends();
      toast.success('Spend added successfully');
      
      // Reset form
      setFormData({
        labour: '',
        clay: '',
        coal: '',
        transport: '',
        other: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      });
    } catch (err) {
      console.error('Error creating spend:', err);
      toast.error('Failed to create spend');
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/analytics/spends?format=csv`);
      if (!response.ok) {
        throw new Error('Failed to export spends');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'spends-report.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Spends report exported successfully');
    } catch (err) {
      console.error('Error exporting spends:', err);
      toast.error('Failed to export spends report');
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading spends...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">{error}</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Monthly Expenses</h1>
        <button
          onClick={handleExport}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700"
        >
          <Download className="w-4 h-4" />
          Export Spends
        </button>
      </div>

      {/* Add Spend Form */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Add Monthly Expense</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700">Labour Cost</label>
            <input
              type="number"
              name="labour"
              value={formData.labour}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700">Clay Cost</label>
            <input
              type="number"
              name="clay"
              value={formData.clay}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700">Coal Cost</label>
            <input
              type="number"
              name="coal"
              value={formData.coal}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700">Transport Cost</label>
            <input
              type="number"
              name="transport"
              value={formData.transport}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700">Other Expenses</label>
            <input
              type="number"
              name="other"
              value={formData.other}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700">Month</label>
            <select
              name="month"
              value={formData.month}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700">Year</label>
            <select
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - 2 + i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="md:col-span-3">
            <button
              type="submit"
              className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
            >
              Save Monthly Expense
            </button>
          </div>
        </form>
      </div>

      {/* Spends Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Month/Year</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Labour</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Clay</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Coal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Transport</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Other</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {spends.map((spend) => (
              <tr key={spend.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                  {new Date(0, parseInt(spend.month) - 1).toLocaleString('default', { month: 'long' })} {spend.year}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">${spend.labour.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">${spend.clay.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">${spend.coal.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">${spend.transport.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">${spend.other.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">${spend.total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SpendsPage;