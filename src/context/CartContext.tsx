import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const useLocalApi = import.meta.env.VITE_USE_LOCAL_API === 'true';
const apiUrl = import.meta.env.VITE_API_URL;

interface CartItem {
  brickId: string;
  quantity: number;
  name?: string;
  price?: number;
  currentStock?: number;
}

interface Cart {
  items: CartItem[];
  updatedAt: string;
}

interface CartContextType {
  cart: Cart;
  addToCart: (brickId: string, quantity: number) => Promise<void>;
  removeFromCart: (brickId: string) => Promise<void>;
  updateQuantity: (brickId: string, quantity: number) => Promise<void>;
  checkout: () => Promise<{ orderId: string; total: number }>;
  clearCart: () => void;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart>({ items: [], updatedAt: new Date().toISOString() });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch cart on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart({ items: [], updatedAt: new Date().toISOString() });
    }
  }, [user]);

  const fetchCart = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/cart/${user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }
      const data = await response.json();
      setCart(data);
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to fetch cart');
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (brickId: string, quantity: number) => {
    if (!user) {
      toast.error('Please log in to add items to cart');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/cart/${user.id}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ brickId, quantity })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add item to cart');
      }

      const data = await response.json();
      setCart(data);
      toast.success('Item added to cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add item to cart');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (brickId: string) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/cart/${user.id}/remove/${brickId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to remove item from cart');
      }

      const data = await response.json();
      setCart(data);
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item from cart');
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (brickId: string, quantity: number) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/cart/${user.id}/update/${brickId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update quantity');
      }

      const data = await response.json();
      setCart(data);
      toast.success('Cart updated');
    } catch (error) {
      console.error('Error updating cart:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update cart');
    } finally {
      setIsLoading(false);
    }
  };

  const checkout = async () => {
    if (!user) {
      throw new Error('Please log in to checkout');
    }

    if (cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/cart/${user.id}/checkout`, {
        method: 'POST'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to checkout');
      }

      const data = await response.json();
      setCart({ items: [], updatedAt: new Date().toISOString() });
      toast.success('Order placed successfully');
      return data;
    } catch (error) {
      console.error('Error during checkout:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = () => {
    setCart({ items: [], updatedAt: new Date().toISOString() });
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        checkout,
        clearCart,
        isLoading
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};