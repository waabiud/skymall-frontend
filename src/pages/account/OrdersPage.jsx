import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiArrowRight, FiClock, FiCheck, FiX, FiTruck } from 'react-icons/fi';
import { ordersAPI } from '../../api/endpoints';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  pending:    { color: 'bg-yellow-100 text-yellow-700', icon: FiClock },
  confirmed:  { color: 'bg-blue-100 text-blue-700',    icon: FiCheck },
  processing: { color: 'bg-purple-100 text-purple-700',icon: FiPackage },
  shipped:    { color: 'bg-indigo-100 text-indigo-700',icon: FiTruck },
  delivered:  { color: 'bg-green-100 text-green-700',  icon: FiCheck },
  cancelled:  { color: 'bg-red-100 text-red-700',      icon: FiX },
  refunded:   { color: 'bg-gray-100 text-gray-700',    icon: FiX },
};

const OrdersPage = () => {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersAPI.getOrders()
      .then((res) => setOrders(res.data.results || res.data))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-3 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-heading text-2xl font-bold dark:text-white mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center
                          justify-center mx-auto mb-4">
            <FiPackage size={32} className="text-gray-400" />
          </div>
          <h2 className="font-heading text-xl font-bold dark:text-white mb-2">No orders yet</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
            Your order history will appear here
          </p>
          <Link to="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white
                       font-semibold rounded-xl hover:bg-blue-600 transition text-sm">
            Start Shopping <FiArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            const Icon   = config.icon;
            return (
              <Link key={order.id} to={`/orders/${order.order_number}`}
                className="block bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
                           dark:border-gray-800 p-5 hover:shadow-md transition group">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-mono text-sm font-bold dark:text-white">{order.order_number}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {new Date(order.created_at).toLocaleDateString('en-KE', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
                      <Icon size={12} /> {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <FiArrowRight size={16} className="text-gray-400 group-hover:text-primary transition" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <p className="text-gray-500 dark:text-gray-400">
                    {order.items?.length || 0} item(s)
                  </p>
                  <p className="font-bold text-primary">
                    KES {Number(order.total).toLocaleString()}
                  </p>
                </div>
                <div className="mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full
                    ${order.payment_status === 'paid'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'}`}>
                    {order.payment_status === 'paid' ? 'Paid' : 'Awaiting Payment'}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
