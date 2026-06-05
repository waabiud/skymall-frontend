import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { authAPI } from '../../api/endpoints';
import useAuthStore from '../../store/authStore';
import Logo from '../../components/common/Logo';

const LoginPage = () => {
  const navigate    = useNavigate();
  const location    = useLocation();
  const { setAuth } = useAuthStore();
  const from        = location.state?.from?.pathname || '/';

  const [form, setForm]         = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50
                    dark:bg-dark px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md">

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border
                        border-gray-100 dark:border-gray-800 p-8">

          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <Logo size="md" />
            <h1 className="font-heading text-2xl font-bold dark:text-white mt-4">
              Welcome back
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Sign in to your SkyMall account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700
                                dark:text-gray-300 mb-1">
                Email address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18} />
                <input type="email" name="email" value={form.email}
                  onChange={handleChange} required placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200
                             dark:border-gray-700 bg-gray-50 dark:bg-gray-800
                             dark:text-white text-sm focus:outline-none
                             focus:ring-2 focus:ring-primary transition" />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <Link to="/forgot-password"
                  className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18} />
                <input type={showPass ? 'text' : 'password'}
                  name="password" value={form.password}
                  onChange={handleChange} required placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200
                             dark:border-gray-700 bg-gray-50 dark:bg-gray-800
                             dark:text-white text-sm focus:outline-none
                             focus:ring-2 focus:ring-primary transition" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400
                             hover:text-gray-600 transition">
                  {showPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-primary text-white font-semibold rounded-xl
                         hover:bg-blue-600 transition disabled:opacity-60
                         disabled:cursor-not-allowed">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Sign up free
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
