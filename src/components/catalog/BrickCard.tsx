import React, { useState } from 'react';
import { ShoppingCart, Info } from 'lucide-react';
import { Brick } from '../../types';
import Card, { CardImage, CardContent, CardTitle, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import { useCart } from '../../context/CartContext';

interface BrickCardProps {
  brick: Brick;
  onViewDetails: (brick: Brick) => void;
}

const BrickCard: React.FC<BrickCardProps> = ({ brick, onViewDetails }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(100); // Default quantity
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);
    
    // Simulate API call to check stock
    setTimeout(() => {
      addToCart(brick, quantity);
      setIsAdding(false);
    }, 500);
  };

  return (
    <Card hoverEffect className="h-full flex flex-col">
      <CardImage src={brick.image} alt={brick.name} />
      <CardContent className="flex-grow">
        <CardTitle>{brick.name}</CardTitle>
        <p className="text-neutral-600 mb-2">{brick.type} • {brick.size}</p>
        <p className="text-sm text-neutral-500 mb-4 line-clamp-2">{brick.description}</p>
        
        <div className="flex justify-between items-center mb-4">
          <span className="text-xl font-bold text-neutral-800">${brick.price.toFixed(2)}</span>
          <span className={`text-sm font-medium px-2 py-1 rounded-full ${
            brick.stock > 1000 
              ? 'bg-green-100 text-green-800' 
              : brick.stock > 0 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-red-100 text-red-800'
          }`}>
            {brick.stock > 1000 
              ? 'In Stock' 
              : brick.stock > 0 
                ? 'Limited Stock' 
                : 'Out of Stock'}
          </span>
        </div>
      </CardContent>
      
      <CardFooter className="border-t border-neutral-200 pt-4">
        <div className="w-full">
          <div className="flex justify-between items-center mb-3">
            <label htmlFor={`quantity-${brick.id}`} className="text-sm text-neutral-600">
              Quantity (pcs):
            </label>
            <input
              id={`quantity-${brick.id}`}
              type="number"
              min="100"
              step="100"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 100)}
              className="w-24 px-2 py-1 border border-neutral-300 rounded-md text-right"
            />
          </div>
          
          <div className="flex space-x-2">
            <Button
              onClick={() => onViewDetails(brick)}
              variant="outline"
              className="flex-1"
              icon={<Info size={18} />}
            >
              Details
            </Button>
            <Button
              onClick={handleAddToCart}
              className="flex-1"
              isLoading={isAdding}
              disabled={brick.stock <= 0}
              icon={<ShoppingCart size={18} />}
            >
              Add
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default BrickCard;