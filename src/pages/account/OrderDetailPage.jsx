import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowLeft, FiPackage, FiTruck, FiCheck,
  FiX, FiClock, FiMapPin, FiPhone, FiShoppingBag,
  FiRefreshCw
} from 'react-icons/fi';
import { ordersAPI } from '../../api/endpoints';
import toast from 'react-hot-toast';

const STATUS_STEPS = [
  {
    key:   'pending',
    label: 'Order Placed',
    desc:  'Your order has been received',
    icon:  FiShoppingBag,
    color: 'bg-blue-500',
  },
  {
    key:   'confirmed',
    label: 'Confirmed',
    desc:  'Payment received, order confirmed',
    icon:  FiCheck,
    color: 'bg-primary',
  },
  {
    key:   'processing',
    label: 'Processing',
    desc:  'Vendor is preparing your order',
    icon:  FiPackage,
    color: 'bg-yellow-500',
  },
  {
    key:   'shipped',
    label: 'Shipped',
    desc:  'Your order is on the way',
    icon:  FiTruck,
    color: 'bg-purple-500',
  },
  {
    key:   'delivered',
    label: 'Delivered',
    desc:  'Order delivered successfully',
    icon:  FiCheck,
    color: 'bg-green-500',
  },
];

const getStepIndex = (status) => {
  const map = {
    pending:    0,
    confirmed:  1,
    processing: 2,
    shipped:    3,
    delivered:  4,
    cancelled:  -1,
    refunded:   -1,
  };
  return map[status] ?? 0;
};

