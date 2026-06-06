import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiUser, FiMail, FiPhone, FiLock, FiSave,
  FiCamera, FiShield
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { authAPI } from '../../api/endpoints';
import useAuthStore from '../../store/authStore';

const ProfilePage = () => {
  const { user, updateUser } = useAuthStore();
  const [tab, setTab]        = useState('profile');
  const [saving, setSaving]  = useState(false);

  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    username:  user?.username  || '',
    phone:     user?.phone     || '',
  });

  const [pwForm, setPwForm] = useState({
    old_password:  '',
    new_password:  '',
    new_password2: '',
  });

  const handleChange   = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handlePwChange = (e) => setPwForm({ ...pwForm, [e.target.name]: e.target.value });

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authAPI.updateProfile(form);
      updateUser(res.data);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.new_password2) {
      toast.error('New passwords do not match');
      return;
    }
    setSaving(true);
    try {
      await authAPI.changePassword(pwForm);
      toast.success('Password changed successfully');
      setPwForm({ old_password: '', new_password: '', new_password2: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile',  label: 'Profile',  icon: FiUser },
    { id: 'security', label: 'Security', icon: FiShield },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-heading text-2xl font-bold dark:text-white mb-6">My Account</h1>

      {/* Avatar */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
                      dark:border-gray-800 p-6 mb-4 flex items-center gap-5">
        <div className="relative">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
            {user?.avatar
              ? <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
              : <span className="text-white font-heading font-bold text-3xl">
                  {user?.username?.[0]?.toUpperCase()}
                </span>
            }
          </div>
          <button className="absolute bottom-0 right-0 w-7 h-7 bg-primary rounded-full
                             flex items-center justify-center border-2 border-white dark:border-gray-900">
            <FiCamera size={12} className="text-white" />
          </button>
        </div>
        <div>
          <h2 className="font-heading font-bold text-lg dark:text-white">
            {user?.full_name || user?.username}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{user?.email}</p>
          <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-medium capitalize
            ${user?.role === 'vendor' ? 'bg-accent/20 text-accent'
              : user?.role === 'admin' ? 'bg-danger/20 text-danger'
              : 'bg-primary/20 text-primary'}`}>
            {user?.role}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-4">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm
                        font-medium transition ${tab === t.id
                          ? 'bg-white dark:bg-gray-900 text-primary shadow-sm'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === 'profile' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
                     dark:border-gray-800 p-6">
          <form onSubmit={handleProfileSave} className="space-y-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="text" name="full_name" value={form.full_name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700
                             bg-gray-50 dark:bg-gray-800 dark:text-white text-sm focus:outline-none
                             focus:ring-2 focus:ring-primary" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                <input type="text" name="username" value={form.username}
                  onChange={handleChange}
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700
                             bg-gray-50 dark:bg-gray-800 dark:text-white text-sm focus:outline-none
                             focus:ring-2 focus:ring-primary" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="email" value={user?.email} disabled
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700
                             bg-gray-100 dark:bg-gray-700 dark:text-gray-400 text-sm cursor-not-allowed" />
              </div>
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="tel" name="phone" value={form.phone}
                  onChange={handleChange} placeholder="0712345678"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700
                             bg-gray-50 dark:bg-gray-800 dark:text-white text-sm focus:outline-none
                             focus:ring-2 focus:ring-primary" />
              </div>
            </div>

            {/* Referral code */}
            {user?.referral_code && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Your Referral Code</p>
                <p className="font-mono font-bold text-primary text-lg">{user.referral_code}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Share this code to earn rewards when friends sign up
                </p>
              </div>
            )}

            <button type="submit" disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white
                         font-semibold rounded-xl hover:bg-blue-600 transition disabled:opacity-60">
              <FiSave size={16} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </motion.div>
      )}

      {/* Security tab */}
      {tab === 'security' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
                     dark:border-gray-800 p-6">
          <form onSubmit={handlePasswordSave} className="space-y-4">
            <h3 className="font-heading font-semibold dark:text-white mb-2">Change Password</h3>

            {[
              { name: 'old_password',  label: 'Current Password',  ph: '••••••••' },
              { name: 'new_password',  label: 'New Password',       ph: 'Min 8 characters' },
              { name: 'new_password2', label: 'Confirm New Password', ph: '••••••••' },
            ].map((f) => (
              <div key={f.name}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {f.label}
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input type="password" name={f.name}
                    value={pwForm[f.name]} onChange={handlePwChange}
                    placeholder={f.ph} required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700
                               bg-gray-50 dark:bg-gray-800 dark:text-white text-sm focus:outline-none
                               focus:ring-2 focus:ring-primary" />
                </div>
              </div>
            ))}

            <button type="submit" disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white
                         font-semibold rounded-xl hover:bg-blue-600 transition disabled:opacity-60">
              <FiLock size={16} />
              {saving ? 'Saving...' : 'Update Password'}
            </button>
          </form>
        </motion.div>
      )}
    </div>
  );
};

export default ProfilePage;
