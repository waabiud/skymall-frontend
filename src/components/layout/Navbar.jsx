import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiShoppingCart, FiHeart, FiSearch, FiMenu, FiX,
  FiSun, FiMoon, FiPackage, FiLogOut, FiSettings,
  FiGrid, FiChevronDown, FiUser
} from 'react-icons/fi';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';
import useThemeStore from '../../store/themeStore';
import { authAPI, productsAPI } from '../../api/endpoints';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { isAuth, user, logout } = useAuthStore();
  const { itemCount }            = useCartStore();
  const { isDark, toggle }       = useThemeStore();
  const navigate                 = useNavigate();

  const [menuOpen,    setMenuOpen]    = useState(false);
  const [userMenu,    setUserMenu]    = useState(false);
  const [search,      setSearch]      = useState('');
  const [categories,  setCategories]  = useState([]);
  const [catMenu,     setCatMenu]     = useState(false);

  useEffect(() => {
    productsAPI.getCategories().then((res) => {
      setCategories(Array.isArray(res.data) ? res.data : (res.data.results || []));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const handler = () => { setUserMenu(false); setCatMenu(false); };
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
    <header className="sticky top-0 z-50">

      {/* Top bar */}
      <div className="bg-primary dark:bg-primary-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">

            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-primary font-heading font-black text-sm">S</span>
              </div>
              <span className="font-heading font-bold text-xl text-white hidden sm:block">
                Sky<span className="text-yellow-300">Mall</span>
              </span>
            </Link>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-4">
              <div className="flex">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products, brands and categories..."
                  className="flex-1 px-4 py-2.5 rounded-l-lg text-sm text-dark
                             focus:outline-none bg-white"
                />
                <button type="submit"
                  className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300
                             rounded-r-lg transition flex items-center gap-2">
                  <FiSearch size={18} className="text-dark" />
                </button>
              </div>
            </form>

            {/* Right actions */}
            <div className="flex items-center gap-1 ml-auto">

              {/* Dark mode */}
              <button onClick={toggle}
                className="p-2 rounded-lg hover:bg-primary-dark transition text-white">
                {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
              </button>

              {isAuth ? (
                <>
                  {/* Wishlist */}
                  <Link to="/wishlist"
                    className="p-2 rounded-lg hover:bg-primary-dark transition
                               text-white hidden sm:block">
                    <FiHeart size={20} />
                  </Link>

                  {/* Cart */}
                  <Link to="/cart"
                    className="relative p-2 rounded-lg hover:bg-primary-dark
                               transition text-white">
                    <FiShoppingCart size={20} />
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400
                                       text-dark text-xs rounded-full flex items-center
                                       justify-center font-black">
                        {itemCount > 99 ? '99+' : itemCount}
                      </span>
                    )}
                  </Link>

                  {/* Account */}
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => setUserMenu(!userMenu)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg
                                 hover:bg-primary-dark transition text-white text-sm">
                      <FiUser size={18} />
                      <span className="hidden sm:block max-w-20 truncate">
                        {user?.username}
                      </span>
                      <FiChevronDown size={14} />
                    </button>

                    <AnimatePresence>
                      {userMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0,  scale: 1 }}
                          exit={{ opacity: 0,   y: -8,  scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-60 bg-white dark:bg-gray-900
                                     rounded-xl shadow-xl border border-gray-100
                                     dark:border-gray-800 overflow-hidden z-50">
                          <div className="bg-primary px-4 py-3">
                            <p className="font-semibold text-white text-sm">
                              {user?.full_name || user?.username}
                            </p>
                            <p className="text-pink-200 text-xs truncate">{user?.email}</p>
                          </div>
                          <div className="py-1">
                            {[
                              { icon: FiSettings, label: 'My Account',   to: '/profile' },
                              { icon: FiPackage,  label: 'My Orders',    to: '/orders' },
                              { icon: FiHeart,    label: 'Wishlist',     to: '/wishlist' },
                            ].map((item) => (
                              <Link key={item.to} to={item.to}
                                onClick={() => setUserMenu(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm
                                           hover:bg-pink-50 dark:hover:bg-gray-800
                                           dark:text-gray-300 transition">
                                <item.icon size={16} className="text-primary" />
                                {item.label}
                              </Link>
                            ))}
                            {['vendor', 'admin'].includes(user?.role) && (
                              <Link to="/vendor" onClick={() => setUserMenu(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm
                                           hover:bg-pink-50 dark:hover:bg-gray-800
                                           dark:text-gray-300 transition">
                                <FiGrid size={16} className="text-primary" />
                                Vendor Dashboard
                              </Link>
                            )}
                            <div className="border-t border-gray-100 dark:border-gray-800">
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
                    className="px-4 py-2 text-white text-sm font-medium
                               hover:bg-primary-dark rounded-lg transition">
                    Login
                  </Link>
                  <Link to="/register"
                    className="px-4 py-2 bg-white text-primary text-sm font-bold
                               rounded-lg hover:bg-yellow-50 transition">
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-primary-dark
                           transition text-white ml-1">
                {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category nav bar */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200
                      dark:border-gray-800 shadow-sm hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 h-10">

            {/* All categories dropdown */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setCatMenu(!catMenu)}
                className="flex items-center gap-2 px-4 h-10 bg-primary text-white
                           text-sm font-semibold hover:bg-primary-dark transition">
                <FiGrid size={16} />
                All Categories
                <FiChevronDown size={14} className={`transition ${catMenu ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {catMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute left-0 top-full w-56 bg-white dark:bg-gray-900
                               shadow-xl border border-gray-100 dark:border-gray-800
                               rounded-b-xl z-50">
                    {categories.map((cat) => (
                      <Link key={cat.id} to={`/shop?category=${cat.slug}`}
                        onClick={() => setCatMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm
                                   hover:bg-pink-50 dark:hover:bg-gray-800
                                   dark:text-gray-300 transition border-b
                                   border-gray-50 dark:border-gray-800 last:border-0">
                        <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                        {cat.name}
                      </Link>
                    ))}
                    {categories.length === 0 && (
                      <p className="px-4 py-3 text-sm text-gray-400">No categories</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick links */}
            {[
              { label: 'Flash Sales',     to: '/shop?flash_sale=true' },
              { label: 'Featured',        to: '/shop?featured=true' },
              { label: 'New Arrivals',    to: '/shop?sort=-created_at' },
              { label: 'Best Sellers',    to: '/shop?sort=-views_count' },
              { label: 'Sell on SkyMall', to: '/register' },
            ].map((link) => (
              <Link key={link.to} to={link.to}
                className="px-4 h-10 flex items-center text-sm font-medium
                           text-gray-700 dark:text-gray-300 hover:text-primary
                           dark:hover:text-primary transition whitespace-nowrap">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-gray-900 border-b
                       border-gray-200 dark:border-gray-800 overflow-hidden">

            {/* Mobile search */}
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <form onSubmit={handleSearch} className="flex">
                <input type="text" value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 px-4 py-2 rounded-l-lg border border-gray-200
                             dark:border-gray-700 bg-gray-50 dark:bg-gray-800
                             dark:text-white text-sm focus:outline-none" />
                <button type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-r-lg">
                  <FiSearch size={16} />
                </button>
              </form>
            </div>

            <div className="px-4 py-2 space-y-1">
              {[
                { label: 'Shop',        to: '/shop' },
                { label: 'Flash Sales', to: '/shop?flash_sale=true' },
                { label: 'New Arrivals',to: '/shop?sort=-created_at' },
              ].map((l) => (
                <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)}
                  className="block py-2.5 px-3 rounded-lg text-sm dark:text-gray-300
                             hover:bg-pink-50 dark:hover:bg-gray-800 transition">
                  {l.label}
                </Link>
              ))}

              {isAuth ? (
                <>
                  <Link to="/orders" onClick={() => setMenuOpen(false)}
                    className="block py-2.5 px-3 rounded-lg text-sm dark:text-gray-300
                               hover:bg-pink-50 dark:hover:bg-gray-800 transition">
                    My Orders
                  </Link>
                  <Link to="/wishlist" onClick={() => setMenuOpen(false)}
                    className="block py-2.5 px-3 rounded-lg text-sm dark:text-gray-300
                               hover:bg-pink-50 dark:hover:bg-gray-800 transition">
                    Wishlist
                  </Link>
                  <Link to="/profile" onClick={() => setMenuOpen(false)}
                    className="block py-2.5 px-3 rounded-lg text-sm dark:text-gray-300
                               hover:bg-pink-50 dark:hover:bg-gray-800 transition">
                    My Account
                  </Link>
                  {['vendor', 'admin'].includes(user?.role) && (
                    <Link to="/vendor" onClick={() => setMenuOpen(false)}
                      className="block py-2.5 px-3 rounded-lg text-sm dark:text-gray-300
                                 hover:bg-pink-50 dark:hover:bg-gray-800 transition">
                      Vendor Dashboard
                    </Link>
                  )}
                  <button onClick={handleLogout}
                    className="block w-full text-left py-2.5 px-3 rounded-lg text-sm
                               text-danger hover:bg-red-50 transition">
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Link to="/login" onClick={() => setMenuOpen(false)}
                    className="flex-1 text-center py-2 border border-primary text-primary
                               rounded-lg text-sm font-medium">
                    Login
                  </Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)}
                    className="flex-1 text-center py-2 bg-primary text-white
                               rounded-lg text-sm font-medium">
                    Sign Up
                  </Link>
                </div>
              )}

              <button onClick={toggle}
                className="flex items-center gap-2 py-2.5 px-3 rounded-lg text-sm
                           dark:text-gray-300 w-full hover:bg-pink-50
                           dark:hover:bg-gray-800 transition">
                {isDark ? <FiSun size={16} className="text-yellow-400" /> : <FiMoon size={16} />}
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