const OrderDetailPage = () => {
  const { orderNumber }       = useParams();
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  // eslint-disable-next-line
  }, [orderNumber]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await ordersAPI.getOrder(orderNumber);
      setOrder(res.data);
    } catch {
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse space-y-4">
      <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded-xl w-48" />
      <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
      <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
    </div>
  );

  if (!order) return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <FiPackage size={48} className="text-gray-300 mx-auto mb-4" />
      <h2 className="font-heading text-xl font-bold dark:text-white mb-2">
        Order not found
      </h2>
      <Link to="/orders"
        className="text-primary hover:underline text-sm">
        Back to orders
      </Link>
    </div>
  );

  const currentStep   = getStepIndex(order.status);
  const isCancelled   = ['cancelled', 'refunded'].includes(order.status);

  const statusColor = {
    pending:    'bg-blue-100 text-blue-700',
    confirmed:  'bg-pink-100 text-primary',
    processing: 'bg-yellow-100 text-yellow-700',
    shipped:    'bg-purple-100 text-purple-700',
    delivered:  'bg-green-100 text-green-700',
    cancelled:  'bg-red-100 text-red-700',
    refunded:   'bg-gray-100 text-gray-700',
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/orders"
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800
                     transition">
          <FiArrowLeft size={20} className="dark:text-white" />
        </Link>
        <div>
          <h1 className="font-heading text-2xl font-bold dark:text-white">
            Order Details
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
            {order.order_number}
          </p>
        </div>
        <button onClick={fetchOrder}
          className="ml-auto p-2 rounded-xl hover:bg-gray-100
                     dark:hover:bg-gray-800 transition">
          <FiRefreshCw size={18} className="text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* Status badge */}
      <div className="flex items-center justify-between mb-6">
        <span className={`px-4 py-1.5 rounded-full text-sm font-bold capitalize
                         ${statusColor[order.status] || 'bg-gray-100 text-gray-700'}`}>
          {order.status}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {new Date(order.created_at).toLocaleDateString('en-KE', {
            day: 'numeric', month: 'long', year: 'numeric'
          })}
        </span>
      </div>

      {/* Timeline */}
      {!isCancelled ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
                        dark:border-gray-800 p-6 mb-6">
          <h2 className="font-heading font-bold dark:text-white mb-6">
            Order Timeline
          </h2>

          <div className="relative">
            {STATUS_STEPS.map((step, idx) => {
              const isCompleted = idx <= currentStep;
              const isCurrent   = idx === currentStep;
              const Icon        = step.icon;

              return (
                <motion.div
                  key={step.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex gap-4 mb-6 last:mb-0 relative">

                  {/* Connector line */}
                  {idx < STATUS_STEPS.length - 1 && (
                    <div className={`absolute left-5 top-10 w-0.5 h-8
                                    transition-all duration-500
                      ${isCompleted && idx < currentStep
                        ? 'bg-primary'
                        : 'bg-gray-200 dark:bg-gray-700'}`} />
                  )}

                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center
                                   justify-center flex-shrink-0 transition-all
                                   duration-300 z-10
                    ${isCompleted
                      ? `${step.color} shadow-lg`
                      : 'bg-gray-100 dark:bg-gray-800'
                    } ${isCurrent ? 'ring-4 ring-primary/20 scale-110' : ''}`}>
                    <Icon size={18}
                      className={isCompleted ? 'text-white' : 'text-gray-400'} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1.5">
                    <div className="flex items-center justify-between">
                      <p className={`font-semibold text-sm
                        ${isCompleted
                          ? 'dark:text-white text-gray-900'
                          : 'text-gray-400 dark:text-gray-600'}`}>
                        {step.label}
                        {isCurrent && (
                          <span className="ml-2 text-xs bg-primary/10 text-primary
                                           px-2 py-0.5 rounded-full font-medium">
                            Current
                          </span>
                        )}
                      </p>
                    </div>
                    <p className={`text-xs mt-0.5
                      ${isCompleted
                        ? 'text-gray-500 dark:text-gray-400'
                        : 'text-gray-300 dark:text-gray-700'}`}>
                      {step.desc}
                    </p>

                    {/* History note for this step */}
                    {order.history?.find((h) => h.status === step.key) && (
                      <div className="mt-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg
                                      px-3 py-1.5">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {order.history.find((h) => h.status === step.key)?.note}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(
                            order.history.find((h) => h.status === step.key)?.changed_at
                          ).toLocaleString('en-KE')}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200
                        dark:border-red-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center
                            justify-center">
              <FiX size={20} className="text-red-600" />
            </div>
            <div>
              <p className="font-semibold text-red-700 dark:text-red-400">
                Order {order.status}
              </p>
              <p className="text-sm text-red-500">
                {order.history?.[0]?.note || 'This order has been cancelled'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Delivery info */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
                      dark:border-gray-800 p-6 mb-6">
        <h2 className="font-heading font-bold dark:text-white mb-4">
          Delivery Information
        </h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <FiMapPin size={16} className="text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                Delivery Address
              </p>
              <p className="text-sm font-medium dark:text-white">
                {order.delivery_address}
              </p>
              <p className="text-xs text-gray-500">{order.delivery_city}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FiPhone size={16} className="text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                Phone
              </p>
              <p className="text-sm font-medium dark:text-white">
                {order.delivery_phone}
              </p>
            </div>
          </div>
          {order.estimated_arrival && (
            <div className="flex items-start gap-3">
              <FiClock size={16} className="text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                  Estimated Arrival
                </p>
                <p className="text-sm font-medium dark:text-white">
                  {new Date(order.estimated_arrival).toLocaleDateString('en-KE', {
                    weekday: 'long', day: 'numeric', month: 'long'
                  })}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order items */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
                      dark:border-gray-800 p-6 mb-6">
        <h2 className="font-heading font-bold dark:text-white mb-4">
          Items Ordered
        </h2>
        <div className="space-y-3">
          {order.items?.map((item) => (
            <div key={item.id}
              className="flex items-center gap-4 pb-3 border-b border-gray-50
                         dark:border-gray-800 last:border-0 last:pb-0">
              <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-xl
                              flex items-center justify-center flex-shrink-0">
                <FiPackage size={20} className="text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold dark:text-white truncate">
                  {item.product_name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Qty: {item.quantity} × KES {Number(item.unit_price).toLocaleString()}
                </p>
              </div>
              <p className="text-sm font-bold text-primary flex-shrink-0">
                KES {Number(item.subtotal).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800
                        space-y-2">
          <div className="flex justify-between text-sm text-gray-600
                          dark:text-gray-400">
            <span>Subtotal</span>
            <span>KES {Number(order.subtotal).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600
                          dark:text-gray-400">
            <span>Delivery</span>
            <span>KES {Number(order.delivery_fee).toLocaleString()}</span>
          </div>
          {order.discount_amount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount</span>
              <span>- KES {Number(order.discount_amount).toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between font-bold dark:text-white text-base
                          pt-2 border-t border-gray-100 dark:border-gray-800">
            <span>Total Paid</span>
            <span className="text-primary">
              KES {Number(order.total).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Payment info */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
                      dark:border-gray-800 p-6 mb-6">
        <h2 className="font-heading font-bold dark:text-white mb-4">
          Payment Information
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Payment Method
            </p>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm
                             font-bold rounded-lg uppercase">
              {order.payment_method}
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Payment Status
            </p>
            <span className={`px-3 py-1 text-sm font-bold rounded-lg capitalize
              ${order.payment_status === 'paid'
                ? 'bg-green-100 text-green-700'
                : order.payment_status === 'failed'
                ? 'bg-red-100 text-red-700'
                : 'bg-yellow-100 text-yellow-700'
              }`}>
              {order.payment_status}
            </span>
          </div>
          {order.mpesa_code && (
            <div className="col-span-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                M-Pesa Receipt
              </p>
              <p className="text-sm font-mono font-bold dark:text-white">
                {order.mpesa_code}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link to="/orders"
          className="flex-1 py-3 border-2 border-gray-200 dark:border-gray-700
                     text-gray-700 dark:text-gray-300 font-semibold rounded-xl
                     hover:bg-gray-50 dark:hover:bg-gray-800 transition text-sm
                     text-center">
          All Orders
        </Link>
        <Link to="/shop"
          className="flex-1 py-3 bg-primary text-white font-semibold rounded-xl
                     hover:bg-primary-dark transition text-sm text-center">
          Shop More
        </Link>
      </div>
    </div>
  );
};

export default OrderDetailPage;
