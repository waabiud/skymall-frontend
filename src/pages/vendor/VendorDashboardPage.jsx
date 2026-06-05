import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import {
  FiGrid, FiPackage, FiShoppingBag, FiBarChart2,
  FiDollarSign, FiAlertTriangle,
  FiTrash2, FiCheck, FiTruck, FiPlus, FiEdit2
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { vendorAPI } from '../../api/endpoints';
import VendorProductForm from './VendorProductForm';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
                  dark:border-gray-800 p-5">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
      <Icon size={20} className="text-white" />
    </div>
    <p className="text-2xl font-heading font-bold dark:text-white">{value}</p>
    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
  </div>
);

const VendorOverview = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  useEffect(() => {
    vendorAPI.getAnalytics()
      .then((res) => setAnalytics(res.data))
      .catch((err) => {
        const msg = err.response?.data?.detail || 'Failed to load analytics';
        setError(msg);
        toast.error(msg);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
      ))}
    </div>
  );

  if (error) return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800
                    rounded-2xl p-6 text-center">
      <p className="text-red-600 dark:text-red-400 font-semibold mb-2">Access Denied</p>
      <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
      <p className="text-xs text-gray-500 mt-2">
        Your vendor account may not be approved yet. Contact admin.
      </p>
    </div>
  );

  return (
    <div>
      <h2 className="font-heading text-xl font-bold dark:text-white mb-4">Overview</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={FiDollarSign} label="Total Sales"
          value={`KES ${Number(analytics?.total_sales || 0).toLocaleString()}`}
          color="bg-primary" />
        <StatCard icon={FiShoppingBag} label="Total Orders"
          value={analytics?.total_orders || 0} color="bg-secondary" />
        <StatCard icon={FiPackage} label="Products"
          value={analytics?.total_products || 0} color="bg-accent" />
        <StatCard icon={FiAlertTriangle} label="Low Stock"
          value={analytics?.low_stock_products || 0} color="bg-danger" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
                        dark:border-gray-800 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Pending Orders</p>
          <p className="font-heading text-2xl font-bold text-yellow-600">
            {analytics?.pending_orders || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
                        dark:border-gray-800 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Completed</p>
          <p className="font-heading text-2xl font-bold text-green-600">
            {analytics?.completed_orders || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
                        dark:border-gray-800 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">30-Day Revenue</p>
          <p className="font-heading text-2xl font-bold text-primary">
            KES {Number(analytics?.recent_revenue || 0).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

const VendorProducts = () => {
  const navigate   = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    vendorAPI.getProducts()
      .then((res) => setProducts(res.data.results || res.data))
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (slug) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await vendorAPI.deleteProduct(slug);
      setProducts(products.filter((p) => p.slug !== slug));
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const handleStockUpdate = async (slug, stock) => {
    try {
      await vendorAPI.updateStock(slug, { stock: parseInt(stock) });
      setProducts(products.map((p) =>
        p.slug === slug ? { ...p, stock: parseInt(stock) } : p
      ));
      toast.success('Stock updated');
    } catch {
      toast.error('Failed to update stock');
    }
  };

  if (loading) return (
    <div className="space-y-3 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
      ))}
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-xl font-bold dark:text-white">My Products</h2>
        {/* ✅ Add Product button */}
        <button
          onClick={() => navigate('/vendor/products/new')}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm
                     font-medium rounded-xl hover:bg-blue-600 transition">
          <FiPlus size={16} />
          Add Product
        </button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border
                        border-gray-100 dark:border-gray-800">
          <FiPackage size={36} className="text-gray-400 mx-auto mb-3" />
          <p className="dark:text-white font-semibold mb-2">No products yet</p>
          <button
            onClick={() => navigate('/vendor/products/new')}
            className="text-primary text-sm hover:underline">
            Add your first product
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
                        dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  {['Product', 'Price', 'Stock', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold
                                          text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {products.map((p) => (
                  <tr key={p.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg
                                        overflow-hidden flex-shrink-0">
                          {p.primary_image
                            ? <img src={p.primary_image} alt={p.name}
                                   className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center
                                              text-gray-400 text-xs">img</div>
                          }
                        </div>
                        <div>
                          <p className="font-medium dark:text-white line-clamp-1">{p.name}</p>
                          <p className="text-xs text-gray-500">{p.category_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-primary">
                        KES {Number(p.discounted_price).toLocaleString()}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <input type="number" defaultValue={p.stock} min={0}
                        onBlur={(e) => {
                          if (parseInt(e.target.value) !== p.stock) {
                            handleStockUpdate(p.slug, e.target.value);
                          }
                        }}
                        className="w-20 px-2 py-1 rounded-lg border border-gray-200
                                   dark:border-gray-700 bg-gray-50 dark:bg-gray-800
                                   dark:text-white text-sm focus:outline-none
                                   focus:ring-2 focus:ring-primary" />
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium
                        ${p.is_in_stock
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'}`}>
                        {p.is_in_stock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {/* ✅ Edit button */}
                        <button
                          onClick={() => navigate(`/vendor/products/edit/${p.slug}`)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20
                                     text-primary transition">
                          <FiEdit2 size={15} />
                        </button>
                        <button onClick={() => handleDelete(p.slug)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20
                                     text-danger transition">
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const VendorOrders = () => {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    vendorAPI.getOrders()
      .then((res) => setOrders(res.data.results || res.data))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusUpdate = async (orderNumber, newStatus) => {
    try {
      await vendorAPI.updateOrder(orderNumber, { status: newStatus });
      setOrders(orders.map((o) =>
        o.order_number === orderNumber ? { ...o, status: newStatus } : o
      ));
      toast.success(`Order marked as ${newStatus}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update order');
    }
  };

  if (loading) return (
    <div className="space-y-3 animate-pulse">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
      ))}
    </div>
  );

  return (
    <div>
      <h2 className="font-heading text-xl font-bold dark:text-white mb-4">Orders</h2>
      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border
                        border-gray-100 dark:border-gray-800">
          <FiShoppingBag size={36} className="text-gray-400 mx-auto mb-3" />
          <p className="dark:text-white font-semibold">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
                         dark:border-gray-800 p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-mono font-bold text-sm dark:text-white">
                    {order.order_number}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.created_at).toLocaleDateString('en-KE', {
                      year: 'numeric', month: 'short', day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize
                    ${order.status === 'delivered' ? 'bg-green-100 text-green-700'
                      : order.status === 'cancelled' ? 'bg-red-100 text-red-700'
                      : 'bg-blue-100 text-blue-700'}`}>
                    {order.status}
                  </span>
                  <p className="font-bold text-primary text-sm">
                    KES {Number(order.total).toLocaleString()}
                  </p>
                </div>
              </div>
              {!['delivered', 'cancelled'].includes(order.status) && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {order.status === 'confirmed' && (
                    <button
                      onClick={() => handleStatusUpdate(order.order_number, 'processing')}
                      className="flex items-center gap-1 px-3 py-1.5 bg-purple-100
                                 text-purple-700 rounded-lg text-xs font-medium
                                 hover:bg-purple-200 transition">
                      <FiPackage size={12} /> Mark Processing
                    </button>
                  )}
                  {order.status === 'processing' && (
                    <button
                      onClick={() => handleStatusUpdate(order.order_number, 'shipped')}
                      className="flex items-center gap-1 px-3 py-1.5 bg-indigo-100
                                 text-indigo-700 rounded-lg text-xs font-medium
                                 hover:bg-indigo-200 transition">
                      <FiTruck size={12} /> Mark Shipped
                    </button>
                  )}
                  {order.status === 'shipped' && (
                    <button
                      onClick={() => handleStatusUpdate(order.order_number, 'delivered')}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-100
                                 text-green-700 rounded-lg text-xs font-medium
                                 hover:bg-green-200 transition">
                      <FiCheck size={12} /> Mark Delivered
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const VendorDashboardPage = () => {
  const location = useLocation();

  const navItems = [
    { to: '/vendor',           label: 'Overview',  icon: FiGrid },
    { to: '/vendor/products',  label: 'Products',  icon: FiPackage },
    { to: '/vendor/orders',    label: 'Orders',    icon: FiShoppingBag },
    { to: '/vendor/analytics', label: 'Analytics', icon: FiBarChart2 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
                          dark:border-gray-800 p-3 sticky top-24">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 mb-2">
              Vendor Panel
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = item.to === '/vendor'
                  ? location.pathname === '/vendor'
                  : location.pathname.startsWith(item.to);
                return (
                  <Link key={item.to} to={item.to}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                                font-medium transition ${isActive
                                  ? 'bg-primary text-white'
                                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}>
                    <item.icon size={17} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-4">
          <Routes>
            <Route index              element={<VendorOverview />} />
            <Route path="products"    element={<VendorProducts />} />
            {/* ✅ Add & Edit routes */}
            <Route path="products/new"          element={<VendorProductForm />} />
            <Route path="products/edit/:slug"   element={<VendorProductForm />} />
            <Route path="orders"      element={<VendorOrders />} />
            <Route path="analytics"   element={<VendorOverview />} />
            <Route path="*"           element={<Navigate to="/vendor" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboardPage;