import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const useLocalApi = import.meta.env.VITE_USE_LOCAL_API === 'true';
const apiUrl = import.meta.env.VITE_API_URL;

interface Customer {
  id: string;
  name: string;
  email: string;
}

interface Brick {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface Order {
  id: string;
  customerId: string;
  customerName: string;
  brickId: string;
  brickName: string;
  quantity: number;
  amount: number;
  status: 'pending' | 'processing' | 'done' | 'cancelled';
  createdAt: string;
}

interface OrderFormData {
  customerId: string;
  brickId: string;
  quantity: number;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  done: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [bricks, setBricks] = useState<Brick[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [formData, setFormData] = useState<OrderFormData>({
    customerId: '',
    brickId: '',
    quantity: 1
  });
  const [restoreStock, setRestoreStock] = useState(true);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/orders`);
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      setOrders(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch orders');
      toast.error('Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/orders/customers`);
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      const data = await response.json();
      setCustomers(data);
    } catch (err) {
      console.error('Error fetching customers:', err);
      toast.error('Failed to fetch customers');
    }
  };

  const fetchBricks = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/orders/bricks`);
      if (!response.ok) {
        throw new Error('Failed to fetch bricks');
      }
      const data = await response.json();
      setBricks(data);
    } catch (err) {
      console.error('Error fetching bricks:', err);
      toast.error('Failed to fetch bricks');
    }
  };

  useEffect(() => {
    Promise.all([fetchOrders(), fetchCustomers(), fetchBricks()]);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['customerId', 'brickId'].includes(name) ? value : parseInt(value) || 0
    }));
  };

  const calculateTotalAmount = () => {
    const selectedBrick = bricks.find(b => b.id === formData.brickId);
    if (!selectedBrick) return 0;
    return selectedBrick.price * formData.quantity;
  };

  const validateForm = () => {
    if (!formData.customerId) {
      toast.error('Please select a customer');
      return false;
    }
    if (!formData.brickId) {
      toast.error('Please select a brick');
      return false;
    }
    if (formData.quantity <= 0) {
      toast.error('Quantity must be greater than 0');
      return false;
    }
    const selectedBrick = bricks.find(b => b.id === formData.brickId);
    if (!selectedBrick) {
      toast.error('Invalid brick selected');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await fetch(`${apiUrl}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create order');
      }

      const updatedOrders = await response.json();
      setOrders(updatedOrders);
      setIsModalOpen(false);
      toast.success('Order created successfully');
    } catch (err) {
      console.error('Error creating order:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to create order');
    }
  };

  const handleMarkAsDone = async (orderId: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'done' }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update order');
      }

      const updatedOrders = await response.json();
      setOrders(updatedOrders);
      
      // Refresh bricks data since stock has changed
      await fetchBricks();
      
      toast.success('Order marked as done');
    } catch (err) {
      console.error('Error updating order:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to update order');
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;

    try {
      const response = await fetch(`${apiUrl}/api/orders/${selectedOrder.id}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ restoreStock }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cancel order');
      }

      const updatedOrders = await response.json();
      setOrders(updatedOrders);
      setIsCancelModalOpen(false);
      setSelectedOrder(null);
      setRestoreStock(true);

      // Refresh bricks data if stock was restored
      if (restoreStock) {
        await fetchBricks();
      }

      toast.success('Order cancelled successfully');
    } catch (err) {
      console.error('Error cancelling order:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to cancel order');
    }
  };

  const handleDeleteOrder = async () => {
    if (!selectedOrder) return;

    try {
      const response = await fetch(`${apiUrl}/api/orders/${selectedOrder.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ restoreStock }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete order');
      }

      const updatedOrders = await response.json();
      setOrders(updatedOrders);
      setIsDeleteModalOpen(false);
      setSelectedOrder(null);
      setRestoreStock(true);

      // Refresh bricks data if stock was restored
      if (restoreStock) {
        await fetchBricks();
      }

      toast.success('Order deleted successfully');
    } catch (err) {
      console.error('Error deleting order:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to delete order');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return <div className="p-8">Loading orders...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">{error}</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700"
        >
          <Plus className="w-4 h-4" />
          New Order
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-8 text-neutral-500">No orders found</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Brick</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">#{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{order.customerName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">{order.brickName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">{order.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">${order.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    <div className="flex gap-2">
                      {order.status !== 'done' && order.status !== 'cancelled' && (
                        <button
                          onClick={() => handleMarkAsDone(order.id)}
                          className="text-green-600 hover:text-green-800"
                          title="Mark as Done"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {order.status !== 'cancelled' && (
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsCancelModalOpen(true);
                          }}
                          className="text-yellow-600 hover:text-yellow-800"
                          title="Cancel Order"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsDeleteModalOpen(true);
                        }}
                        className="text-red-600 hover:text-red-800"
                        title="Delete Order"
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
      )}

      {/* New Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Order</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700">Customer</label>
                <select
                  name="customerId"
                  value={formData.customerId}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                >
                  <option value="">Select a customer</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700">Brick</label>
                <select
                  name="brickId"
                  value={formData.brickId}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                >
                  <option value="">Select a brick</option>
                  {bricks.map(brick => (
                    <option key={brick.id} value={brick.id}>
                      {brick.name} (${brick.price.toFixed(2)} each, {brick.stock} in stock)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700">Total Amount</label>
                <div className="mt-1 text-lg font-semibold text-primary-600">
                  ${calculateTotalAmount().toFixed(2)}
                </div>
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
                  disabled={!formData.customerId || !formData.brickId || formData.quantity <= 0}
                >
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {isCancelModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Cancel Order</h2>
            <p className="mb-4">
              Are you sure you want to cancel order #{selectedOrder.id}?
            </p>
            {selectedOrder.status === 'done' && (
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={restoreStock}
                    onChange={(e) => setRestoreStock(e.target.checked)}
                    className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-neutral-700">
                    Restore brick stock ({selectedOrder.quantity} units)
                  </span>
                </label>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsCancelModalOpen(false);
                  setSelectedOrder(null);
                  setRestoreStock(true);
                }}
                className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50"
              >
                No, Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700"
              >
                Yes, Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Order Modal */}
      {isDeleteModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Delete Order</h2>
            <p className="mb-4">
              Are you sure you want to permanently delete order #{selectedOrder.id}? This action cannot be undone.
            </p>
            {selectedOrder.status === 'done' && (
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={restoreStock}
                    onChange={(e) => setRestoreStock(e.target.checked)}
                    className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-neutral-700">
                    Restore brick stock ({selectedOrder.quantity} units)
                  </span>
                </label>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedOrder(null);
                  setRestoreStock(true);
                }}
                className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50"
              >
                No, Keep Order
              </button>
              <button
                onClick={handleDeleteOrder}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Yes, Delete Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;