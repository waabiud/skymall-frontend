import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiTrash2, FiMinus, FiPlus, FiShoppingBag,
  FiArrowRight
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { cartAPI } from '../../api/endpoints';
import useCartStore from '../../store/cartStore';

const CartPage = () => {
  const { cart, setCart, clearCart } = useCartStore();
  const [loading,  setLoading]  = useState(true);
  const [updating, setUpdating] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await cartAPI.getCart();
      setCart(res.data);
    } catch {
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (itemId, quantity) => {
    setUpdating(itemId);
    try {
      const res = await cartAPI.updateItem(itemId, { quantity });
      setCart(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update');
    } finally {
      setUpdating(null);
    }
  };

  const handleRemove = async (itemId) => {
    setUpdating(itemId);
    try {
      const res = await cartAPI.removeItem(itemId);
      setCart(res.data);
      toast.success('Item removed');
    } catch {
      toast.error('Failed to remove item');
    } finally {
      setUpdating(null);
    }
  };

  const handleClear = async () => {
    try {
      await cartAPI.clearCart();
      clearCart();
      toast.success('Cart cleared');
    } catch {
      toast.error('Failed to clear cart');
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const items = cart?.items || [];

  if (items.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center
                        justify-center mx-auto mb-6">
          <FiShoppingBag size={36} className="text-gray-400" />
        </div>
        <h2 className="font-heading text-2xl font-bold dark:text-white mb-2">Your cart is empty</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Looks like you haven't added anything yet.
        </p>
        <Link to="/shop"
          className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white
                     font-semibold rounded-xl hover:bg-blue-600 transition">
          Start Shopping <FiArrowRight size={18} />
        </Link>
      </div>
    );
  }

  const subtotal    = cart?.total || 0;
  const deliveryFee = 200;
  const total       = Number(subtotal) + deliveryFee;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold dark:text-white">
          Shopping Cart
          <span className="ml-2 text-base font-normal text-gray-500">({items.length} items)</span>
        </h1>
        <button onClick={handleClear}
          className="text-sm text-danger hover:underline flex items-center gap-1">
          <FiTrash2 size={14} /> Clear all
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Cart items */}
        <div className="lg:col-span-2 space-y-3">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
                           dark:border-gray-800 p-4 flex gap-4">

                {/* Image */}
                <Link to={`/shop/${item.product.slug}`} className="flex-shrink-0">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
                    {item.product.primary_image
                      ? <img src={item.product.primary_image} alt={item.product.name}
                             className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No img
                        </div>
                    }
                  </div>
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link to={`/shop/${item.product.slug}`}>
                    <h3 className="font-semibold dark:text-white text-sm hover:text-primary
                                   transition line-clamp-2">
                      {item.product.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {item.product.category_name}
                  </p>
                  <p className="text-primary font-bold mt-1">
                    KES {Number(item.product.discounted_price).toLocaleString()}
                  </p>
                </div>

                {/* Quantity & remove */}
                <div className="flex flex-col items-end justify-between">
                  <button onClick={() => handleRemove(item.id)}
                    disabled={updating === item.id}
                    className="text-gray-400 hover:text-danger transition p-1">
                    <FiTrash2 size={16} />
                  </button>

                  <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl">
                    <button
                      onClick={() => item.quantity > 1
                        ? handleUpdate(item.id, item.quantity - 1)
                        : handleRemove(item.id)}
                      disabled={updating === item.id}
                      className="p-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-l-xl transition">
                      <FiMinus size={14} className="dark:text-white" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold dark:text-white">
                      {updating === item.id ? '...' : item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdate(item.id, item.quantity + 1)}
                      disabled={updating === item.id || item.quantity >= item.product.stock}
                      className="p-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-r-xl transition
                                 disabled:opacity-40">
                      <FiPlus size={14} className="dark:text-white" />
                    </button>
                  </div>

                  <p className="text-sm font-bold dark:text-white">
                    KES {Number(item.subtotal).toLocaleString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
                          dark:border-gray-800 p-6 sticky top-24">
            <h2 className="font-heading font-bold text-lg dark:text-white mb-4">Order Summary</h2>

            <div className="space-y-3 text-sm mb-4">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal ({items.length} items)</span>
                <span>KES {Number(subtotal).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Delivery fee</span>
                <span>KES {deliveryFee.toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-100 dark:border-gray-800 pt-3
                              flex justify-between font-bold text-base dark:text-white">
                <span>Total</span>
                <span className="text-primary">KES {total.toLocaleString()}</span>
              </div>
            </div>

            <button onClick={() => navigate('/checkout')}
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white
                         font-semibold rounded-xl hover:bg-blue-600 transition">
              Proceed to Checkout <FiArrowRight size={18} />
            </button>

            <Link to="/shop"
              className="block text-center text-sm text-primary hover:underline mt-4">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
