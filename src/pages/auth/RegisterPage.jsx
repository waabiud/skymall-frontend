import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiMail, FiLock, FiUser, FiPhone,
  FiEye, FiEyeOff, FiShoppingBag, FiTruck, FiShield
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { authAPI } from '../../api/endpoints';
import GoogleLoginButton from '../../components/common/GoogleLoginButton';
import FacebookLoginButton from '../../components/common/FacebookLoginButton';

const RegisterPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '', username: '', full_name: '',
    phone: '', password: '', password2: '', role: 'customer',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.password2) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.register(form);
      toast.success(`OTP Code: ${res.data.otp}`, { duration: 15000 });
      navigate('/verify-otp', { state: { email: form.email } });
    } catch (err) {
      const errors = err.response?.data;
      if (typeof errors === 'object') {
        Object.values(errors).forEach((msg) =>
          toast.error(Array.isArray(msg) ? msg[0] : msg)
        );
      } else {
        toast.error('Registration failed. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full py-3.5 rounded-xl border-2 border-gray-200
    dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white text-sm
    focus:outline-none focus:border-primary dark:focus:border-primary transition`;

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-primary
                      via-pink-500 to-pink-400 relative overflow-hidden
                      flex-col items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />

        <div className="relative z-10 text-white text-center">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center
                          justify-center mx-auto mb-6 shadow-xl">
            <span className="text-primary font-black text-4xl">S</span>
          </div>
          <h1 className="font-heading text-3xl font-black mb-3">
            Join SkyMall
          </h1>
          <p className="text-pink-100 text-sm mb-10 leading-relaxed">
            Create your account and start shopping or selling on Kenya's
            smartest marketplace.
          </p>

          {/* Benefits */}
          <div className="space-y-4 text-left">
            {[
              { icon: FiShoppingBag, title: 'Shop Thousands of Products',
                desc: 'From electronics to fashion' },
              { icon: FiTruck,       title: 'Fast Delivery',
                desc: 'Same day in Nairobi' },
              { icon: FiShield,      title: 'Secure Payments',
                desc: 'M-Pesa protected' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center
                                justify-center flex-shrink-0 mt-0.5">
                  <Icon size={16} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{title}</p>
                  <p className="text-pink-200 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-10
                      overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md py-4">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center
                            justify-center">
              <span className="text-white font-black text-lg">S</span>
            </div>
            <span className="font-heading font-bold text-2xl dark:text-white">
              Sky<span className="text-primary">Mall</span>
            </span>
          </div>

          <h1 className="font-heading text-3xl font-bold dark:text-white mb-1">
            Create account
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            Join thousands of shoppers and vendors on SkyMall.
          </p>

          {/* Role selector */}
          <div className="flex rounded-xl overflow-hidden border-2 border-gray-200
                          dark:border-gray-700 mb-6">
            {[
              { value: 'customer', label: 'I want to Shop',   emoji: '🛍️' },
              { value: 'vendor',   label: 'I want to Sell',   emoji: '🏪' },
            ].map((r) => (
              <button key={r.value} type="button"
                onClick={() => setForm({ ...form, role: r.value })}
                className={`flex-1 py-3 text-sm font-semibold transition
                            flex items-center justify-center gap-2
                  ${form.role === r.value
                    ? 'bg-primary text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}>
                <span>{r.emoji}</span>
                {r.label}
              </button>
            ))}
          </div>

          {/* Social buttons */}
          <div className="space-y-3 mb-6">
            <GoogleLoginButton label="Sign up with Google" />
            <FacebookLoginButton label="Sign up with Facebook" />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            <span className="text-xs text-gray-400 font-medium uppercase tracking-widest">
              or fill in details
            </span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2
                                   text-gray-400" size={16} />
                <input type="text" name="full_name" value={form.full_name}
                  onChange={handleChange} required placeholder="Full name"
                  className={`${inputClass} pl-10 pr-3`} />
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2
                                 text-gray-400 text-sm font-semibold">@</span>
                <input type="text" name="username" value={form.username}
                  onChange={handleChange} required placeholder="Username"
                  className={`${inputClass} pl-9 pr-3`} />
              </div>
            </div>

            {/* Email */}
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2
                                 text-gray-400" size={18} />
              <input type="email" name="email" value={form.email}
                onChange={handleChange} required placeholder="Email address"
                className={`${inputClass} pl-11 pr-4`} />
            </div>

            {/* Phone */}
            <div className="relative">
              <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2
                                  text-gray-400" size={18} />
              <input type="tel" name="phone" value={form.phone}
                onChange={handleChange} placeholder="Phone e.g. 0712345678"
                className={`${inputClass} pl-11 pr-4`} />
            </div>

            {/* Password row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2
                                   text-gray-400" size={16} />
                <input type={showPass ? 'text' : 'password'}
                  name="password" value={form.password}
                  onChange={handleChange} required placeholder="Password"
                  className={`${inputClass} pl-10 pr-10`} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-gray-400 hover:text-gray-600">
                  {showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2
                                   text-gray-400" size={16} />
                <input type={showPass ? 'text' : 'password'}
                  name="password2" value={form.password2}
                  onChange={handleChange} required placeholder="Confirm"
                  className={`${inputClass} pl-10 pr-3`} />
              </div>
            </div>

            {/* Password strength indicator */}
            {form.password && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1,2,3,4].map((i) => (
                    <div key={i}
                      className={`flex-1 h-1 rounded-full transition-all ${
                        form.password.length >= i * 2
                          ? i <= 1 ? 'bg-danger'
                            : i <= 2 ? 'bg-yellow-400'
                            : i <= 3 ? 'bg-blue-400'
                            : 'bg-green-500'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`} />
                  ))}
                </div>
                <p className="text-xs text-gray-400">
                  {form.password.length < 4 ? 'Too short'
                    : form.password.length < 6 ? 'Weak'
                    : form.password.length < 8 ? 'Fair'
                    : 'Strong password'}
                </p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-primary text-white font-bold rounded-xl
                         hover:bg-primary-dark transition disabled:opacity-60
                         disabled:cursor-not-allowed shadow-lg shadow-primary/30">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white
                                  rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : `Create ${form.role === 'vendor' ? 'Vendor' : ''} Account`}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-4">
            By signing up you agree to our{' '}
            <Link to="/terms" className="text-primary hover:underline">Terms</Link>
            {' '}and{' '}
            <Link to="/privacy-policy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
