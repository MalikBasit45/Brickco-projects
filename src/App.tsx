import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import CatalogPage from './pages/CatalogPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import CheckoutSuccessPage from './pages/CheckoutSuccessPage';
import AccountPage from './pages/AccountPage';

// Admin Pages
import AdminLayout from './components/layout/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import BricksPage from './pages/admin/BricksPage';
import OrdersPage from './pages/admin/OrdersPage';
import CustomersPage from './pages/admin/CustomersPage';
import SpendsPage from './pages/admin/SpendsPage';
import StockHistoryPage from './pages/admin/StockHistoryPage';

// Customer Pages
import CustomerLayout from './components/layout/CustomerLayout';
import OrderHistoryPage from './pages/account/OrderHistoryPage';
import RegisterPage from './pages/auth/RegisterPage';

// Auth Guard Components
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAdmin = true; // Replace with actual admin check
  return isAdmin ? <>{children}</> : <Navigate to="/login" />;
};

const CustomerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = true; // Replace with actual auth check
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <CartProvider>
            <Toaster position="top-right" />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<CustomerLayout />}>
                <Route index element={<HomePage />} />
                <Route path="catalog" element={<CatalogPage />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
              </Route>

              {/* Protected Customer Routes */}
              <Route path="/" element={<CustomerLayout />}>
                <Route
                  path="checkout"
                  element={
                    <CustomerRoute>
                      <CheckoutPage />
                    </CustomerRoute>
                  }
                />
                <Route
                  path="checkout/success"
                  element={
                    <CustomerRoute>
                      <CheckoutSuccessPage />
                    </CustomerRoute>
                  }
                />
                <Route
                  path="account"
                  element={
                    <CustomerRoute>
                      <AccountPage />
                    </CustomerRoute>
                  }
                />
                <Route
                  path="account/orders"
                  element={
                    <CustomerRoute>
                      <OrderHistoryPage />
                    </CustomerRoute>
                  }
                />
              </Route>

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="bricks" element={<BricksPage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="customers" element={<CustomersPage />} />
                <Route path="spends" element={<SpendsPage />} />
                <Route path="stock-history" element={<StockHistoryPage />} />
              </Route>

              {/* 404 Route */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </CartProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;