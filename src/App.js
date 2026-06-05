import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useThemeStore from './store/themeStore';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

import HomePage            from './pages/HomePage';
import ShopPage            from './pages/shop/ShopPage';
import ProductDetailPage   from './pages/shop/ProductDetailPage';
import CartPage            from './pages/shop/CartPage';
import CheckoutPage        from './pages/shop/CheckoutPage';
import OrdersPage          from './pages/account/OrdersPage';
import OrderDetailPage     from './pages/account/OrderDetailPage';
import WishlistPage        from './pages/account/WishlistPage';
import ProfilePage         from './pages/account/ProfilePage';
import LoginPage           from './pages/auth/LoginPage';
import RegisterPage        from './pages/auth/RegisterPage';
import VerifyOTPPage       from './pages/auth/VerifyOTPPage';
import VendorDashboardPage from './pages/vendor/VendorDashboardPage';
import VendorProductForm   from './pages/vendor/VendorProductForm';
import NotFoundPage        from './pages/NotFoundPage';

import PrivateRoute from './components/common/PrivateRoute';
import VendorRoute  from './components/common/VendorRoute';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 1000 * 60 * 5 } },
});

function App() {
  const { init } = useThemeStore();
  useEffect(() => { init(); }, [init]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen flex flex-col bg-white dark:bg-dark text-dark dark:text-white">
          <Navbar />
          <main className="flex-1">
            <Routes>

              {/* Public */}
              <Route path="/"           element={<HomePage />} />
              <Route path="/shop"       element={<ShopPage />} />
              <Route path="/shop/:slug" element={<ProductDetailPage />} />
              <Route path="/login"      element={<LoginPage />} />
              <Route path="/register"   element={<RegisterPage />} />
              <Route path="/verify-otp" element={<VerifyOTPPage />} />

              {/* Protected */}
              <Route path="/cart"
                element={<PrivateRoute><CartPage /></PrivateRoute>} />
              <Route path="/checkout"
                element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
              <Route path="/orders"
                element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
              <Route path="/orders/:orderNumber"
                element={<PrivateRoute><OrderDetailPage /></PrivateRoute>} />
              <Route path="/wishlist"
                element={<PrivateRoute><WishlistPage /></PrivateRoute>} />
              <Route path="/profile"
                element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

              {/* Vendor */}
              <Route path="/vendor/*"
                element={<VendorRoute><VendorDashboardPage /></VendorRoute>} />
              <Route path="/vendor/products/new"
                element={<VendorRoute><VendorProductForm /></VendorRoute>} />
              <Route path="/vendor/products/:slug/edit"
                element={<VendorRoute><VendorProductForm /></VendorRoute>} />

              <Route path="*" element={<NotFoundPage />} />

            </Routes>
          </main>
          <Footer />
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { fontFamily: 'DM Sans, sans-serif' },
          }}
        />
      </Router>
    </QueryClientProvider>
  );
}

export default App;