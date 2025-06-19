import React from 'react';
import { Package, Truck, CheckCircle } from 'lucide-react';

interface TrackingStep {
  title: string;
  description: string;
  date: string;
  icon: React.ReactNode;
  isCompleted: boolean;
  isActive: boolean;
}

const TrackOrderPage: React.FC = () => {
  const trackingSteps: TrackingStep[] = [
    {
      title: 'Order Confirmed',
      description: 'Your order has been confirmed and is being processed',
      date: 'May 15, 2025 10:30 AM',
      icon: <Package size={24} />,
      isCompleted: true,
      isActive: false,
    },
    {
      title: 'Order Shipped',
      description: 'Your order has been shipped via Standard Shipping',
      date: 'May 16, 2025 2:15 PM',
      icon: <Truck size={24} />,
      isCompleted: true,
      isActive: true,
    },
    {
      title: 'Out for Delivery',
      description: 'Your order is out for delivery',
      date: 'Expected May 18, 2025',
      icon: <Truck size={24} />,
      isCompleted: false,
      isActive: false,
    },
    {
      title: 'Delivered',
      description: 'Your order has been delivered',
      date: 'Expected May 18, 2025',
      icon: <CheckCircle size={24} />,
      isCompleted: false,
      isActive: false,
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-neutral-800 mb-2">Track Order #1</h2>
        <div className="flex flex-wrap gap-4 text-sm text-neutral-600">
          <span>Tracking Number: BRK123456789</span>
          <span>•</span>
          <span>Carrier: Standard Shipping</span>
        </div>
      </div>

      <div className="space-y-8">
        {trackingSteps.map((step, index) => (
          <div key={index} className="relative">
            {index < trackingSteps.length - 1 && (
              <div 
                className={`absolute left-6 top-12 w-0.5 h-20 ${
                  step.isCompleted ? 'bg-primary-500' : 'bg-neutral-200'
                }`}
              />
            )}
            
            <div className="flex items-start">
              <div 
                className={`relative flex items-center justify-center w-12 h-12 rounded-full ${
                  step.isCompleted
                    ? 'bg-primary-500 text-white'
                    : step.isActive
                    ? 'bg-primary-100 text-primary-600'
                    : 'bg-neutral-100 text-neutral-400'
                }`}
              >
                {step.icon}
              </div>
              
              <div className="ml-4 flex-grow">
                <h3 className={`text-lg font-medium ${
                  step.isActive ? 'text-primary-600' : 'text-neutral-800'
                }`}>
                  {step.title}
                </h3>
                <p className="text-neutral-600 mb-1">{step.description}</p>
                <p className="text-sm text-neutral-500">{step.date}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrackOrderPage;