import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { authAPI } from '../../api/endpoints';
import Logo from '../../components/common/Logo';
import GoogleLoginButton from '../../components/common/GoogleLoginButton';

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

  const inputClass = `w-full py-3 rounded-xl border border-gray-200 dark:border-gray-700
    bg-gray-50 dark:bg-gray-800 dark:text-white text-sm focus:outline-none
    focus:ring-2 focus:ring-primary transition`;

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

          <div className="flex flex-col items-center mb-6">
            <Logo size="md" />
            <h1 className="font-heading text-2xl font-bold dark:text-white mt-4">
              Create account
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Join thousands of shoppers on SkyMall
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Role toggle */}
            <div className="flex rounded-xl overflow-hidden border border-gray-200
                            dark:border-gray-700">
              {[
                { value: 'customer', label: 'Shop on SkyMall' },
                { value: 'vendor',   label: 'Sell on SkyMall' },
              ].map((r) => (
                <button key={r.value} type="button"
                  onClick={() => setForm({ ...form, role: r.value })}
                  className={`flex-1 py-2.5 text-sm font-medium transition
                    ${form.role === r.value
                      ? 'bg-primary text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}>
                  {r.label}
                </button>
              ))}
            </div>

            {/* Google signup */}
            <GoogleLoginButton label="Sign up with Google" />

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              <span className="text-xs text-gray-400 font-medium">OR</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            </div>

            {/* Full name */}
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18} />
              <input type="text" name="full_name" value={form.full_name}
                onChange={handleChange} required placeholder="Full name"
                className={`${inputClass} pl-10 pr-4`} />
            </div>

            {/* Username */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400
                               text-sm font-medium">@</span>
              <input type="text" name="username" value={form.username}
                onChange={handleChange} required placeholder="Username"
                className={`${inputClass} pl-8 pr-4`} />
            </div>

            {/* Email */}
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18} />
              <input type="email" name="email" value={form.email}
                onChange={handleChange} required placeholder="Email address"
                className={`${inputClass} pl-10 pr-4`} />
            </div>

            {/* Phone */}
            <div className="relative">
              <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18} />
              <input type="tel" name="phone" value={form.phone}
                onChange={handleChange} placeholder="Phone e.g. 0712345678"
                className={`${inputClass} pl-10 pr-4`} />
            </div>

            {/* Password */}
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18} />
              <input type={showPass ? 'text' : 'password'}
                name="password" value={form.password}
                onChange={handleChange} required placeholder="Password (min 8 chars)"
                className={`${inputClass} pl-10 pr-10`} />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400
                           hover:text-gray-600 transition">
                {showPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>

            {/* Confirm password */}
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18} />
              <input type={showPass ? 'text' : 'password'}
                name="password2" value={form.password2}
                onChange={handleChange} required placeholder="Confirm password"
                className={`${inputClass} pl-10 pr-4`} />
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-primary text-white font-semibold rounded-xl
                         hover:bg-blue-600 transition disabled:opacity-60
                         disabled:cursor-not-allowed">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
