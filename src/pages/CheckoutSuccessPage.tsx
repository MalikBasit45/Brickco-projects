import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const useLocalApi = import.meta.env.VITE_USE_LOCAL_API === 'true';
const apiUrl = import.meta.env.VITE_API_URL;

interface OrderDetails {
  id: string;
  customerId: string;
  items: Array<{
    brickId: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  total: number;
  status: string;
  createdAt: string;
}

const CheckoutSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !orderId) {
      navigate('/');
      return;
    }

    fetchOrderDetails();
  }, [user, orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/orders/customer/${user?.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }
      const orders = await response.json();
      const currentOrder = orders.find((o: OrderDetails) => o.id === orderId);
      
      if (!currentOrder) {
        throw new Error('Order not found');
      }
      
      setOrder(currentOrder);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to fetch order details');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Loading order details...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-neutral-600">
            Thank you for your order. We'll start processing it right away.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Order #{orderId}</h2>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
              {order?.status}
            </span>
          </div>

          <div className="border-t border-neutral-200 pt-4">
            <div className="flex items-start gap-4 text-sm text-neutral-600">
              <Package className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-neutral-900 mb-1">
                  Estimated delivery time
                </p>
                <p>Your order will be delivered within 3-5 business days.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="divide-y divide-neutral-200">
              {order?.items.map((item) => (
                <div key={item.brickId} className="py-4 flex justify-between">
                  <div>
                    <p className="font-medium">Brick #{item.brickId}</p>
                    <p className="text-sm text-neutral-600">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${item.total.toLocaleString()}</p>
                    <p className="text-sm text-neutral-600">
                      ${item.price.toLocaleString()} each
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-neutral-200 mt-4 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Total</span>
                <span className="text-2xl font-bold">
                  ${order?.total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={() => navigate('/catalog')}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 flex items-center gap-2"
          >
            Continue Shopping
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/account/orders')}
            className="bg-neutral-600 text-white px-6 py-3 rounded-lg hover:bg-neutral-700"
          >
            View All Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;