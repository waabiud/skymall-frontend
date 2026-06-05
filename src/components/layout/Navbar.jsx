import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiShoppingCart, FiHeart, FiSearch,
  FiMenu, FiX, FiSun, FiMoon, FiPackage,
  FiLogOut, FiSettings, FiGrid
} from 'react-icons/fi';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';
import useThemeStore from '../../store/themeStore';
import { authAPI } from '../../api/endpoints';
import Logo from '../common/Logo';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { isAuth, user, logout } = useAuthStore();
  const { itemCount }            = useCartStore();
  const { isDark, toggle }       = useThemeStore();
  const navigate                 = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [search,   setSearch]   = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // close menus on outside click
  useEffect(() => {
    const handler = () => setUserMenu(false);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/shop?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
      setMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      await authAPI.logout({ refresh });
    } catch {}
    logout();
    toast.success('Logged out successfully');
    navigate('/');
    setUserMenu(false);
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-white/90 dark:bg-dark/90 backdrop-blur-md shadow-md'
        : 'bg-white dark:bg-dark'
    } border-b border-gray-100 dark:border-gray-800`}>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Logo size="md" />

          {/* Search — desktop */}
          <form onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200
                           dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm
                           focus:outline-none focus:ring-2 focus:ring-primary
                           dark:text-white transition"
              />
            </div>
          </form>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-2">

            {/* Dark mode */}
            <button onClick={toggle}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              {isDark
                ? <FiSun size={20} className="text-accent" />
                : <FiMoon size={20} className="text-gray-600" />}
            </button>

            {isAuth ? (
              <>
                <Link to="/wishlist"
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                  <FiHeart size={20} className="text-gray-600 dark:text-gray-300" />
                </Link>

                <Link to="/cart"
                  className="relative p-2 rounded-lg hover:bg-gray-100
                             dark:hover:bg-gray-800 transition">
                  <FiShoppingCart size={20} className="text-gray-600 dark:text-gray-300" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white
                                     text-xs rounded-full flex items-center justify-center
                                     font-bold">
                      {itemCount > 99 ? '99+' : itemCount}
                    </span>
                  )}
                </Link>

                {/* User menu */}
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setUserMenu(!userMenu)}
                    className="flex items-center gap-2 p-1.5 rounded-xl
                               hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center
                                    justify-center">
                      {user?.avatar
                        ? <img src={user.avatar} alt=""
                               className="w-full h-full rounded-full object-cover" />
                        : <span className="text-white text-sm font-bold">
                            {user?.username?.[0]?.toUpperCase()}
                          </span>
                      }
                    </div>
                  </button>

                  <AnimatePresence>
                    {userMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0,  scale: 1 }}
                        exit={{ opacity: 0, y: -10,   scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900
                                   rounded-2xl shadow-xl border border-gray-100
                                   dark:border-gray-800 overflow-hidden z-50">

                        {/* User info */}
                        <div className="px-4 py-3 border-b border-gray-100
                                        dark:border-gray-800">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-primary rounded-full flex items-center
                                            justify-center flex-shrink-0">
                              <span className="text-white text-sm font-bold">
                                {user?.username?.[0]?.toUpperCase()}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-sm dark:text-white truncate">
                                {user?.full_name || user?.username}
                              </p>
                              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                            </div>
                          </div>
                          <span className={`inline-block mt-2 px-2 py-0.5 rounded-full
                                           text-xs font-medium capitalize
                            ${user?.role === 'vendor' ? 'bg-accent/20 text-accent'
                              : user?.role === 'admin' ? 'bg-danger/20 text-danger'
                              : 'bg-primary/20 text-primary'}`}>
                            {user?.role}
                          </span>
                        </div>

                        <div className="py-1">
                          <Link to="/profile"
                            onClick={() => setUserMenu(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm
                                       hover:bg-gray-50 dark:hover:bg-gray-800
                                       dark:text-gray-300 transition">
                            <FiSettings size={16} className="text-gray-400" />
                            Profile Settings
                          </Link>

                          <Link to="/orders"
                            onClick={() => setUserMenu(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm
                                       hover:bg-gray-50 dark:hover:bg-gray-800
                                       dark:text-gray-300 transition">
                            <FiPackage size={16} className="text-gray-400" />
                            My Orders
                          </Link>

                          <Link to="/wishlist"
                            onClick={() => setUserMenu(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm
                                       hover:bg-gray-50 dark:hover:bg-gray-800
                                       dark:text-gray-300 transition">
                            <FiHeart size={16} className="text-gray-400" />
                            Wishlist
                          </Link>

                          {['vendor', 'admin'].includes(user?.role) && (
                            <Link to="/vendor"
                              onClick={() => setUserMenu(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm
                                         hover:bg-gray-50 dark:hover:bg-gray-800
                                         dark:text-gray-300 transition">
                              <FiGrid size={16} className="text-gray-400" />
                              Vendor Dashboard
                            </Link>
                          )}

                          <div className="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1">
                            <button onClick={handleLogout}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm
                                         text-danger hover:bg-red-50 dark:hover:bg-red-900/20
                                         w-full transition">
                              <FiLogOut size={16} />
                              Logout
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700
                             dark:text-gray-300 hover:text-primary transition">
                  Login
                </Link>
                <Link to="/register"
                  className="px-4 py-2 bg-primary text-white text-sm font-medium
                             rounded-xl hover:bg-blue-600 transition">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile right icons */}
          <div className="flex md:hidden items-center gap-2">
            {isAuth && (
              <Link to="/cart"
                className="relative p-2 rounded-lg hover:bg-gray-100
                           dark:hover:bg-gray-800 transition">
                <FiShoppingCart size={20} className="dark:text-white" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white
                                   text-xs rounded-full flex items-center justify-center
                                   font-bold">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              {menuOpen
                ? <FiX size={22} className="dark:text-white" />
                : <FiMenu size={22} className="dark:text-white" />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200
                           dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm
                           focus:outline-none focus:ring-2 focus:ring-primary dark:text-white"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-100 dark:border-gray-800
                       bg-white dark:bg-dark overflow-hidden">
            <div className="px-4 py-4 space-y-1">

              <Link to="/shop"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                           dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800
                           transition font-medium">
                <FiShoppingCart size={16} /> Shop
              </Link>

              {isAuth ? (
                <>
                  <Link to="/wishlist" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                               dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800
                               transition font-medium">
                    <FiHeart size={16} /> Wishlist
                  </Link>

                  <Link to="/orders" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                               dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800
                               transition font-medium">
                    <FiPackage size={16} /> My Orders
                  </Link>

                  <Link to="/profile" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                               dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800
                               transition font-medium">
                    <FiSettings size={16} /> Profile
                  </Link>

                  {['vendor', 'admin'].includes(user?.role) && (
                    <Link to="/vendor" onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                                 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800
                                 transition font-medium">
                      <FiGrid size={16} /> Vendor Dashboard
                    </Link>
                  )}

                  <div className="border-t border-gray-100 dark:border-gray-800 pt-2 mt-2">
                    <button onClick={handleLogout}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                                 text-danger hover:bg-red-50 dark:hover:bg-red-900/20
                                 w-full transition font-medium">
                      <FiLogOut size={16} /> Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                               dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800
                               transition font-medium">
                    Login
                  </Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl
                               text-sm bg-primary text-white font-medium hover:bg-blue-600
                               transition">
                    Sign Up Free
                  </Link>
                </>
              )}

              {/* Theme toggle */}
              <div className="border-t border-gray-100 dark:border-gray-800 pt-2 mt-2">
                <button onClick={toggle}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                             dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800
                             w-full transition font-medium">
                  {isDark ? <FiSun size={16} className="text-accent" /> : <FiMoon size={16} />}
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
