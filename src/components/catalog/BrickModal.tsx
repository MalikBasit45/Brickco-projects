import React, { useState } from 'react';
import { X, ShoppingCart, Truck, Shield, Award } from 'lucide-react';
import { Brick } from '../../types';
import Button from '../ui/Button';
import { useCart } from '../../context/CartContext';

interface BrickModalProps {
  brick: Brick;
  onClose: () => void;
  isOpen: boolean;
}

const BrickModal: React.FC<BrickModalProps> = ({ brick, onClose, isOpen }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(100);
  const [isAdding, setIsAdding] = useState(false);

  if (!isOpen) return null;

  const handleAddToCart = () => {
    setIsAdding(true);
    
    // Simulate API call to check stock
    setTimeout(() => {
      addToCart(brick, quantity);
      setIsAdding(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row">
        {/* Image Section */}
        <div className="md:w-1/2 h-64 md:h-auto relative">
          <img
            src={brick.image}
            alt={brick.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-2 right-2 p-1 bg-white rounded-full text-neutral-600 hover:text-neutral-900"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content Section */}
        <div className="md:w-1/2 p-6 md:p-8 overflow-y-auto">
          <h2 className="text-2xl font-bold text-neutral-800 mb-2">{brick.name}</h2>
          <div className="flex items-center space-x-2 mb-4">
            <span className="px-2 py-1 bg-neutral-100 text-neutral-600 rounded-full text-sm">
              {brick.type}
            </span>
            <span className="px-2 py-1 bg-neutral-100 text-neutral-600 rounded-full text-sm">
              {brick.size}
            </span>
            <span className="px-2 py-1 bg-neutral-100 text-neutral-600 rounded-full text-sm">
              {brick.color}
            </span>
          </div>

          <p className="text-neutral-600 mb-6">{brick.description}</p>

          <div className="flex justify-between items-center mb-6">
            <div>
              <span className="text-2xl font-bold text-neutral-800">${brick.price.toFixed(2)}</span>
              <span className="text-neutral-500 text-sm ml-1">per brick</span>
            </div>
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${
              brick.stock > 1000 
                ? 'bg-green-100 text-green-800' 
                : brick.stock > 0 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-red-100 text-red-800'
            }`}>
              {brick.stock > 1000 
                ? 'In Stock' 
                : brick.stock > 0 
                  ? `Limited Stock: ${brick.stock}` 
                  : 'Out of Stock'}
            </span>
          </div>

          {/* Features */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Features</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Truck size={18} className="text-primary-600 mt-0.5 mr-2 flex-shrink-0" />
                <span>Fast shipping within 3-5 business days</span>
              </li>
              <li className="flex items-start">
                <Shield size={18} className="text-primary-600 mt-0.5 mr-2 flex-shrink-0" />
                <span>10-year quality guarantee</span>
              </li>
              <li className="flex items-start">
                <Award size={18} className="text-primary-600 mt-0.5 mr-2 flex-shrink-0" />
                <span>Exceeds industry standards for durability</span>
              </li>
            </ul>
          </div>

          {/* Add to Cart Section */}
          <div className="border-t border-neutral-200 pt-6">
            <div className="flex items-center mb-4">
              <label htmlFor="modal-quantity" className="text-neutral-700 mr-4">
                Quantity (pcs):
              </label>
              <input
                id="modal-quantity"
                type="number"
                min="100"
                step="100"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 100)}
                className="w-32 px-3 py-2 border border-neutral-300 rounded-md"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">
                Total: ${(brick.price * quantity).toFixed(2)}
              </span>
              <Button
                onClick={handleAddToCart}
                isLoading={isAdding}
                disabled={brick.stock <= 0}
                icon={<ShoppingCart size={18} />}
              >
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrickModal;