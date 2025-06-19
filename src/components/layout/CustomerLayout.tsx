import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { ShoppingCart, User, LogOut } from 'lucide-react';

const CustomerLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const cartItemCount = cart.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="text-2xl font-bold text-primary-600">
              BrickCo
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                to="/catalog"
                className="text-neutral-600 hover:text-neutral-900"
              >
                Catalog
              </Link>
              {user && (
                <Link
                  to="/account/orders"
                  className="text-neutral-600 hover:text-neutral-900"
                >
                  Orders
                </Link>
              )}
            </nav>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              <Link
                to="/cart"
                className="relative text-neutral-600 hover:text-neutral-900"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-neutral-600 hover:text-neutral-900">
                    <User className="w-6 h-6" />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block">
                    <Link
                      to="/account"
                      className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                    >
                      My Account
                    </Link>
                    <Link
                      to="/account/orders"
                      className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                    >
                      Order History
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 flex items-center"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="text-neutral-600 hover:text-neutral-900"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-neutral-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">About BrickCo</h3>
              <p className="text-neutral-400">
                Your trusted source for high-quality bricks and construction materials.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/catalog" className="text-neutral-400 hover:text-white">
                    Browse Catalog
                  </Link>
                </li>
                <li>
                  <Link to="/account/orders" className="text-neutral-400 hover:text-white">
                    Track Orders
                  </Link>
                </li>
                <li>
                  <Link to="/account" className="text-neutral-400 hover:text-white">
                    My Account
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <ul className="space-y-2 text-neutral-400">
                <li>Email: support@brickco.com</li>
                <li>Phone: (555) 123-4567</li>
                <li>Address: 123 Brick Lane, Construction City</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-neutral-700 text-center text-neutral-400">
            <p>&copy; {new Date().getFullYear()} BrickCo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CustomerLayout; 