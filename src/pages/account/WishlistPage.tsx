import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card, { CardImage, CardContent } from '../../components/ui/Card';
import { mockBricks } from '../../mocks/data';

const WishlistPage: React.FC = () => {
  // In a real app, this would be managed by a context or Redux
  const wishlistItems = mockBricks.slice(0, 2);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-neutral-800 mb-6">My Wishlist</h2>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-8">
          <div className="mb-4">
            <ShoppingCart size={48} className="text-neutral-300 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-neutral-800 mb-2">Your wishlist is empty</h3>
          <p className="text-neutral-600 mb-6">Browse our catalog to add items to your wishlist.</p>
          <Link to="/catalog">
            <Button>Browse Catalog</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {wishlistItems.map((item) => (
            <Card key={item.id} className="relative">
              <button
                className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-neutral-50"
                aria-label="Remove from wishlist"
              >
                <Trash2 size={18} className="text-neutral-600" />
              </button>
              
              <CardImage src={item.image} alt={item.name} />
              <CardContent>
                <h3 className="text-lg font-semibold text-neutral-800 mb-2">{item.name}</h3>
                <p className="text-neutral-600 mb-2">{item.type} • {item.size}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-neutral-800">
                    ${item.price.toFixed(2)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<ShoppingCart size={18} />}
                  >
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;