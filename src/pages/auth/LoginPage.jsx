import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiShoppingBag } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { authAPI } from '../../api/endpoints';
import useAuthStore from '../../store/authStore';
import GoogleLoginButton from '../../components/common/GoogleLoginButton';
import FacebookLoginButton from '../../components/common/FacebookLoginButton';

const LoginPage = () => {
  const navigate    = useNavigate();
  const location    = useLocation();
  const { setAuth } = useAuthStore();
  const from        = location.state?.from?.pathname || '/';

  const [form, setForm]         = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      setAuth(res.data.user, res.data.access, res.data.refresh);
      toast.success(`Welcome back, ${res.data.user.full_name || res.data.user.username}`);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">

      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary
                      via-pink-500 to-pink-400 relative overflow-hidden
                      flex-col items-center justify-center p-12">

        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />

        {/* Floating cards */}
        <motion.div
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-20 right-16 bg-white/20 backdrop-blur-sm
                     rounded-2xl p-4 w-48">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-white/30 rounded-full" />
            <div>
              <div className="h-2 bg-white/50 rounded w-20 mb-1" />
              <div className="h-2 bg-white/30 rounded w-14" />
            </div>
          </div>
          <div className="h-16 bg-white/20 rounded-xl" />
          <div className="flex justify-between mt-2">
            <div className="h-2 bg-white/40 rounded w-16" />
            <div className="h-2 bg-yellow-300/70 rounded w-10" />
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [10, -10, 10] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-32 left-10 bg-white/20 backdrop-blur-sm
                     rounded-2xl p-4 w-44">
          <div className="h-2 bg-white/50 rounded w-24 mb-3" />
          <div className="flex gap-2 mb-2">
            {[1,2,3].map((i) => (
              <div key={i} className="flex-1 h-12 bg-white/20 rounded-lg" />
            ))}
          </div>
          <div className="h-2 bg-yellow-300/60 rounded w-20" />
        </motion.div>

        {/* Main content */}
        <div className="relative z-10 text-center text-white">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center
                          justify-center mx-auto mb-6 shadow-xl">
            <span className="text-primary font-black text-4xl">S</span>
          </div>
          <h1 className="font-heading text-4xl font-black mb-4">
            Sky<span className="text-yellow-300">Mall</span>
          </h1>
          <p className="text-xl font-medium text-pink-100 mb-2">
            Smart Shopping Starts Here
          </p>
          <p className="text-pink-200 text-sm max-w-xs mx-auto leading-relaxed">
            Kenya's premier marketplace with thousands of products from verified vendors.
          </p>

          {/* Stats */}
          <div className="flex gap-8 justify-center mt-10">
            {[
              { value: '10K+', label: 'Products' },
              { value: '500+', label: 'Vendors' },
              { value: '50K+', label: 'Customers' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-heading font-black text-2xl text-yellow-300">
                  {stat.value}
                </p>
                <p className="text-pink-200 text-xs">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center
                            justify-center">
              <span className="text-white font-black text-lg">S</span>
            </div>
            <span className="font-heading font-bold text-2xl dark:text-white">
              Sky<span className="text-primary">Mall</span>
            </span>
          </div>

          <h1 className="font-heading text-3xl font-bold dark:text-white mb-1">
            Sign in
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
            Welcome back! Please enter your details.
          </p>

          {/* Social buttons */}
          <div className="space-y-3 mb-6">
            <GoogleLoginButton label="Continue with Google" />
            <FacebookLoginButton label="Continue with Facebook" />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            <span className="text-xs text-gray-400 font-medium uppercase tracking-widest">
              or
            </span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700
                                dark:text-gray-300 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2
                                   text-gray-400" size={18} />
                <input type="email" name="email" value={form.email}
                  onChange={handleChange} required
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2
                             border-gray-200 dark:border-gray-700 bg-white
                             dark:bg-gray-800 dark:text-white text-sm
                             focus:outline-none focus:border-primary
                             dark:focus:border-primary transition" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-semibold text-gray-700
                                  dark:text-gray-300">
                  Password
                </label>
                <Link to="/forgot-password"
                  className="text-xs text-primary hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2
                                   text-gray-400" size={18} />
                <input type={showPass ? 'text' : 'password'}
                  name="password" value={form.password}
                  onChange={handleChange} required placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3.5 rounded-xl border-2
                             border-gray-200 dark:border-gray-700 bg-white
                             dark:bg-gray-800 dark:text-white text-sm
                             focus:outline-none focus:border-primary
                             dark:focus:border-primary transition" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2
                             text-gray-400 hover:text-gray-600 transition">
                  {showPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-primary text-white font-bold rounded-xl
                         hover:bg-primary-dark transition disabled:opacity-60
                         disabled:cursor-not-allowed text-sm mt-2 shadow-lg
                         shadow-primary/30">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white
                                  rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register"
              className="text-primary font-bold hover:underline">
              Create account
            </Link>
          </p>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 mt-8 pt-6
                          border-t border-gray-100 dark:border-gray-800">
            {[
              { icon: FiShoppingBag, text: 'Secure Shopping' },
              { icon: FiLock,        text: 'Data Protected' },
            ].map(({ icon: Icon, text }) => (
              <div key={text}
                className="flex items-center gap-1.5 text-xs text-gray-400">
                <Icon size={13} className="text-primary" />
                {text}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
