import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, MapPin } from 'lucide-react';
import Button from '../ui/Button';
import { useCart } from '../../context/CartContext';

const CheckoutForm: React.FC = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  
  const [shippingAddress, setShippingAddress] = useState({
    firstName: '',
    lastName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
  });
  
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
  });
  
  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call for order creation
    setTimeout(() => {
      clearCart();
      navigate('/checkout/success');
      setLoading(false);
    }, 1500);
  };
  
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-neutral-800 mb-4">Your cart is empty</h2>
        <p className="text-neutral-600 mb-6">Add items to your cart before proceeding to checkout.</p>
        <Button onClick={() => navigate('/catalog')}>Browse Catalog</Button>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Shipping and Billing Sections */}
        <div className="md:col-span-2 space-y-8">
          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <MapPin size={20} className="text-primary-600 mr-2" />
              <h2 className="text-xl font-semibold text-neutral-800">Shipping Address</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={shippingAddress.firstName}
                  onChange={handleShippingChange}
                  required
                  className="w-full p-2 border border-neutral-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={shippingAddress.lastName}
                  onChange={handleShippingChange}
                  required
                  className="w-full p-2 border border-neutral-300 rounded-md"
                />
              </div>
              
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  name="street"
                  value={shippingAddress.street}
                  onChange={handleShippingChange}
                  required
                  className="w-full p-2 border border-neutral-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={shippingAddress.city}
                  onChange={handleShippingChange}
                  required
                  className="w-full p-2 border border-neutral-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={shippingAddress.state}
                  onChange={handleShippingChange}
                  required
                  className="w-full p-2 border border-neutral-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  ZIP Code
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={shippingAddress.zipCode}
                  onChange={handleShippingChange}
                  required
                  className="w-full p-2 border border-neutral-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Country
                </label>
                <select
                  name="country"
                  value={shippingAddress.country}
                  onChange={handleShippingChange}
                  required
                  className="w-full p-2 border border-neutral-300 rounded-md"
                >
                  <option value="USA">United States</option>
                  <option value="CAN">Canada</option>
                  <option value="MEX">Mexico</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Shipping Method */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <Truck size={20} className="text-primary-600 mr-2" />
              <h2 className="text-xl font-semibold text-neutral-800">Shipping Method</h2>
            </div>
            
            <div className="space-y-3">
              <label className="flex items-center p-3 border border-neutral-300 rounded-md cursor-pointer bg-primary-50 border-primary-300">
                <input
                  type="radio"
                  name="shipping"
                  value="standard"
                  defaultChecked
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                />
                <div className="ml-3">
                  <span className="block text-sm font-medium text-neutral-800">Standard Shipping (3-5 business days)</span>
                  <span className="block text-sm text-neutral-500">Free</span>
                </div>
              </label>
              
              <label className="flex items-center p-3 border border-neutral-300 rounded-md cursor-pointer hover:bg-neutral-50">
                <input
                  type="radio"
                  name="shipping"
                  value="express"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                />
                <div className="ml-3">
                  <span className="block text-sm font-medium text-neutral-800">Express Shipping (1-2 business days)</span>
                  <span className="block text-sm text-neutral-500">$25.00</span>
                </div>
              </label>
            </div>
          </div>
          
          {/* Payment Method */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <CreditCard size={20} className="text-primary-600 mr-2" />
              <h2 className="text-xl font-semibold text-neutral-800">Payment Method</h2>
            </div>
            
            <div className="space-y-3 mb-4">
              <label className="flex items-center p-3 border border-neutral-300 rounded-md cursor-pointer bg-primary-50 border-primary-300">
                <input
                  type="radio"
                  name="payment"
                  value="credit-card"
                  checked={paymentMethod === 'credit-card'}
                  onChange={() => setPaymentMethod('credit-card')}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                />
                <div className="ml-3">
                  <span className="block text-sm font-medium text-neutral-800">Credit Card</span>
                </div>
              </label>
              
              <label className="flex items-center p-3 border border-neutral-300 rounded-md cursor-pointer hover:bg-neutral-50">
                <input
                  type="radio"
                  name="payment"
                  value="paypal"
                  checked={paymentMethod === 'paypal'}
                  onChange={() => setPaymentMethod('paypal')}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                />
                <div className="ml-3">
                  <span className="block text-sm font-medium text-neutral-800">PayPal</span>
                </div>
              </label>
            </div>
            
            {paymentMethod === 'credit-card' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={cardDetails.cardNumber}
                    onChange={handleCardChange}
                    placeholder="1234 5678 9012 3456"
                    required
                    maxLength={19}
                    className="w-full p-2 border border-neutral-300 rounded-md"
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Name on Card
                  </label>
                  <input
                    type="text"
                    name="cardName"
                    value={cardDetails.cardName}
                    onChange={handleCardChange}
                    required
                    className="w-full p-2 border border-neutral-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    name="expiry"
                    value={cardDetails.expiry}
                    onChange={handleCardChange}
                    placeholder="MM/YY"
                    required
                    maxLength={5}
                    className="w-full p-2 border border-neutral-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    name="cvv"
                    value={cardDetails.cvv}
                    onChange={handleCardChange}
                    placeholder="123"
                    required
                    maxLength={4}
                    className="w-full p-2 border border-neutral-300 rounded-md"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-semibold text-neutral-800 mb-4">Order Summary</h2>
            
            <div className="max-h-60 overflow-y-auto mb-4">
              {items.map((item) => (
                <div key={item.brick.id} className="flex justify-between py-2 border-b border-neutral-100">
                  <div>
                    <p className="text-sm font-medium text-neutral-800">{item.brick.name}</p>
                    <p className="text-xs text-neutral-500">{item.quantity} pcs</p>
                  </div>
                  <p className="text-sm text-neutral-800">${(item.brick.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            
            <div className="space-y-2 border-b border-neutral-200 pb-4 mb-4">
              <div className="flex justify-between">
                <span className="text-neutral-600">Subtotal</span>
                <span className="text-neutral-800">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Shipping</span>
                <span className="text-neutral-800">Free</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Tax</span>
                <span className="text-neutral-800">${(totalPrice * 0.07).toFixed(2)}</span>
              </div>
            </div>
            
            <div className="flex justify-between font-bold text-lg mb-6">
              <span>Total</span>
              <span>${(totalPrice + totalPrice * 0.07).toFixed(2)}</span>
            </div>
            
            <Button type="submit" isLoading={loading} fullWidth>
              {loading ? 'Processing...' : 'Place Order'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CheckoutForm;