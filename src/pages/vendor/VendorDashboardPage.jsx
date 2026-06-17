import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiGrid, FiPackage, FiShoppingBag, FiTrendingUp,
  FiAlertTriangle, FiPlus, FiEdit2, FiTrash2,
  FiEye, FiCheck, FiTruck, FiX, FiDollarSign,
  FiRefreshCw, FiMenu, FiChevronRight, FiStar,
  FiToggleLeft, FiToggleRight
} from 'react-icons/fi';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart,
  Pie, Cell
} from 'recharts';
import { vendorAPI } from '../../api/endpoints';
import toast from 'react-hot-toast';

// ── Stat Card ─────────────────────────────────────────────────
const StatCard = ({ title, value, icon: Icon, color, sub }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
                  dark:border-gray-800 p-5">
    <div className="flex items-center justify-between mb-3">
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
        <Icon size={18} className="text-white" />
      </div>
    </div>
    <p className="font-heading text-2xl font-bold dark:text-white">{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

// ── Overview Tab ──────────────────────────────────────────────
const OverviewTab = ({ analytics, loading }) => {
  if (loading) return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="h-28 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
      ))}
    </div>
  );

  if (!analytics) return null;

  const COLORS = ['#E91E8C', '#FF6B35', '#FFC107', '#4CAF50', '#2196F3'];

  const orderStatusData = [
    { name: 'Pending',    value: analytics.pending_orders },
    { name: 'Confirmed',  value: analytics.confirmed_orders },
    { name: 'Processing', value: analytics.processing_orders },
    { name: 'Shipped',    value: analytics.shipped_orders },
    { name: 'Delivered',  value: analytics.completed_orders },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" icon={FiDollarSign} color="bg-primary"
          value={`KES ${Number(analytics.total_revenue).toLocaleString()}`}
          sub="All time" />
        <StatCard title="This Month" icon={FiTrendingUp} color="bg-green-500"
          value={`KES ${Number(analytics.recent_revenue).toLocaleString()}`}
          sub="Last 30 days" />
        <StatCard title="Total Orders" icon={FiShoppingBag} color="bg-blue-500"
          value={analytics.total_orders}
          sub={`${analytics.pending_orders} pending`} />
        <StatCard title="Products" icon={FiPackage} color="bg-purple-500"
          value={analytics.total_products}
          sub={`${analytics.low_stock_products} low stock`} />
      </div>

      {/* Order status mini stats */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Pending',    value: analytics.pending_orders,    color: 'bg-blue-100 text-blue-700' },
          { label: 'Confirmed',  value: analytics.confirmed_orders,  color: 'bg-pink-100 text-primary' },
          { label: 'Processing', value: analytics.processing_orders, color: 'bg-yellow-100 text-yellow-700' },
          { label: 'Shipped',    value: analytics.shipped_orders,    color: 'bg-purple-100 text-purple-700' },
          { label: 'Delivered',  value: analytics.completed_orders,  color: 'bg-green-100 text-green-700' },
          { label: 'Cancelled',  value: analytics.cancelled_orders,  color: 'bg-red-100 text-red-700' },
        ].map((s) => (
          <div key={s.label}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100
                       dark:border-gray-800 p-3 text-center">
            <p className={`text-lg font-bold px-2 py-0.5 rounded-lg inline-block
                          ${s.color}`}>
              {s.value}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border
                        border-gray-100 dark:border-gray-800 p-5">
          <h3 className="font-heading font-bold dark:text-white mb-4">
            Revenue (Last 6 Months)
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={analytics.monthly_data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }}
                tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(v) => [`KES ${Number(v).toLocaleString()}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#E91E8C" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Order status pie */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
                        dark:border-gray-800 p-5">
          <h3 className="font-heading font-bold dark:text-white mb-4">
            Order Status
          </h3>
          {orderStatusData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={orderStatusData} cx="50%" cy="50%"
                    innerRadius={40} outerRadius={65}
                    dataKey="value" paddingAngle={3}>
                    {orderStatusData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {orderStatusData.map((d, i) => (
                  <div key={d.name}
                    className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full"
                        style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-gray-600 dark:text-gray-400">{d.name}</span>
                    </div>
                    <span className="font-semibold dark:text-white">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-40 flex items-center justify-center">
              <p className="text-gray-400 text-sm">No orders yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Monthly orders line chart */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
                      dark:border-gray-800 p-5">
        <h3 className="font-heading font-bold dark:text-white mb-4">
          Orders Trend
        </h3>
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={analytics.monthly_data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="orders" stroke="#E91E8C"
              strokeWidth={2} dot={{ fill: '#E91E8C', r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Alerts */}
      {(analytics.low_stock_products > 0 || analytics.out_of_stock > 0) && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200
                        dark:border-yellow-800 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <FiAlertTriangle size={20} className="text-yellow-600 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-800 dark:text-yellow-400">
                Stock Alerts
              </p>
              {analytics.low_stock_products > 0 && (
                <p className="text-sm text-yellow-700 dark:text-yellow-500">
                  {analytics.low_stock_products} product(s) running low on stock
                </p>
              )}
              {analytics.out_of_stock > 0 && (
                <p className="text-sm text-yellow-700 dark:text-yellow-500">
                  {analytics.out_of_stock} product(s) out of stock
                </p>
              )}
              <Link to="/vendor/products"
                className="text-xs text-yellow-700 dark:text-yellow-400
                           hover:underline font-medium mt-1 inline-block">
                Manage Stock →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Products Tab ──────────────────────────────────────────────
const ProductsTab = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('all');

  useEffect(() => { fetchProducts(); }, [filter]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { stock: filter } : {};
      const res    = await vendorAPI.getProducts(params);
      setProducts(Array.isArray(res.data) ? res.data : (res.data.results || []));
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await vendorAPI.deleteProduct(slug);
      toast.success('Product deleted');
      fetchProducts();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const handleToggleActive = async (product) => {
    try {
      await vendorAPI.updateProduct(product.slug, { is_active: !product.is_active });
      toast.success(product.is_active ? 'Product hidden' : 'Product visible');
      fetchProducts();
    } catch {
      toast.error('Failed to update product');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'All' },
            { key: 'low', label: 'Low Stock' },
            { key: 'out', label: 'Out of Stock' },
          ].map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition
                ${filter === f.key
                  ? 'bg-primary text-white'
                  : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
              {f.label}
            </button>
          ))}
        </div>
        <Link to="/vendor/products/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white
                     text-sm font-semibold rounded-xl hover:bg-primary-dark transition">
          <FiPlus size={16} /> Add Product
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i}
              className="h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl
                        border border-gray-100 dark:border-gray-800">
          <FiPackage size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="font-semibold dark:text-white mb-2">No products yet</p>
          <Link to="/vendor/products/new"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary
                       text-white rounded-xl text-sm font-semibold">
            <FiPlus size={14} /> Add Your First Product
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
                        dark:border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500
                               uppercase tracking-wide">Product</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500
                               uppercase tracking-wide hidden sm:table-cell">Price</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500
                               uppercase tracking-wide hidden md:table-cell">Stock</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500
                               uppercase tracking-wide hidden lg:table-cell">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500
                               uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {products.map((product) => (
                <tr key={product.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800
                                      rounded-lg overflow-hidden flex-shrink-0">
                        {product.primary_image
                          ? <img src={product.primary_image} alt=""
                                 className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center
                                            justify-center">
                              <FiPackage size={16} className="text-gray-400" />
                            </div>
                        }
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium dark:text-white truncate
                                      max-w-[150px]">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-400">{product.category_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <p className="text-sm font-semibold text-primary">
                      KES {Number(product.discounted_price).toLocaleString()}
                    </p>
                    {product.discount > 0 && (
                      <p className="text-xs text-gray-400 line-through">
                        KES {Number(product.price).toLocaleString()}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold
                      ${product.stock === 0
                        ? 'bg-red-100 text-red-700'
                        : product.stock <= 5
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                      }`}>
                      {product.stock === 0 ? 'Out' : `${product.stock} left`}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <button onClick={() => handleToggleActive(product)}
                      className="flex items-center gap-1.5 text-xs font-medium">
                      {product.is_active
                        ? <><FiToggleRight size={18} className="text-green-500" />
                            <span className="text-green-600">Active</span></>
                        : <><FiToggleLeft size={18} className="text-gray-400" />
                            <span className="text-gray-500">Hidden</span></>
                      }
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/shop/${product.slug}`}
                        className="p-1.5 rounded-lg hover:bg-gray-100
                                   dark:hover:bg-gray-700 transition"
                        title="View">
                        <FiEye size={15} className="text-gray-500" />
                      </Link>
                      <Link to={`/vendor/products/${product.slug}/edit`}
                        className="p-1.5 rounded-lg hover:bg-gray-100
                                   dark:hover:bg-gray-700 transition"
                        title="Edit">
                        <FiEdit2 size={15} className="text-blue-500" />
                      </Link>
                      <button onClick={() => handleDelete(product.slug)}
                        className="p-1.5 rounded-lg hover:bg-gray-100
                                   dark:hover:bg-gray-700 transition"
                        title="Delete">
                        <FiTrash2 size={15} className="text-danger" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ── Orders Tab ────────────────────────────────────────────────
const OrdersTab = () => {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');
  const [updating, setUpdating] = useState(null);

  useEffect(() => { fetchOrders(); }, [filter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const res    = await vendorAPI.getOrders(params);
      setOrders(Array.isArray(res.data) ? res.data : (res.data.results || []));
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderNumber, newStatus) => {
    setUpdating(orderNumber);
    try {
      await vendorAPI.updateOrder(orderNumber, { status: newStatus });
      toast.success(`Order marked as ${newStatus}`);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update order');
    } finally {
      setUpdating(null);
    }
  };

  const statusColor = {
    pending:    'bg-blue-100 text-blue-700',
    confirmed:  'bg-pink-100 text-primary',
    processing: 'bg-yellow-100 text-yellow-700',
    shipped:    'bg-purple-100 text-purple-700',
    delivered:  'bg-green-100 text-green-700',
    cancelled:  'bg-red-100 text-red-700',
  };

  const nextStatus = {
    confirmed:  'processing',
    processing: 'shipped',
    shipped:    'delivered',
  };

  const nextLabel = {
    confirmed:  'Mark Processing',
    processing: 'Mark Shipped',
    shipped:    'Mark Delivered',
  };

  const filterTabs = [
    { key: 'all',        label: 'All' },
    { key: 'confirmed',  label: 'Confirmed' },
    { key: 'processing', label: 'Processing' },
    { key: 'shipped',    label: 'Shipped' },
    { key: 'delivered',  label: 'Delivered' },
  ];

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {filterTabs.map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium
                       transition
              ${filter === f.key
                ? 'bg-primary text-white'
                : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
              }`}>
            {f.label}
          </button>
        ))}
        <button onClick={fetchOrders}
          className="flex-shrink-0 p-1.5 rounded-xl border border-gray-200
                     dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
          <FiRefreshCw size={14} className="text-gray-500" />
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i}
              className="h-32 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl
                        border border-gray-100 dark:border-gray-800">
          <FiShoppingBag size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="font-semibold dark:text-white">No orders found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <motion.div key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
                         dark:border-gray-800 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-mono font-bold text-sm dark:text-white">
                    {order.order_number}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {new Date(order.created_at).toLocaleDateString('en-KE', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold
                                  capitalize ${statusColor[order.status] || 'bg-gray-100 text-gray-700'}`}>
                  {order.status}
                </span>
              </div>

              {/* Items */}
              <div className="space-y-1.5 mb-3">
                {order.items?.slice(0, 3).map((item) => (
                  <div key={item.id}
                    className="flex justify-between text-xs text-gray-600
                               dark:text-gray-400">
                    <span className="truncate max-w-[60%]">
                      {item.product_name} × {item.quantity}
                    </span>
                    <span className="font-medium">
                      KES {Number(item.subtotal).toLocaleString()}
                    </span>
                  </div>
                ))}
                {order.items?.length > 3 && (
                  <p className="text-xs text-gray-400">
                    +{order.items.length - 3} more items
                  </p>
                )}
              </div>

              {/* Delivery */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 mb-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  📍 {order.delivery_address}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  📞 {order.delivery_phone}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <p className="font-bold text-primary">
                  KES {Number(order.total).toLocaleString()}
                </p>
                {nextStatus[order.status] && (
                  <button
                    onClick={() => handleUpdateStatus(
                      order.order_number, nextStatus[order.status]
                    )}
                    disabled={updating === order.order_number}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary
                               text-white text-xs font-semibold rounded-xl
                               hover:bg-primary-dark transition disabled:opacity-60">
                    {updating === order.order_number
                      ? 'Updating...'
                      : nextLabel[order.status]
                    }
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main Dashboard ────────────────────────────────────────────
const VendorDashboardPage = () => {
  const [activeTab,  setActiveTab]  = useState('overview');
  const [analytics,  setAnalytics]  = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [sidebarOpen,setSidebarOpen]= useState(false);

  useEffect(() => {
    vendorAPI.getAnalytics()
      .then((res) => setAnalytics(res.data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  const tabs = [
    { key: 'overview', label: 'Overview',  icon: FiGrid },
    { key: 'products', label: 'Products',  icon: FiPackage },
    { key: 'orders',   label: 'Orders',    icon: FiShoppingBag },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold dark:text-white">
            Vendor Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage your store and track performance
          </p>
        </div>
        <Link to="/vendor/products/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white
                     text-sm font-semibold rounded-xl hover:bg-primary-dark transition">
          <FiPlus size={16} /> New Product
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl
                      mb-6 w-fit">
        {tabs.map((tab) => (
          <button key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm
                       font-medium transition
              ${activeTab === tab.key
                ? 'bg-white dark:bg-gray-900 text-primary shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}>
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <OverviewTab analytics={analytics} loading={loading} />
      )}
      {activeTab === 'products' && <ProductsTab />}
      {activeTab === 'orders'   && <OrdersTab />}
    </div>
  );
};

export default VendorDashboardPage;
