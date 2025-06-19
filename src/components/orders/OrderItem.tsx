import React from 'react';
import { Order } from '../../types';
import { Clock, Truck, Package, CheckCircle } from 'lucide-react';
import Button from '../ui/Button';

interface OrderItemProps {
  order: Order;
}

const OrderItem: React.FC<OrderItemProps> = ({ order }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const getStatusIcon = () => {
    switch (order.status) {
      case 'pending':
        return <Clock size={20} className="text-yellow-500" />;
      case 'processing':
        return <Package size={20} className="text-blue-500" />;
      case 'shipped':
        return <Truck size={20} className="text-purple-500" />;
      case 'delivered':
        return <CheckCircle size={20} className="text-green-500" />;
      default:
        return <Clock size={20} className="text-yellow-500" />;
    }
  };

  const getStatusText = () => {
    switch (order.status) {
      case 'pending':
        return 'Pending';
      case 'processing':
        return 'Processing';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = () => {
    switch (order.status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
      <div className="p-4 border-b border-neutral-200">
        <div className="flex flex-col sm:flex-row justify-between">
          <div>
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-semibold text-neutral-800">
                Order #{order.id}
              </h3>
              <span className={`ml-3 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
                {getStatusText()}
              </span>
            </div>
            <p className="text-neutral-500 text-sm">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="mt-3 sm:mt-0">
            <span className="text-lg font-bold text-neutral-800">
              ${order.totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-4">
          <h4 className="text-sm font-medium text-neutral-600 mb-2">Items</h4>
          <ul className="space-y-2">
            {order.items.map((item) => (
              <li key={item.brickId} className="flex justify-between text-sm">
                <span className="text-neutral-800">
                  {item.quantity} x {item.brickName}
                </span>
                <span className="text-neutral-600">${item.price.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-medium text-neutral-600 mb-2">Shipping Address</h4>
          <p className="text-sm text-neutral-700">
            {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}, {order.shippingAddress.country}
          </p>
        </div>

        {order.trackingNumber && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-neutral-600 mb-2">Tracking Number</h4>
            <p className="text-sm text-neutral-700">{order.trackingNumber}</p>
          </div>
        )}
      </div>

      <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex flex-wrap gap-2">
        <Button variant="outline" size="sm">
          View Details
        </Button>
        {order.status === 'shipped' && (
          <Button variant="outline" size="sm">
            Track Shipment
          </Button>
        )}
        {order.status === 'delivered' && (
          <Button variant="outline" size="sm">
            Leave Review
          </Button>
        )}
      </div>
    </div>
  );
};

export default OrderItem;