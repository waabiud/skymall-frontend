import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiPackage, FiMapPin, FiPhone, FiCheck } from 'react-icons/fi';
import { ordersAPI } from '../../api/endpoints';
import toast from 'react-hot-toast';

const OrderDetailPage = () => {
  const { orderNumber }   = useParams();
  const [order,  setOrder]  = useState(null);
  const [loading,setLoading]= useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    ordersAPI.getOrder(orderNumber)
      .then((res) => setOrder(res.data))
      .catch(() => toast.error('Order not found'))
      .finally(() => setLoading(false));
  }, [orderNumber]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      await ordersAPI.cancelOrder(orderNumber);
      toast.success('Order cancelled');
      setOrder({ ...order, status: 'cancelled' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Cannot cancel this order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded-xl w-32" />
        <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
      </div>
    );
  }

  if (!order) return null;

  const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
  const currentStep = statusSteps.indexOf(order.status);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <div className="flex items-center gap-3 mb-6">
        <Link to="/orders" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <FiArrowLeft size={20} className="dark:text-white" />
        </Link>
        <div>
          <h1 className="font-heading text-xl font-bold dark:text-white">Order Details</h1>
          <p className="font-mono text-sm text-primary">{order.order_number}</p>
        </div>
      </div>

      {/* Status tracker */}
      {order.status !== 'cancelled' && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
                        dark:border-gray-800 p-6 mb-4">
          <h2 className="font-heading font-bold dark:text-white mb-4">Order Status</h2>
          <div className="flex items-center">
            {statusSteps.map((s, i) => (
              <React.Fragment key={s}>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                    ${i <= currentStep ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                    {i < currentStep ? <FiCheck size={14} /> : i + 1}
                  </div>
                  <span className="text-xs text-gray-500 mt-1 capitalize hidden sm:block">{s}</span>
                </div>
                {i < statusSteps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1
                    ${i < currentStep ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {order.status === 'cancelled' && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800
                        rounded-2xl p-4 mb-4">
          <p className="text-red-600 dark:text-red-400 font-semibold text-sm">Order Cancelled</p>
        </div>
      )}

      {/* Items */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
                      dark:border-gray-800 p-6 mb-4">
        <h2 className="font-heading font-bold dark:text-white mb-4 flex items-center gap-2">
          <FiPackage className="text-primary" /> Items Ordered
        </h2>
        <div className="space-y-3">
          {order.items?.map((item) => (
            <div key={item.id} className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium dark:text-white">{item.product_name}</p>
                <p className="text-xs text-gray-500">x{item.quantity} × KES {Number(item.unit_price).toLocaleString()}</p>
              </div>
              <p className="font-bold text-sm dark:text-white">
                KES {Number(item.subtotal).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 dark:border-gray-800 mt-4 pt-4 space-y-2 text-sm">
          <div className="flex justify-between text-gray-500 dark:text-gray-400">
            <span>Subtotal</span><span>KES {Number(order.subtotal).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-gray-500 dark:text-gray-400">
            <span>Delivery</span><span>KES {Number(order.delivery_fee).toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold dark:text-white text-base">
            <span>Total</span>
            <span className="text-primary">KES {Number(order.total).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Delivery info */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
                      dark:border-gray-800 p-6 mb-4">
        <h2 className="font-heading font-bold dark:text-white mb-3 flex items-center gap-2">
          <FiMapPin className="text-primary" /> Delivery Information
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">{order.delivery_address}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{order.delivery_city}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
          <FiPhone size={14} /> {order.delivery_phone}
        </p>
      </div>

      {/* Cancel button */}
      {['pending', 'confirmed'].includes(order.status) && (
        <button onClick={handleCancel} disabled={cancelling}
          className="w-full py-3 border-2 border-danger text-danger font-semibold rounded-xl
                     hover:bg-red-50 dark:hover:bg-red-900/20 transition disabled:opacity-60">
          {cancelling ? 'Cancelling...' : 'Cancel Order'}
        </button>
      )}
    </div>
  );
};

export default OrderDetailPage;
