import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import toast from 'react-hot-toast';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const deliverySchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State/Province is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  deliveryDate: z.string().min(1, 'Delivery date is required'),
  timeSlot: z.string().min(1, 'Time slot is required'),
  contactName: z.string().min(1, 'Contact name is required'),
  contactPhone: z.string().min(10, 'Contact phone must be at least 10 digits'),
  specialInstructions: z.string().optional(),
});

const timeSlots = [
  '09:00 - 12:00',
  '12:00 - 15:00',
  '15:00 - 18:00',
];

const OrderDeliveryPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    postalCode: user?.address?.postalCode || '',
    country: user?.address?.country || '',
    deliveryDate: '',
    timeSlot: '',
    contactName: user?.fullName || '',
    contactPhone: user?.phone || '',
    specialInstructions: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      deliverySchema.parse(formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      clearCart();
      toast.success('Order placed successfully!');
      navigate('/checkout/success');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Get tomorrow's date as the minimum delivery date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <Layout>
      <div className="py-12 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-neutral-800 mb-8">Delivery Details</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Delivery Address */}
                    <div>
                      <h2 className="text-xl font-semibold text-neutral-800 mb-4">Delivery Address</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-neutral-700 mb-1">
                            Street Address *
                          </label>
                          <input
                            type="text"
                            name="street"
                            value={formData.street}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md ${
                              errors.street ? 'border-error-500' : 'border-neutral-300'
                            }`}
                            required
                          />
                          {errors.street && (
                            <p className="mt-1 text-sm text-error-500">{errors.street}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">
                            City *
                          </label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md ${
                              errors.city ? 'border-error-500' : 'border-neutral-300'
                            }`}
                            required
                          />
                          {errors.city && (
                            <p className="mt-1 text-sm text-error-500">{errors.city}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">
                            State/Province *
                          </label>
                          <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md ${
                              errors.state ? 'border-error-500' : 'border-neutral-300'
                            }`}
                            required
                          />
                          {errors.state && (
                            <p className="mt-1 text-sm text-error-500">{errors.state}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">
                            Postal Code *
                          </label>
                          <input
                            type="text"
                            name="postalCode"
                            value={formData.postalCode}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md ${
                              errors.postalCode ? 'border-error-500' : 'border-neutral-300'
                            }`}
                            required
                          />
                          {errors.postalCode && (
                            <p className="mt-1 text-sm text-error-500">{errors.postalCode}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">
                            Country *
                          </label>
                          <input
                            type="text"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md ${
                              errors.country ? 'border-error-500' : 'border-neutral-300'
                            }`}
                            required
                          />
                          {errors.country && (
                            <p className="mt-1 text-sm text-error-500">{errors.country}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Delivery Schedule */}
                    <div>
                      <h2 className="text-xl font-semibold text-neutral-800 mb-4">Delivery Schedule</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">
                            Delivery Date *
                          </label>
                          <input
                            type="date"
                            name="deliveryDate"
                            value={formData.deliveryDate}
                            onChange={handleChange}
                            min={minDate}
                            className={`w-full px-3 py-2 border rounded-md ${
                              errors.deliveryDate ? 'border-error-500' : 'border-neutral-300'
                            }`}
                            required
                          />
                          {errors.deliveryDate && (
                            <p className="mt-1 text-sm text-error-500">{errors.deliveryDate}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">
                            Time Slot *
                          </label>
                          <select
                            name="timeSlot"
                            value={formData.timeSlot}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md ${
                              errors.timeSlot ? 'border-error-500' : 'border-neutral-300'
                            }`}
                            required
                          >
                            <option value="">Select a time slot</option>
                            {timeSlots.map(slot => (
                              <option key={slot} value={slot}>{slot}</option>
                            ))}
                          </select>
                          {errors.timeSlot && (
                            <p className="mt-1 text-sm text-error-500">{errors.timeSlot}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div>
                      <h2 className="text-xl font-semibold text-neutral-800 mb-4">Contact Information</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">
                            Contact Person Name *
                          </label>
                          <input
                            type="text"
                            name="contactName"
                            value={formData.contactName}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md ${
                              errors.contactName ? 'border-error-500' : 'border-neutral-300'
                            }`}
                            required
                          />
                          {errors.contactName && (
                            <p className="mt-1 text-sm text-error-500">{errors.contactName}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">
                            Contact Phone Number *
                          </label>
                          <input
                            type="tel"
                            name="contactPhone"
                            value={formData.contactPhone}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md ${
                              errors.contactPhone ? 'border-error-500' : 'border-neutral-300'
                            }`}
                            required
                          />
                          {errors.contactPhone && (
                            <p className="mt-1 text-sm text-error-500">{errors.contactPhone}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Special Instructions */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Special Instructions
                      </label>
                      <textarea
                        name="specialInstructions"
                        value={formData.specialInstructions}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                        placeholder="Add any special delivery instructions here..."
                      />
                    </div>
                  </form>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                  <h2 className="text-xl font-semibold text-neutral-800 mb-4">Order Summary</h2>
                  
                  <div className="space-y-4 mb-6">
                    {items.map((item) => (
                      <div key={item.brick.id} className="flex justify-between">
                        <div>
                          <p className="font-medium text-neutral-800">{item.brick.name}</p>
                          <p className="text-sm text-neutral-500">{item.quantity} pcs</p>
                        </div>
                        <p className="text-neutral-800">${(item.brick.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-neutral-200 pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Subtotal</span>
                      <span className="text-neutral-800">${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Delivery Fee</span>
                      <span className="text-neutral-800">Free</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Tax</span>
                      <span className="text-neutral-800">${(totalPrice * 0.07).toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-neutral-200 mt-4 pt-4">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-lg font-bold text-neutral-800">Total</span>
                      <span className="text-xl font-bold text-neutral-800">
                        ${(totalPrice + totalPrice * 0.07).toFixed(2)}
                      </span>
                    </div>
                    
                    <Button
                      onClick={handleSubmit}
                      isLoading={isLoading}
                      fullWidth
                      className="bg-[#e74c3c] hover:bg-[#c0392b] text-white py-3 text-lg"
                    >
                      Confirm Order
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderDeliveryPage;