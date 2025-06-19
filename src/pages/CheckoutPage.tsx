import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const useLocalApi = import.meta.env.VITE_USE_LOCAL_API === 'true';
const apiUrl = import.meta.env.VITE_API_URL;

interface CustomerInfo {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

const CheckoutPage: React.FC = () => {
  const { cart, checkout, isLoading: cartLoading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (cart.items.length === 0) {
      navigate('/cart');
      return;
    }

    fetchCustomerInfo();
  }, [user, cart.items.length]);

  const fetchCustomerInfo = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/customers/${user?.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch customer information');
      }
      const data = await response.json();
      setCustomerInfo(data);
    } catch (error) {
      console.error('Error fetching customer info:', error);
      toast.error('Failed to fetch customer information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerInfo?.address) {
      toast.error('Please provide a delivery address');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await checkout();
      navigate(`/checkout/success?orderId=${result.orderId}`);
    } catch (error) {
      console.error('Error during checkout:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process checkout');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !customerInfo) return;

    try {
      const response = await fetch(`${apiUrl}/api/customers/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(customerInfo)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update information');
      }

      toast.success('Information updated successfully');
    } catch (error) {
      console.error('Error updating customer info:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update information');
    }
  };

  const calculateTotal = () => {
    return cart.items.reduce((total, item) => {
      return total + (item.price || 0) * item.quantity;
    }, 0);
  };

  if (isLoading || cartLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Loading checkout...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customer Information */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Delivery Information</h2>
              <form onSubmit={handleUpdateInfo} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={customerInfo?.name || ''}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev!, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={customerInfo?.email || ''}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev!, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={customerInfo?.phone || ''}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev!, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Delivery Address
                  </label>
                  <textarea
                    value={customerInfo?.address || ''}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev!, address: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-neutral-600 text-white px-6 py-2 rounded-lg hover:bg-neutral-700"
                >
                  Update Information
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="divide-y divide-neutral-200">
                {cart.items.map((item) => (
                  <div key={item.brickId} className="py-4 flex justify-between">
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-neutral-600">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        ${((item.price || 0) * item.quantity).toLocaleString()}
                      </p>
                      <p className="text-sm text-neutral-600">
                        ${(item.price || 0).toLocaleString()} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-neutral-200 mt-6 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-medium">Total</span>
                  <span className="text-2xl font-bold">
                    ${calculateTotal().toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isProcessing || !customerInfo?.address}
                  className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:bg-neutral-300 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : 'Place Order'}
                </button>

                <p className="text-sm text-neutral-600 text-center mt-4">
                  By placing this order, you agree to our terms and conditions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;