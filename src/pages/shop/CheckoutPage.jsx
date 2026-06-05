import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiPhone, FiCreditCard, FiCheck, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { cartAPI, ordersAPI, paymentsAPI } from '../../api/endpoints';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';

const steps = ['Delivery', 'Payment', 'Confirm'];

const CheckoutPage = () => {
  const navigate          = useNavigate();
  const { user }          = useAuthStore();
  const { cart, setCart, clearCart } = useCartStore();
  const [step, setStep]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [order,   setOrder]   = useState(null);
  const [stkSent, setStkSent] = useState(false);

  const [form, setForm] = useState({
    delivery_address: '',
    delivery_city:    'Nairobi',
    delivery_phone:   user?.phone || '',
    payment_method:   'mpesa',
    notes:            '',
    coupon_code:      '',
  });

  const [mpesaPhone, setMpesaPhone] = useState(user?.phone || '');

  useEffect(() => {
    cartAPI.getCart().then((res) => {
      setCart(res.data);
      setLoading(false);
    }).catch(() => {
      toast.error('Failed to load cart');
      navigate('/cart');
    });
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      const res = await ordersAPI.checkout(form);
      setOrder(res.data);
      clearCart();
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  const handleMpesaPay = async () => {
    if (!order) return;
    setPlacing(true);
    try {
      await paymentsAPI.stkPush({
        order_number: order.order_number,
        phone_number: mpesaPhone,
      });
      setStkSent(true);
      toast.success('STK push sent! Check your phone for M-Pesa prompt.', { duration: 8000 });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Payment initiation failed');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6 w-48" />
        <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
      </div>
    );
  }

  const items       = cart?.items || [];
  const subtotal    = cart?.total || 0;
  const deliveryFee = 200;
  const total       = Number(subtotal) + deliveryFee;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/cart" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <FiArrowLeft size={20} className="dark:text-white" />
        </Link>
        <h1 className="font-heading text-2xl font-bold dark:text-white">Checkout</h1>
      </div>

      {/* Steps */}
      <div className="flex items-center mb-8">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                transition ${i < step ? 'bg-green-500 text-white'
                  : i === step ? 'bg-primary text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                {i < step ? <FiCheck size={16} /> : i + 1}
              </div>
              <span className={`text-sm font-medium hidden sm:block
                ${i === step ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}`}>
                {s}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 transition
                ${i < step ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">

          {/* Step 0 — Delivery */}
          {step === 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
                         dark:border-gray-800 p-6">
              <h2 className="font-heading font-bold text-lg dark:text-white mb-5 flex items-center gap-2">
                <FiMapPin className="text-primary" /> Delivery Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Delivery Address
                  </label>
                  <textarea name="delivery_address" value={form.delivery_address}
                    onChange={handleChange} required rows={3}
                    placeholder="Street, building, apartment number..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700
                               bg-gray-50 dark:bg-gray-800 dark:text-white text-sm focus:outline-none
                               focus:ring-2 focus:ring-primary resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    City / Town
                  </label>
                  <input type="text" name="delivery_city" value={form.delivery_city}
                    onChange={handleChange} required placeholder="e.g. Nairobi"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700
                               bg-gray-50 dark:bg-gray-800 dark:text-white text-sm focus:outline-none
                               focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input type="tel" name="delivery_phone" value={form.delivery_phone}
                      onChange={handleChange} required placeholder="0712345678"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700
                                 bg-gray-50 dark:bg-gray-800 dark:text-white text-sm focus:outline-none
                                 focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Order Notes (optional)
                  </label>
                  <input type="text" name="notes" value={form.notes}
                    onChange={handleChange} placeholder="Any special instructions..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700
                               bg-gray-50 dark:bg-gray-800 dark:text-white text-sm focus:outline-none
                               focus:ring-2 focus:ring-primary" />
                </div>
                <button
                  onClick={() => {
                    if (!form.delivery_address || !form.delivery_city || !form.delivery_phone) {
                      toast.error('Please fill in all delivery details');
                      return;
                    }
                    setStep(1);
                  }}
                  className="w-full py-3 bg-primary text-white font-semibold rounded-xl
                             hover:bg-blue-600 transition">
                  Continue to Payment
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 1 — Payment */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
                         dark:border-gray-800 p-6">
              <h2 className="font-heading font-bold text-lg dark:text-white mb-5 flex items-center gap-2">
                <FiCreditCard className="text-primary" /> Payment Method
              </h2>

              <div className="space-y-3 mb-6">
                {[
                  { value: 'mpesa',           label: 'M-Pesa', desc: 'Pay via STK push to your phone' },
                  { value: 'cash_on_delivery', label: 'Cash on Delivery', desc: 'Pay when your order arrives' },
                ].map((method) => (
                  <label key={method.value}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition
                      ${form.payment_method === method.value
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
                    <input type="radio" name="payment_method" value={method.value}
                      checked={form.payment_method === method.value}
                      onChange={handleChange} className="text-primary" />
                    <div>
                      <p className="font-semibold text-sm dark:text-white">{method.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{method.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(0)}
                  className="px-6 py-3 border border-gray-200 dark:border-gray-700 text-gray-700
                             dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50
                             dark:hover:bg-gray-800 transition">
                  Back
                </button>
                <button onClick={handlePlaceOrder} disabled={placing}
                  className="flex-1 py-3 bg-primary text-white font-semibold rounded-xl
                             hover:bg-blue-600 transition disabled:opacity-60">
                  {placing ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2 — Confirmation */}
          {step === 2 && order && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
                         dark:border-gray-800 p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheck size={32} className="text-green-600" />
              </div>
              <h2 className="font-heading text-xl font-bold dark:text-white mb-2">Order Placed!</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Order number</p>
              <p className="font-mono font-bold text-primary text-lg mb-6">{order.order_number}</p>

              {/* M-Pesa payment */}
              {form.payment_method === 'mpesa' && !stkSent && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6 text-left">
                  <p className="font-semibold dark:text-white text-sm mb-3">
                    Pay KES {Number(order.total).toLocaleString()} via M-Pesa
                  </p>
                  <div className="relative mb-3">
                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input type="tel" value={mpesaPhone}
                      onChange={(e) => setMpesaPhone(e.target.value)}
                      placeholder="M-Pesa phone e.g. 0712345678"
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700
                                 bg-white dark:bg-gray-900 dark:text-white text-sm focus:outline-none
                                 focus:ring-2 focus:ring-primary" />
                  </div>
                  <button onClick={handleMpesaPay} disabled={placing}
                    className="w-full py-2.5 bg-green-600 text-white font-semibold rounded-xl
                               hover:bg-green-700 transition disabled:opacity-60 text-sm">
                    {placing ? 'Sending...' : 'Send M-Pesa STK Push'}
                  </button>
                </div>
              )}

              {stkSent && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200
                                dark:border-green-800 rounded-xl p-4 mb-6 text-left">
                  <p className="text-green-700 dark:text-green-400 text-sm font-medium">
                    M-Pesa prompt sent to {mpesaPhone}. Enter your PIN to complete payment.
                  </p>
                </div>
              )}

              {form.payment_method === 'cash_on_delivery' && (
                <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 mb-6 text-left">
                  <p className="text-accent text-sm font-medium">
                    Pay KES {Number(order.total).toLocaleString()} cash when your order arrives.
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Link to={`/orders/${order.order_number}`}
                  className="flex-1 py-3 border border-primary text-primary font-semibold
                             rounded-xl hover:bg-primary/5 transition text-sm text-center">
                  Track Order
                </Link>
                <Link to="/shop"
                  className="flex-1 py-3 bg-primary text-white font-semibold rounded-xl
                             hover:bg-blue-600 transition text-sm text-center">
                  Continue Shopping
                </Link>
              </div>
            </motion.div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
                          dark:border-gray-800 p-5 sticky top-24">
            <h3 className="font-heading font-bold dark:text-white mb-4">
              {step === 2 && order ? 'Order Summary' : `${items.length} Items`}
            </h3>

            {step < 2 && (
              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                      {item.product.primary_image
                        ? <img src={item.product.primary_image} alt={item.product.name}
                               className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">img</div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium dark:text-white truncate">{item.product.name}</p>
                      <p className="text-xs text-gray-500">x{item.quantity}</p>
                      <p className="text-xs font-bold text-primary">
                        KES {Number(item.subtotal).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2 text-sm border-t border-gray-100 dark:border-gray-800 pt-3">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span>KES {Number(step === 2 && order ? order.subtotal : subtotal).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Delivery</span>
                <span>KES {deliveryFee}</span>
              </div>
              <div className="flex justify-between font-bold dark:text-white text-base pt-2
                              border-t border-gray-100 dark:border-gray-800">
                <span>Total</span>
                <span className="text-primary">
                  KES {Number(step === 2 && order ? order.total : total).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
