import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowRight, FiShoppingBag, FiTruck,
  FiShield, FiRefreshCw, FiShoppingCart, FiHeart,
  FiZap, FiStar
} from 'react-icons/fi';
import { productsAPI, cartAPI } from '../api/endpoints';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';
import toast from 'react-hot-toast';

const features = [
  { icon: FiShoppingBag, title: 'Wide Selection',  desc: 'Thousands of products across all categories' },
  { icon: FiTruck,       title: 'Fast Delivery',   desc: 'Same day delivery within Nairobi' },
  { icon: FiShield,      title: 'Secure Payments', desc: 'M-Pesa and encrypted card payments' },
  { icon: FiRefreshCw,   title: 'Easy Returns',    desc: '7-day hassle-free return policy' },
];

const ProductCard = ({ product }) => {
  const { isAuth }  = useAuthStore();
  const { setCart } = useCartStore();
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuth) { toast.error('Please login to add to cart'); return; }
    setAdding(true);
    try {
      const res = await cartAPI.addItem({ product_id: product.id, quantity: 1 });
      setCart(res.data);
      toast.success('Added to cart');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add');
    } finally {
      setAdding(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
                 dark:border-gray-800 overflow-hidden group">
      <Link to={`/shop/${product.slug}`} className="block">
        <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden">
          {product.primary_image
            ? <img src={product.primary_image} alt={product.name}
                   className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
            : <div className="w-full h-full flex items-center justify-center">
                <FiShoppingBag size={32} className="text-gray-300" />
              </div>
          }
          {product.discount > 0 && (
            <span className="absolute top-2 left-2 px-2 py-1 bg-danger text-white
                             text-xs font-bold rounded-lg">
              -{product.discount}%
            </span>
          )}
          {product.is_flash_sale && (
            <span className="absolute top-2 right-2 px-2 py-1 bg-accent text-white
                             text-xs font-bold rounded-lg flex items-center gap-1">
              <FiZap size={10} /> Flash
            </span>
          )}
        </div>
      </Link>
      <div className="p-3">
        <p className="text-xs text-gray-400 mb-1">{product.category_name}</p>
        <Link to={`/shop/${product.slug}`}>
          <h3 className="font-semibold dark:text-white text-sm line-clamp-2
                         hover:text-primary transition mb-2">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <span className="font-bold text-primary text-sm">
              KES {Number(product.discounted_price).toLocaleString()}
            </span>
            {product.discount > 0 && (
              <span className="text-xs text-gray-400 line-through ml-1">
                KES {Number(product.price).toLocaleString()}
              </span>
            )}
          </div>
          <button onClick={handleAddToCart} disabled={adding || !product.is_in_stock}
            className="p-2 bg-primary text-white rounded-xl hover:bg-blue-600
                       transition disabled:opacity-50">
            <FiShoppingCart size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const SectionHeader = ({ title, subtitle, link, linkLabel }) => (
  <div className="flex items-end justify-between mb-6">
    <div>
      <h2 className="font-heading text-2xl font-bold dark:text-white">{title}</h2>
      {subtitle && <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{subtitle}</p>}
    </div>
    {link && (
      <Link to={link}
        className="flex items-center gap-1 text-primary text-sm font-medium hover:underline">
        {linkLabel} <FiArrowRight size={14} />
      </Link>
    )}
  </div>
);

const SkeletonCard = () => (
  <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden animate-pulse">
    <div className="aspect-square" />
    <div className="p-3 space-y-2">
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
    </div>
  </div>
);

const HomePage = () => {
  const navigate = useNavigate();
  const [featured,  setFeatured]  = useState([]);
  const [trending,  setTrending]  = useState([]);
  const [flashSale, setFlashSale] = useState([]);
  const [categories,setCategories]= useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [featRes, trendRes, flashRes, catRes] = await Promise.all([
          productsAPI.getFeatured(),
          productsAPI.getTrending(),
          productsAPI.getFlashSale(),
          productsAPI.getCategories(),
        ]);
        setFeatured(featRes.data.results   || featRes.data);
        setTrending(trendRes.data.results  || trendRes.data);
        setFlashSale(flashRes.data.results || flashRes.data);
        setCategories(catRes.data.results  || catRes.data);
      } catch {
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/shop?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <div className="min-h-screen">

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary via-blue-600 to-secondary overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block px-4 py-1.5 bg-white/20 text-white text-sm
                         rounded-full mb-4 backdrop-blur-sm font-medium">
              Kenya's Smart Marketplace
            </motion.span>
            <h1 className="font-heading text-4xl md:text-6xl font-bold text-white
                           leading-tight mb-4">
              Smart Shopping<br />
              <span className="text-accent">Starts Here</span>
            </h1>
            <p className="text-blue-100 text-lg mb-8 max-w-lg leading-relaxed">
              Discover thousands of products from verified vendors across Kenya.
              Fast delivery, secure M-Pesa payments, real deals.
            </p>

            {/* Search bar in hero */}
            <form onSubmit={handleSearch} className="flex gap-2 mb-8 max-w-lg">
              <input type="text" value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for anything..."
                className="flex-1 px-5 py-3 rounded-xl text-dark text-sm focus:outline-none
                           focus:ring-2 focus:ring-white/50 shadow-lg" />
              <button type="submit"
                className="px-6 py-3 bg-accent text-white font-semibold rounded-xl
                           hover:bg-orange-500 transition shadow-lg whitespace-nowrap">
                Search
              </button>
            </form>

            <div className="flex flex-wrap gap-3">
              <Link to="/shop"
                className="flex items-center gap-2 px-6 py-3 bg-white text-primary
                           font-semibold rounded-xl hover:bg-blue-50 transition shadow-lg text-sm">
                <FiShoppingBag size={16} /> Browse Shop
              </Link>
              <Link to="/register"
                className="flex items-center gap-2 px-6 py-3 bg-white/20 text-white
                           font-semibold rounded-xl hover:bg-white/30 transition
                           backdrop-blur-sm text-sm">
                Sell on SkyMall <FiArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 30C1200 60 960 0 720 30C480 60 240 0 0 30L0 60Z"
              className="fill-white dark:fill-dark" />
          </svg>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-white dark:bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <motion.div key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900
                           border border-gray-100 dark:border-gray-800">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center
                                justify-center flex-shrink-0">
                  <f.icon size={18} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm dark:text-white">{f.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-12 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader title="Shop by Category" link="/shop" linkLabel="All categories" />
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {categories.slice(0, 6).map((cat, i) => (
                <motion.div key={cat.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}>
                  <Link to={`/shop?category=${cat.slug}`}
                    className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800
                               rounded-2xl border border-gray-100 dark:border-gray-700
                               hover:border-primary hover:shadow-md transition group">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center
                                    justify-center group-hover:bg-primary transition">
                      <FiShoppingBag size={18}
                        className="text-primary group-hover:text-white transition" />
                    </div>
                    <span className="text-xs font-medium text-center dark:text-white
                                     leading-tight line-clamp-2">
                      {cat.name}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Flash Sale */}
      {(loading || flashSale.length > 0) && (
        <section className="py-12 bg-white dark:bg-dark">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-danger rounded-xl flex items-center justify-center">
                  <FiZap size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="font-heading text-2xl font-bold dark:text-white">Flash Sale</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Limited time offers</p>
                </div>
              </div>
              <Link to="/shop?flash_sale=true"
                className="flex items-center gap-1 text-primary text-sm font-medium hover:underline">
                View all <FiArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {loading
                ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
                : flashSale.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)
              }
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Featured Products"
            subtitle="Handpicked products for you"
            link="/shop?featured=true"
            linkLabel="View all"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {loading
              ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
              : featured.length > 0
                ? featured.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)
                : (
                  <div className="col-span-4 text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">
                      No featured products yet.{' '}
                      <Link to="/shop" className="text-primary hover:underline">
                        Browse all products
                      </Link>
                    </p>
                  </div>
                )
            }
          </div>
        </div>
      </section>

      {/* Trending */}
      <section className="py-12 bg-white dark:bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Trending Now"
            subtitle="Most viewed products this week"
            link="/shop?sort=-views_count"
            linkLabel="View all"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {loading
              ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
              : trending.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)
            }
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-accent to-orange-400 rounded-3xl p-8 md:p-12
                          flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-2">
                Become a SkyMall Vendor
              </h2>
              <p className="text-orange-100 text-sm md:text-base">
                Reach thousands of customers across Kenya. Start selling today — it's free.
              </p>
            </div>
            <Link to="/register"
              className="flex-shrink-0 flex items-center gap-2 px-8 py-3 bg-white text-accent
                         font-semibold rounded-xl hover:bg-orange-50 transition shadow-md text-sm">
              Get Started <FiArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
