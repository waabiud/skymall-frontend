import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowRight, FiShoppingCart, FiZap,
  FiTruck, FiShield, FiRefreshCw, FiStar,
  FiHeart
} from 'react-icons/fi';
import { productsAPI, cartAPI } from '../api/endpoints';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';
import toast from 'react-hot-toast';

// ── Product Card (Jumia style) ────────────────────────────────
const ProductCard = ({ product }) => {
  const { isAuth }  = useAuthStore();
  const { setCart } = useCartStore();
  const [adding,    setAdding]    = useState(false);
  const [wishlisted,setWishlisted]= useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
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

  const savings = product.discount > 0
    ? Math.round(product.price - product.discounted_price)
    : 0;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200
                    dark:border-gray-800 overflow-hidden hover:shadow-lg transition
                    group relative">

      {/* Wishlist button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          if (!isAuth) { toast.error('Please login'); return; }
          setWishlisted(!wishlisted);
          toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist');
        }}
        className="absolute top-2 right-2 z-10 w-8 h-8 bg-white dark:bg-gray-800
                   rounded-full flex items-center justify-center shadow-md
                   opacity-0 group-hover:opacity-100 transition">
        <FiHeart size={15}
          className={wishlisted ? 'text-primary fill-primary' : 'text-gray-400'}
          fill={wishlisted ? 'currentColor' : 'none'} />
      </button>

      <Link to={`/shop/${product.slug}`} className="block">
        {/* Image */}
        <div className="relative bg-gray-50 dark:bg-gray-800 overflow-hidden"
             style={{ paddingBottom: '100%' }}>
          <div className="absolute inset-0 flex items-center justify-center p-2">
            {product.primary_image ? (
              <img src={product.primary_image} alt={product.name}
                   className="w-full h-full object-contain group-hover:scale-105
                              transition duration-300" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FiShoppingCart size={40} className="text-gray-300" />
              </div>
            )}
          </div>

          {/* Badges */}
          {product.discount > 0 && (
            <div className="absolute top-2 left-2 bg-primary text-white text-xs
                            font-bold px-2 py-0.5 rounded">
              -{product.discount}%
            </div>
          )}
          {product.is_flash_sale && (
            <div className="absolute bottom-2 left-2 bg-secondary text-white text-xs
                            font-bold px-2 py-0.5 rounded flex items-center gap-1">
              <FiZap size={10} /> Flash
            </div>
          )}
          {!product.is_in_stock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-gray-500 font-semibold text-sm">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-1">
            {product.category_name}
          </p>
          <h3 className="text-sm text-gray-800 dark:text-white line-clamp-2 leading-tight
                         mb-2 min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* Rating placeholder */}
          <div className="flex items-center gap-1 mb-2">
            {[1,2,3,4,5].map((s) => (
              <FiStar key={s} size={11}
                className="text-accent fill-accent" fill="currentColor" />
            ))}
            <span className="text-xs text-gray-400">(0)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-gray-900 dark:text-white text-base">
              KES {Number(product.discounted_price).toLocaleString()}
            </span>
          </div>
          {product.discount > 0 && (
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-gray-400 line-through">
                KES {Number(product.price).toLocaleString()}
              </span>
              <span className="text-xs text-primary font-medium">
                Save KES {savings.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Add to cart button */}
      <div className="px-3 pb-3">
        <button onClick={handleAddToCart}
          disabled={adding || !product.is_in_stock}
          className="w-full py-2 bg-primary hover:bg-primary-dark text-white text-sm
                     font-semibold rounded transition disabled:opacity-50
                     disabled:cursor-not-allowed flex items-center justify-center gap-2">
          <FiShoppingCart size={14} />
          {adding ? 'Adding...' : product.is_in_stock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
};

// ── Section Header ────────────────────────────────────────────
const SectionHeader = ({ title, link, linkLabel, icon: Icon, color = 'bg-primary' }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-3">
      {Icon && (
        <div className={`w-8 h-8 ${color} rounded flex items-center justify-center`}>
          <Icon size={18} className="text-white" />
        </div>
      )}
      <h2 className="font-heading text-xl font-bold dark:text-white">{title}</h2>
    </div>
    {link && (
      <Link to={link}
        className="flex items-center gap-1 text-primary text-sm font-medium
                   hover:underline">
        See All <FiArrowRight size={14} />
      </Link>
    )}
  </div>
);

// ── Skeleton ──────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200
                  dark:border-gray-700 overflow-hidden animate-pulse">
    <div className="aspect-square bg-gray-200 dark:bg-gray-700" />
    <div className="p-3 space-y-2">
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mt-2" />
    </div>
  </div>
);

// ── Main HomePage ─────────────────────────────────────────────
const HomePage = () => {
  const navigate = useNavigate();
  const [featured,   setFeatured]   = useState([]);
  const [trending,   setTrending]   = useState([]);
  const [flashSale,  setFlashSale]  = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);

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
        setCategories(Array.isArray(catRes.data) ? catRes.data : (catRes.data.results || []));
      } catch {
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <div className="bg-sky-gray dark:bg-dark min-h-screen">

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-primary via-pink-500 to-primary-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}>
              <span className="inline-block bg-white/20 text-white text-sm px-4 py-1.5
                               rounded-full mb-4 font-medium backdrop-blur-sm">
                Kenya's Smart Marketplace
              </span>
              <h1 className="font-heading text-4xl md:text-5xl font-black text-white
                             leading-tight mb-4">
                Smart Shopping<br />
                <span className="text-yellow-300">Starts Here</span>
              </h1>
              <p className="text-pink-100 text-lg mb-8 leading-relaxed">
                Thousands of products from verified vendors. Fast delivery across Kenya.
                Pay via M-Pesa.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/shop"
                  className="flex items-center gap-2 px-8 py-3 bg-white text-primary
                             font-bold rounded-lg hover:bg-yellow-50 transition shadow-lg">
                  Shop Now <FiArrowRight size={18} />
                </Link>
                <Link to="/register"
                  className="flex items-center gap-2 px-8 py-3 bg-yellow-400 text-dark
                             font-bold rounded-lg hover:bg-yellow-300 transition shadow-lg">
                  Start Selling
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden md:grid grid-cols-2 gap-3">
              {(loading ? [...Array(4)] : featured.slice(0, 4)).map((product, i) => (
                <div key={i}
                  className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
                  {product ? (
                    <>
                      {product.primary_image ? (
                        <img src={product.primary_image} alt={product.name}
                             className="w-full h-20 object-contain mb-2 rounded" />
                      ) : (
                        <div className="w-full h-20 bg-white/20 rounded mb-2
                                        flex items-center justify-center">
                          <FiShoppingCart size={24} className="text-white/60" />
                        </div>
                      )}
                      <p className="text-white text-xs font-medium line-clamp-1">
                        {product.name}
                      </p>
                      <p className="text-yellow-300 text-xs font-bold">
                        KES {Number(product.discounted_price).toLocaleString()}
                      </p>
                    </>
                  ) : (
                    <div className="h-28 bg-white/10 rounded animate-pulse" />
                  )}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="bg-white dark:bg-gray-900 border-b border-gray-200
                          dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: FiTruck,     label: 'Fast Delivery',   desc: 'Same day in Nairobi' },
              { icon: FiShield,    label: 'Secure Payments', desc: 'M-Pesa protected' },
              { icon: FiRefreshCw, label: 'Easy Returns',    desc: '7 day policy' },
              { icon: FiZap,       label: 'Flash Deals',     desc: 'Daily discounts' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <div className="w-9 h-9 bg-pink-50 dark:bg-pink-900/20 rounded-lg
                                flex items-center justify-center flex-shrink-0">
                  <f.icon size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold dark:text-white">{f.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">

        {/* Categories */}
        {categories.length > 0 && (
          <section>
            <SectionHeader title="Shop by Category" link="/shop" linkLabel="See All" />
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
              {categories.slice(0, 8).map((cat, i) => (
                <motion.div key={cat.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}>
                  <Link to={`/shop?category=${cat.slug}`}
                    className="flex flex-col items-center gap-2 p-3 bg-white
                               dark:bg-gray-900 rounded-xl border border-gray-200
                               dark:border-gray-800 hover:border-primary
                               hover:shadow-md transition group text-center">
                    <div className="w-10 h-10 bg-pink-50 dark:bg-pink-900/20 rounded-full
                                    flex items-center justify-center group-hover:bg-primary
                                    transition">
                      <FiShoppingCart size={16}
                        className="text-primary group-hover:text-white transition" />
                    </div>
                    <span className="text-xs font-medium dark:text-white leading-tight
                                     line-clamp-2">
                      {cat.name}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Flash Sale */}
        {(loading || flashSale.length > 0) && (
          <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200
                              dark:border-gray-800 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary px-3 py-1.5 rounded flex items-center gap-2">
                  <FiZap size={16} className="text-white" />
                  <span className="text-white font-bold text-sm">Flash Sale</span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Limited time offers
                </span>
              </div>
              <Link to="/shop?flash_sale=true"
                className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
                See All <FiArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {loading
                ? [...Array(5)].map((_, i) => <SkeletonCard key={i} />)
                : flashSale.slice(0, 5).map((p) => <ProductCard key={p.id} product={p} />)
              }
            </div>
          </section>
        )}

        {/* Featured Products */}
        <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200
                            dark:border-gray-800 p-4">
          <SectionHeader title="Featured Products"
            link="/shop?featured=true" linkLabel="See All"
            icon={FiStar} />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {loading
              ? [...Array(5)].map((_, i) => <SkeletonCard key={i} />)
              : featured.length > 0
                ? featured.slice(0, 10).map((p) => <ProductCard key={p.id} product={p} />)
                : (
                  <div className="col-span-5 text-center py-10">
                    <p className="text-gray-400 text-sm">
                      No featured products yet.{' '}
                      <Link to="/shop" className="text-primary hover:underline">
                        Browse all
                      </Link>
                    </p>
                  </div>
                )
            }
          </div>
        </section>

        {/* Trending */}
        <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200
                            dark:border-gray-800 p-4">
          <SectionHeader title="Trending Now"
            link="/shop?sort=-views_count" linkLabel="See All"
            icon={FiZap} color="bg-secondary" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {loading
              ? [...Array(5)].map((_, i) => <SkeletonCard key={i} />)
              : trending.slice(0, 10).map((p) => <ProductCard key={p.id} product={p} />)
            }
          </div>
        </section>

        {/* Vendor CTA */}
        <section className="bg-gradient-to-r from-primary to-pink-400 rounded-xl
                            p-8 flex flex-col md:flex-row items-center
                            justify-between gap-6">
          <div>
            <h2 className="font-heading text-2xl font-bold text-white mb-2">
              Start Selling on SkyMall
            </h2>
            <p className="text-pink-100 text-sm">
              Reach thousands of customers across Kenya. Zero setup fee.
            </p>
          </div>
          <Link to="/register"
            className="flex-shrink-0 flex items-center gap-2 px-8 py-3 bg-white
                       text-primary font-bold rounded-lg hover:bg-yellow-50
                       transition shadow-md">
            Get Started <FiArrowRight size={16} />
          </Link>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
