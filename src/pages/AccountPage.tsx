import React from 'react';
import { Link, useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import { Package, ShoppingBag, Truck, User, LogOut } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import OrderItem from '../components/orders/OrderItem';
import { mockOrders } from '../mocks/data';
import ProfileSettings from './account/ProfileSettings';
import WishlistPage from './account/WishlistPage';
import TrackOrderPage from './account/TrackOrderPage';
import ShippingAddressPage from './account/ShippingAddressPage';

const AccountPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  if (!user) {
    navigate('/login');
    return null;
  }
  
  const userOrders = mockOrders.filter(order => order.customerId === user.id);

  const isActivePath = (path: string) => {
    return location.pathname === `/account${path}`;
  };

  const getButtonClasses = (path: string) => `
    w-full text-left flex items-center px-4 py-2 rounded-md transition-colors
    ${isActivePath(path) 
      ? 'bg-primary-50 text-primary-700' 
      : 'hover:bg-neutral-50 text-neutral-700'}
  `;
  
  return (
    <Layout>
      <div className="py-12 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-neutral-800">My Account</h1>
            <Button
              variant="outline"
              onClick={logout}
              size="sm"
              icon={<LogOut size={18} />}
            >
              Logout
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Account Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b border-neutral-200 flex items-center">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <User className="text-primary-600" size={24} />
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-neutral-800">{user.username}</p>
                    <p className="text-sm text-neutral-500">{user.email}</p>
                  </div>
                </div>
                
                <nav className="p-4">
                  <ul className="space-y-1">
                    <li>
                      <Link to="/account" className={getButtonClasses('')}>
                        <ShoppingBag size={18} className="mr-3" />
                        My Orders
                      </Link>
                    </li>
                    <li>
                      <Link to="/account/profile" className={getButtonClasses('/profile')}>
                        <User size={18} className="mr-3" />
                        Profile Settings
                      </Link>
                    </li>
                    <li>
                      <Link to="/account/shipping" className={getButtonClasses('/shipping')}>
                        <Truck size={18} className="mr-3" />
                        Shipping Addresses
                      </Link>
                    </li>
                    <li>
                      <Link to="/account/wishlist" className={getButtonClasses('/wishlist')}>
                        <Package size={18} className="mr-3" />
                        Wishlist
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
            
            {/* Content Area */}
            <div className="lg:col-span-3">
              <Routes>
                <Route index element={
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-neutral-800 mb-6">My Orders</h2>
                    
                    {userOrders.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="mb-4">
                          <ShoppingBag size={48} className="text-neutral-300 mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-neutral-800 mb-2">No orders yet</h3>
                        <p className="text-neutral-600 mb-6">You haven't placed any orders yet.</p>
                        <Link to="/catalog">
                          <Button>Browse Products</Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {userOrders.map((order) => (
                          <OrderItem key={order.id} order={order} />
                        ))}
                      </div>
                    )}
                  </div>
                } />
                <Route path="profile" element={<ProfileSettings />} />
                <Route path="wishlist" element={<WishlistPage />} />
                <Route path="shipping" element={<ShippingAddressPage />} />
                <Route path="track/:orderId" element={<TrackOrderPage />} />
              </Routes>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AccountPage;