import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const useLocalApi = import.meta.env.VITE_USE_LOCAL_API === 'true';
const apiUrl = import.meta.env.VITE_API_URL;

interface Brick {
  id: string;
  name: string;
  stock: number;
  price: number;
  minStockThreshold: number;
}

interface BrickFormData {
  name: string;
  stock: number;
  price: number;
  minStockThreshold: number;
}

const InventoryPage: React.FC = () => {
  const [bricks, setBricks] = useState<Brick[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrick, setEditingBrick] = useState<Brick | null>(null);
  const [formData, setFormData] = useState<BrickFormData>({
    name: '',
    stock: 0,
    price: 0,
    minStockThreshold: 0
  });

  const fetchBricks = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/bricks`);
      if (!response.ok) {
        throw new Error('Failed to fetch bricks');
      }
      const data = await response.json();
      setBricks(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching bricks:', err);
      setError('Failed to fetch bricks');
      toast.error('Failed to fetch bricks');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBricks();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'name' ? value : parseFloat(value) || 0
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return false;
    }
    if (formData.stock < 0) {
      toast.error('Stock cannot be negative');
      return false;
    }
    if (formData.price <= 0) {
      toast.error('Price must be greater than 0');
      return false;
    }
    if (formData.minStockThreshold < 0) {
      toast.error('Minimum stock threshold cannot be negative');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const url = editingBrick 
        ? `${apiUrl}/api/bricks/${editingBrick.id}`
        : `${apiUrl}/api/bricks`;
      
      const method = editingBrick ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${editingBrick ? 'update' : 'create'} brick`);
      }

      const updatedBricks = await response.json();
      setBricks(updatedBricks);
      setIsModalOpen(false);
      toast.success(`Brick ${editingBrick ? 'updated' : 'created'} successfully`);
    } catch (err) {
      console.error('Error saving brick:', err);
      toast.error(`Failed to ${editingBrick ? 'update' : 'create'} brick`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this brick?')) {
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/bricks/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete brick');
      }

      const updatedBricks = await response.json();
      setBricks(updatedBricks);
      toast.success('Brick deleted successfully');
    } catch (err) {
      console.error('Error deleting brick:', err);
      toast.error('Failed to delete brick');
    }
  };

  const openModal = (brick?: Brick) => {
    if (brick) {
      setEditingBrick(brick);
      setFormData({
        name: brick.name,
        stock: brick.stock,
        price: brick.price,
        minStockThreshold: brick.minStockThreshold
      });
    } else {
      setEditingBrick(null);
      setFormData({
        name: '',
        stock: 0,
        price: 0,
        minStockThreshold: 0
      });
    }
    setIsModalOpen(true);
  };

  if (isLoading) {
    return <div className="p-8">Loading inventory...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">{error}</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <button
          onClick={() => openModal()}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700"
        >
          <Plus className="w-4 h-4" />
          Add New Brick
        </button>
      </div>

      {/* Bricks Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Min Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {bricks.map((brick) => (
              <tr key={brick.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">{brick.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{brick.stock}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">${brick.price.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{brick.minStockThreshold}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal(brick)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(brick.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingBrick ? 'Edit Brick' : 'Add New Brick'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700">Stock</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700">Price ($)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700">Min Stock Threshold</label>
                <input
                  type="number"
                  name="minStockThreshold"
                  value={formData.minStockThreshold}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                  min="0"
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                >
                  {editingBrick ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;