import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, Package, User, UserCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import Button from '../ui/Button';

// Add UserRole type
type UserRole = "admin" | "customer";

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || isMobileMenuOpen
          ? 'bg-white shadow-md py-2'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Package size={32} className="text-primary-600 mr-2" />
            <span className="text-xl font-bold text-neutral-800">
              Brick<span className="text-primary-600">Co</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-neutral-700 hover:text-primary-600 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/catalog"
              className="text-neutral-700 hover:text-primary-600 transition-colors"
            >
              Catalog
            </Link>
            <Link
              to="/about"
              className="text-neutral-700 hover:text-primary-600 transition-colors"
            >
              About Us
            </Link>
            <Link
              to="/contact"
              className="text-neutral-700 hover:text-primary-600 transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to={user.role === "admin" ? '/admin' : '/account'}
                  className="flex items-center space-x-2 text-neutral-700 hover:text-neutral-900"
                >
                  <UserCircle size={24} />
                  <span>{user.role === "admin" ? 'Admin' : 'Account'}</span>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/login">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
            )}
            <Link to="/cart" className="relative">
              <ShoppingCart size={24} className="text-neutral-700 hover:text-primary-600" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <Link to="/cart" className="relative mr-4">
              <ShoppingCart size={24} className="text-neutral-700" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-neutral-700"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <nav className="md:hidden py-4 mt-2 bg-white">
            <ul className="flex flex-col space-y-3">
              <li>
                <Link
                  to="/"
                  className="block py-2 text-neutral-700 hover:text-primary-600"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/catalog"
                  className="block py-2 text-neutral-700 hover:text-primary-600"
                >
                  Catalog
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="block py-2 text-neutral-700 hover:text-primary-600"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="block py-2 text-neutral-700 hover:text-primary-600"
                >
                  Contact
                </Link>
              </li>
              {user ? (
                <>
                  <li>
                    <Link
                      to={user.role === "admin" ? '/admin' : '/account'}
                      className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                    >
                      {user.role === "admin" ? 'Admin Dashboard' : 'My Account'}
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={logout}
                      className="block py-2 text-neutral-700 hover:text-primary-600"
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <Link
                    to="/login"
                    className="block py-2 text-neutral-700 hover:text-primary-600"
                  >
                    Login
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;