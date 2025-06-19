import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { ShoppingCart, Plus, Minus } from 'lucide-react';

const useLocalApi = import.meta.env.VITE_USE_LOCAL_API === 'true';
const apiUrl = import.meta.env.VITE_API_URL;

interface Brick {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
}

const CatalogPage: React.FC = () => {
  const [bricks, setBricks] = useState<Brick[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    fetchBricks();
  }, []);

  const fetchBricks = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/bricks`);
      if (!response.ok) {
        throw new Error('Failed to fetch bricks');
      }
      const data = await response.json();
      setBricks(data);
    } catch (error) {
      console.error('Error fetching bricks:', error);
      toast.error('Failed to fetch bricks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityChange = (brickId: string, delta: number) => {
    setQuantities(prev => {
      const current = prev[brickId] || 0;
      const newQuantity = Math.max(0, current + delta);
      return {
        ...prev,
        [brickId]: newQuantity
      };
    });
  };

  const handleAddToCart = async (brick: Brick) => {
    const quantity = quantities[brick.id] || 0;
    if (quantity === 0) {
      toast.error('Please select a quantity');
      return;
    }

    if (quantity > brick.stock) {
      toast.error('Not enough stock available');
      return;
    }

    try {
      await addToCart(brick.id, quantity);
      setQuantities(prev => ({
        ...prev,
        [brick.id]: 0
      }));
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Loading catalog...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Brick Catalog</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bricks.map(brick => (
            <div
              key={brick.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              {brick.image && (
                <img
                  src={brick.image}
                  alt={brick.name}
                  className="w-full h-48 object-cover"
                />
              )}
              
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">{brick.name}</h2>
                <p className="text-neutral-600 mb-4">{brick.description}</p>
                
                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-bold text-primary-600">
                    ${brick.price.toLocaleString()}
                  </span>
                  <span className={`text-sm font-medium ${
                    brick.stock > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {brick.stock > 0 ? `${brick.stock} in stock` : 'Out of stock'}
                  </span>
                </div>
                
                {brick.stock > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center space-x-4">
                      <button
                        onClick={() => handleQuantityChange(brick.id, -1)}
                        className="p-2 rounded-full bg-neutral-100 hover:bg-neutral-200"
                        disabled={!quantities[brick.id]}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      
                      <span className="text-lg font-medium w-12 text-center">
                        {quantities[brick.id] || 0}
                      </span>
                      
                      <button
                        onClick={() => handleQuantityChange(brick.id, 1)}
                        className="p-2 rounded-full bg-neutral-100 hover:bg-neutral-200"
                        disabled={quantities[brick.id] >= brick.stock}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <button
                      onClick={() => handleAddToCart(brick)}
                      disabled={!quantities[brick.id]}
                      className="w-full flex items-center justify-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:bg-neutral-300 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CatalogPage;