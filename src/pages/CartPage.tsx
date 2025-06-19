import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Trash2, Plus, Minus } from 'lucide-react';
import toast from 'react-hot-toast';

const CartPage: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, isLoading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleQuantityChange = async (brickId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(brickId);
    } else {
      await updateQuantity(brickId, quantity);
    }
  };

  const handleCheckout = () => {
    if (!user) {
      toast.error('Please log in to checkout');
      navigate('/login');
      return;
    }

    if (cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    navigate('/checkout');
  };

  const calculateTotal = () => {
    return cart.items.reduce((total, item) => {
      return total + (item.price || 0) * item.quantity;
    }, 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Loading cart...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        {cart.items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-neutral-400" />
            <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-neutral-600 mb-6">
              Add some bricks to your cart and they will appear here.
            </p>
            <button
              onClick={() => navigate('/catalog')}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
            >
              Browse Catalog
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Cart Items */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <ul className="divide-y divide-neutral-200">
                {cart.items.map((item) => (
                  <li key={item.brickId} className="p-6">
                    <div className="flex items-center">
                      <div className="flex-grow">
                        <h3 className="text-lg font-semibold">{item.name}</h3>
                        <p className="text-neutral-600">
                          ${(item.price || 0).toLocaleString()} each
                        </p>
                        {item.currentStock !== undefined && (
                          <p className="text-sm text-neutral-500">
                            {item.currentStock} available
                          </p>
                        )}
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityChange(item.brickId, item.quantity - 1)}
                            className="p-1 rounded-full hover:bg-neutral-100"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-12 text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.brickId, item.quantity + 1)}
                            className="p-1 rounded-full hover:bg-neutral-100"
                            disabled={item.quantity >= (item.currentStock || 0)}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="text-right">
                          <div className="font-semibold">
                            ${((item.price || 0) * item.quantity).toLocaleString()}
                          </div>
                          <button
                            onClick={() => removeFromCart(item.brickId)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cart Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-medium">Subtotal</span>
                <span className="text-2xl font-bold">
                  ${calculateTotal().toLocaleString()}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;