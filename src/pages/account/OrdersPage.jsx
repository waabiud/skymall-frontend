import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiPackage, FiChevronRight, FiShoppingBag,
  FiClock, FiCheck, FiTruck, FiX
} from 'react-icons/fi';
import { ordersAPI } from '../../api/endpoints';
import toast from 'react-hot-toast';

const statusIcon = {
  pending:    { icon: FiClock,       color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/20' },
  confirmed:  { icon: FiCheck,       color: 'text-primary',    bg: 'bg-pink-50 dark:bg-pink-900/20' },
  processing: { icon: FiPackage,     color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
  shipped:    { icon: FiTruck,       color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  delivered:  { icon: FiCheck,       color: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-900/20' },
  cancelled:  { icon: FiX,           color: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-900/20' },
};

const OrdersPage = () => {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');

  useEffect(() => {
    ordersAPI.getOrders().then((res) => {
      setOrders(Array.isArray(res.data) ? res.data : (res.data.results || []));
    }).catch(() => {
      toast.error('Failed to load orders');
    }).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all'
    ? orders
    : orders.filter((o) => o.status === filter);

  const tabs = [
    { key: 'all',        label: 'All' },
    { key: 'pending',    label: 'Pending' },
    { key: 'confirmed',  label: 'Confirmed' },
    { key: 'processing', label: 'Processing' },
    { key: 'shipped',    label: 'Shipped' },
    { key: 'delivered',  label: 'Delivered' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center
                        justify-center">
          <FiPackage size={20} className="text-primary" />
        </div>
        <h1 className="font-heading text-2xl font-bold dark:text-white">
          My Orders
        </h1>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {tabs.map((tab) => (
          <button key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium
                       transition
              ${filter === tab.key
                ? 'bg-primary text-white'
                : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary hover:text-primary'
              }`}>
            {tab.label}
            {tab.key !== 'all' && orders.filter((o) => o.status === tab.key).length > 0 && (
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full
                ${filter === tab.key ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
                {orders.filter((o) => o.status === tab.key).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
                         dark:border-gray-800 p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl
                        border border-gray-100 dark:border-gray-800">
          <FiShoppingBag size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="font-heading font-bold dark:text-white mb-2">
            No orders found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            {filter === 'all'
              ? "You haven't placed any orders yet"
              : `No ${filter} orders`}
          </p>
          <Link to="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary
                       text-white font-semibold rounded-xl hover:bg-primary-dark
                       transition text-sm">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order, idx) => {
            const info = statusIcon[order.status] || statusIcon.pending;
            const Icon = info.icon;

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}>
                <Link to={`/orders/${order.order_number}`}
                  className="block bg-white dark:bg-gray-900 rounded-2xl border
                             border-gray-100 dark:border-gray-800 p-5
                             hover:border-primary hover:shadow-md transition group">
                  <div className="flex items-center gap-4">

                    {/* Status icon */}
                    <div className={`w-12 h-12 ${info.bg} rounded-xl flex items-center
                                     justify-center flex-shrink-0`}>
                      <Icon size={22} className={info.color} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-mono font-bold text-sm dark:text-white">
                          {order.order_number}
                        </p>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full
                                         capitalize
                          ${order.status === 'delivered'
                            ? 'bg-green-100 text-green-700'
                            : order.status === 'cancelled'
                            ? 'bg-red-100 text-red-700'
                            : order.status === 'shipped'
                            ? 'bg-purple-100 text-purple-700'
                            : order.status === 'confirmed'
                            ? 'bg-pink-100 text-primary'
                            : 'bg-blue-100 text-blue-700'
                          }`}>
                          {order.status}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                        {' · '}
                        {new Date(order.created_at).toLocaleDateString('en-KE', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </p>

                      <div className="flex items-center justify-between">
                        <p className="font-bold text-primary text-sm">
                          KES {Number(order.total).toLocaleString()}
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                          ${order.payment_status === 'paid'
                            ? 'bg-green-50 text-green-600'
                            : 'bg-yellow-50 text-yellow-600'}`}>
                          {order.payment_status}
                        </span>
                      </div>
                    </div>

                    <FiChevronRight size={18}
                      className="text-gray-400 group-hover:text-primary transition
                                 flex-shrink-0" />
                  </div>

                  {/* Mini progress bar */}
                  {!['cancelled', 'refunded'].includes(order.status) && (
                    <div className="mt-3 flex gap-1">
                      {['pending', 'confirmed', 'processing', 'shipped', 'delivered'].map((s, i) => (
                        <div key={s}
                          className={`flex-1 h-1 rounded-full transition-all
                            ${['pending', 'confirmed', 'processing', 'shipped', 'delivered']
                                .indexOf(order.status) >= i
                              ? 'bg-primary'
                              : 'bg-gray-100 dark:bg-gray-800'
                            }`} />
                      ))}
                    </div>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
