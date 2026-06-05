import React, { useState, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { authAPI } from '../../api/endpoints';
import useAuthStore from '../../store/authStore';
import Logo from '../../components/common/Logo';

const VerifyOTPPage = () => {
  const navigate    = useNavigate();
  const location    = useLocation();
  const { setAuth } = useAuthStore();
  const email       = location.state?.email || '';

  const [otp,      setOtp]      = useState(['', '', '', '', '', '']);
  const [loading,  setLoading]  = useState(false);
  const [resending,setResending]= useState(false);
  const inputs                  = useRef([]);

  const handleChange = (val, idx) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx]  = val;
    setOtp(next);
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) { toast.error('Enter the full 6-digit OTP'); return; }
    setLoading(true);
    try {
      const res = await authAPI.verifyOTP({ email, otp_code: code });
      setAuth(res.data.user || { email }, res.data.access, res.data.refresh);
      toast.success('Account verified successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid or expired OTP');
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const res = await authAPI.requestOTP({ email });
      toast.success(`New OTP sent! Code: ${res.data.otp}`, { duration: 15000 });
    } catch {
      toast.error('Failed to resend OTP');
    } finally {
      setResending(false);
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
                        border-gray-100 dark:border-gray-800 p-8 text-center">

          <div className="flex justify-center mb-6">
            <Logo size="md" />
          </div>

          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center
                          justify-center mx-auto mb-4">
            <FiMail size={28} className="text-primary" />
          </div>

          <h1 className="font-heading text-2xl font-bold dark:text-white mb-2">
            Check your email
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
            We sent a 6-digit verification code to
          </p>
          <p className="font-semibold text-primary mb-8 text-sm">{email}</p>

          <form onSubmit={handleSubmit}>
            <div className="flex gap-2 justify-center mb-8" onPaste={handlePaste}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  className="w-11 h-12 text-center text-xl font-bold rounded-xl border-2
                             border-gray-200 dark:border-gray-700 bg-gray-50
                             dark:bg-gray-800 dark:text-white focus:outline-none
                             focus:border-primary transition"
                />
              ))}
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-primary text-white font-semibold rounded-xl
                         hover:bg-blue-600 transition disabled:opacity-60">
              {loading ? 'Verifying...' : 'Verify Account'}
            </button>
          </form>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
            Didn't receive it?{' '}
            <button onClick={handleResend} disabled={resending}
              className="text-primary font-medium hover:underline disabled:opacity-60">
              {resending ? 'Sending...' : 'Resend OTP'}
            </button>
          </p>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Wrong email?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Go back
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyOTPPage;
