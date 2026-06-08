import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiMapPin, FiPhone, FiCheck, FiArrowLeft,
  FiLoader, FiSmartphone
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { cartAPI, ordersAPI, paymentsAPI } from '../../api/endpoints';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';

const steps = ['Delivery', 'Payment', 'Confirmed'];

const CheckoutPage = () => {
  const navigate               = useNavigate();
  const { user }               = useAuthStore();
  const { cart, setCart, clearCart } = useCartStore();

  const [step,      setStep]      = useState(0);
  const [loading,   setLoading]   = useState(true);
  const [placing,   setPlacing]   = useState(false);
  const [order,     setOrder]     = useState(null);
  const [stkSent,   setStkSent]   = useState(false);
  const [checking,  setChecking]  = useState(false);
  
  
  const pollRef                   = useRef(null);

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
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  // eslint-disable-next-line
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Step 1 — place order in pending/unpaid state
  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      const res = await ordersAPI.checkout(form);
      setOrder(res.data);
      setStep(1);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create order');
    } finally {
      setPlacing(false);
    }
  };

  // Step 2 — send STK push
  const handleMpesaPay = async () => {
    if (!order) return;
    if (!mpesaPhone) { toast.error('Enter your M-Pesa phone number'); return; }
    setPlacing(true);
    try {
      const res = await paymentsAPI.stkPush({
        order_number: order.order_number,
        phone_number: mpesaPhone,
      });
      
      setStkSent(true);
      toast.success('M-Pesa prompt sent! Enter your PIN on your phone.', { duration: 8000 });
      startPolling(res.data.checkout_request_id, order.order_number);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Payment initiation failed. Try again.');
    } finally {
      setPlacing(false);
    }
  };

  // Poll payment status every 5 seconds for up to 2 minutes
  const startPolling = (cid, orderNumber) => {
    setChecking(true);
    let attempts = 0;
    pollRef.current = setInterval(async () => {
      attempts++;
      try {
        const res = await paymentsAPI.checkStatus(cid);
        if (res.data.status === 'success') {
  clearInterval(pollRef.current);
  setChecking(false);
  clearCart();
  setStep(2);
  toast.success('Payment confirmed! Your order is placed.', {
    duration: 6000
  });
  } else if (res.data.status === 'failed') {
          clearInterval(pollRef.current);
          setChecking(false);
          toast.error('Payment failed. Please try again.');
          setStkSent(false);
        }
      } catch {}
      if (attempts >= 24) { // 2 minutes
        clearInterval(pollRef.current);
        setChecking(false);
        toast.error('Payment timeout. If you paid, your order will be confirmed shortly.');
      }
    }, 5000);
  };

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6 w-48" />
      <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
    </div>
  );

  const items       = cart?.items || [];
  const subtotal    = cart?.total || 0;
  const deliveryFee = 200;
  const total       = Number(subtotal) + deliveryFee;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/cart"
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <FiArrowLeft size={20} className="dark:text-white" />
        </Link>
        <h1 className="font-heading text-2xl font-bold dark:text-white">Checkout</h1>
      </div>

      {/* Steps */}
      <div className="flex items-center mb-8">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center
                              text-sm font-bold transition
                ${i < step  ? 'bg-green-500 text-white'
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
              <h2 className="font-heading font-bold text-lg dark:text-white mb-5
                             flex items-center gap-2">
                <FiMapPin className="text-primary" /> Delivery Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700
                                    dark:text-gray-300 mb-1">
                    Delivery Address <span className="text-danger">*</span>
                  </label>
                  <textarea name="delivery_address" value={form.delivery_address}
                    onChange={handleChange} required rows={3}
                    placeholder="Street, building, apartment number..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200
                               dark:border-gray-700 bg-gray-50 dark:bg-gray-800
                               dark:text-white text-sm focus:outline-none
                               focus:ring-2 focus:ring-primary resize-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700
                                    dark:text-gray-300 mb-1">
                    City / Town <span className="text-danger">*</span>
                  </label>
                  <input type="text" name="delivery_city" value={form.delivery_city}
                    onChange={handleChange} required placeholder="e.g. Nairobi"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200
                               dark:border-gray-700 bg-gray-50 dark:bg-gray-800
                               dark:text-white text-sm focus:outline-none
                               focus:ring-2 focus:ring-primary" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700
                                    dark:text-gray-300 mb-1">
                    Phone Number <span className="text-danger">*</span>
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2
                                        text-gray-400" size={16} />
                    <input type="tel" name="delivery_phone" value={form.delivery_phone}
                      onChange={handleChange} required placeholder="0712345678"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200
                                 dark:border-gray-700 bg-gray-50 dark:bg-gray-800
                                 dark:text-white text-sm focus:outline-none
                                 focus:ring-2 focus:ring-primary" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700
                                    dark:text-gray-300 mb-1">
                    Order Notes (optional)
                  </label>
                  <input type="text" name="notes" value={form.notes}
                    onChange={handleChange}
                    placeholder="Any special instructions..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200
                               dark:border-gray-700 bg-gray-50 dark:bg-gray-800
                               dark:text-white text-sm focus:outline-none
                               focus:ring-2 focus:ring-primary" />
                </div>

                <button
                  onClick={() => {
                    if (!form.delivery_address || !form.delivery_city || !form.delivery_phone) {
                      toast.error('Please fill in all required fields');
                      return;
                    }
                    handlePlaceOrder();
                  }}
                  disabled={placing}
                  className="w-full py-3 bg-primary text-white font-semibold rounded-xl
                             hover:bg-blue-600 transition disabled:opacity-60
                             disabled:cursor-not-allowed">
                  {placing ? 'Preparing order...' : 'Continue to Payment'}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 1 — M-Pesa Payment */}
          {step === 1 && order && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
                         dark:border-gray-800 p-6">
              <h2 className="font-heading font-bold text-lg dark:text-white mb-2
                             flex items-center gap-2">
                <FiSmartphone className="text-green-600" /> Pay with M-Pesa
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                Enter your M-Pesa number to receive a payment prompt on your phone.
                Complete the payment to confirm your order.
              </p>

              {!stkSent ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700
                                      dark:text-gray-300 mb-1">
                      M-Pesa Phone Number <span className="text-danger">*</span>
                    </label>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2
                                          text-gray-400" size={16} />
                      <input type="tel" value={mpesaPhone}
                        onChange={(e) => setMpesaPhone(e.target.value)}
                        placeholder="0712345678"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200
                                   dark:border-gray-700 bg-gray-50 dark:bg-gray-800
                                   dark:text-white text-sm focus:outline-none
                                   focus:ring-2 focus:ring-primary" />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Format: 07XXXXXXXX or 01XXXXXXXX
                    </p>
                  </div>

                  {/* Amount to pay */}
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200
                                  dark:border-green-800 rounded-xl p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Amount to pay</p>
                    <p className="font-heading text-2xl font-bold text-green-700
                                  dark:text-green-400">
                      KES {Number(order.total).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Order: {order.order_number}
                    </p>
                  </div>

                  <button onClick={handleMpesaPay} disabled={placing}
                    className="w-full flex items-center justify-center gap-2 py-3
                               bg-green-600 text-white font-semibold rounded-xl
                               hover:bg-green-700 transition disabled:opacity-60">
                    {placing
                      ? <><FiLoader size={18} className="animate-spin" /> Sending...</>
                      : <><FiSmartphone size={18} /> Send M-Pesa Prompt</>
                    }
                  </button>

                  <button onClick={() => setStep(0)}
                    className="w-full py-2.5 border border-gray-200 dark:border-gray-700
                               text-gray-600 dark:text-gray-400 rounded-xl text-sm
                               hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                    Back to Delivery
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Waiting for payment */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200
                                  dark:border-blue-800 rounded-xl p-5 text-center">
                    {checking ? (
                      <>
                        <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/40 rounded-full
                                        flex items-center justify-center mx-auto mb-3">
                          <FiLoader size={28} className="text-primary animate-spin" />
                        </div>
                        <p className="font-semibold dark:text-white mb-1">
                          Waiting for payment...
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Check your phone <span className="font-bold">{mpesaPhone}</span> and
                          enter your M-Pesa PIN to complete payment
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center
                                        justify-center mx-auto mb-3">
                          <FiCheck size={28} className="text-green-600" />
                        </div>
                        <p className="font-semibold dark:text-white">Prompt sent!</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Enter your M-Pesa PIN to complete payment
                        </p>
                      </>
                    )}
                  </div>

                  {/* Steps guide */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400
                                  uppercase tracking-wide mb-3">
                      How to complete payment
                    </p>
                    {[
                      'Check your phone for M-Pesa prompt',
                      'Enter your M-Pesa PIN',
                      'Wait for confirmation SMS',
                      'Your order will be confirmed automatically',
                    ].map((step, i) => (
                      <div key={i} className="flex items-start gap-3 mb-2">
                        <div className="w-5 h-5 bg-primary rounded-full flex items-center
                                        justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs font-bold">{i + 1}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{step}</p>
                      </div>
                    ))}
                  </div>

                  {/* Resend option */}
                  {!checking && (
                    <button onClick={handleMpesaPay} disabled={placing}
                      className="w-full py-2.5 border border-green-500 text-green-600
                                 rounded-xl text-sm font-medium hover:bg-green-50
                                 dark:hover:bg-green-900/20 transition">
                      Retry
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Step 2 — Confirmed */}
          {step === 2 && order && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
                         dark:border-gray-800 p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center
                              justify-center mx-auto mb-4">
                <FiCheck size={36} className="text-green-600" />
              </div>
              <h2 className="font-heading text-2xl font-bold dark:text-white mb-2">
                Order Confirmed!
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                Payment received. Your order number is
              </p>
              <p className="font-mono font-bold text-primary text-xl mb-6">
                {order.order_number}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                You will receive an SMS confirmation shortly.
                Your items will be delivered to {form.delivery_address}, {form.delivery_city}.
              </p>
              <div className="flex gap-3">
                <Link to={`/orders/${order.order_number}`}
                  className="flex-1 py-3 border-2 border-primary text-primary font-semibold
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
              Order Summary
            </h3>

            {step < 2 && (
              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg
                                    overflow-hidden flex-shrink-0">
                      {item.product.primary_image
                        ? <img src={item.product.primary_image} alt={item.product.name}
                               className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center
                                          text-gray-400 text-xs">img</div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium dark:text-white truncate">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-gray-500">x{item.quantity}</p>
                      <p className="text-xs font-bold text-primary">
                        KES {Number(item.subtotal).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2 text-sm border-t border-gray-100
                            dark:border-gray-800 pt-3">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span>KES {Number(step === 2 && order
                  ? order.subtotal : subtotal).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Delivery</span>
                <span>KES 200</span>
              </div>
              <div className="flex justify-between font-bold dark:text-white text-base
                              pt-2 border-t border-gray-100 dark:border-gray-800">
                <span>Total</span>
                <span className="text-primary">
                  KES {Number(step === 2 && order
                    ? order.total : total).toLocaleString()}
                </span>
              </div>
            </div>

            {step === 1 && order && (
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Order will be confirmed after M-Pesa payment is received
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
