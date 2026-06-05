import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiSearch, FiFilter, FiGrid, FiList,
  FiChevronDown, FiX, FiHeart, FiShoppingCart
} from 'react-icons/fi';
import { productsAPI, cartAPI } from '../../api/endpoints';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';
import toast from 'react-hot-toast';

const SORT_OPTIONS = [
  { label: 'Newest',       value: '-created_at' },
  { label: 'Oldest',       value: 'created_at' },
  { label: 'Price: Low',   value: 'price' },
  { label: 'Price: High',  value: '-price' },
  { label: 'Most Viewed',  value: '-views_count' },
];

const CONDITIONS = ['new', 'used', 'refurbished'];

const ProductCard = ({ product, view }) => {
  const { isAuth }    = useAuthStore();
  const { setCart }   = useCartStore();
  const [adding, setAdding] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuth) { toast.error('Please login to add to cart'); return; }
    setAdding(true);
    try {
      const res = await cartAPI.addItem({ product_id: product.id, quantity: 1 });
      setCart(res.data);
      toast.success('Added to cart');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!isAuth) { toast.error('Please login to save items'); return; }
    try {
      if (wishlisted) {
        setWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        await productsAPI.addWishlist({ product_id: product.id });
        setWishlisted(true);
        toast.success('Added to wishlist');
      }
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  if (view === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
                   dark:border-gray-800 p-4 flex gap-4 hover:shadow-md transition">
        <Link to={`/shop/${product.slug}`} className="flex-shrink-0">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
            {product.primary_image
              ? <img src={product.primary_image} alt={product.name}
                     className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No image</div>
            }
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <Link to={`/shop/${product.slug}`}>
            <h3 className="font-semibold dark:text-white truncate hover:text-primary transition">
              {product.name}
            </h3>
          </Link>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{product.category_name}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="font-bold text-primary">KES {Number(product.discounted_price).toLocaleString()}</span>
            {product.discount > 0 && (
              <span className="text-xs text-gray-400 line-through">
                KES {Number(product.price).toLocaleString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 justify-center">
          <button onClick={handleWishlist}
            className={`p-2 rounded-lg border transition ${wishlisted
              ? 'bg-red-50 border-red-200 text-danger'
              : 'border-gray-200 dark:border-gray-700 text-gray-400 hover:text-danger'}`}>
            <FiHeart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
          </button>
          <button onClick={handleAddToCart} disabled={adding || !product.is_in_stock}
            className="p-2 rounded-lg bg-primary text-white hover:bg-blue-600
                       transition disabled:opacity-50">
            <FiShoppingCart size={16} />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
                 dark:border-gray-800 overflow-hidden hover:shadow-md transition group">
      <Link to={`/shop/${product.slug}`} className="block">
        <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden">
          {product.primary_image
            ? <img src={product.primary_image} alt={product.name}
                   className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
            : <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No image</div>
          }
          {product.discount > 0 && (
            <span className="absolute top-2 left-2 px-2 py-1 bg-danger text-white text-xs
                             font-bold rounded-lg">
              -{product.discount}%
            </span>
          )}
          {product.is_flash_sale && (
            <span className="absolute top-2 right-2 px-2 py-1 bg-accent text-white text-xs
                             font-bold rounded-lg">
              Flash
            </span>
          )}
          {!product.is_in_stock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">Out of Stock</span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">{product.category_name}</p>
        <Link to={`/shop/${product.slug}`}>
          <h3 className="font-semibold dark:text-white text-sm leading-tight
                         hover:text-primary transition line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mt-2 mb-3">
          <span className="font-bold text-primary">
            KES {Number(product.discounted_price).toLocaleString()}
          </span>
          {product.discount > 0 && (
            <span className="text-xs text-gray-400 line-through">
              KES {Number(product.price).toLocaleString()}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <button onClick={handleAddToCart}
            disabled={adding || !product.is_in_stock}
            className="flex-1 flex items-center justify-center gap-1 py-2 bg-primary text-white
                       text-xs font-medium rounded-xl hover:bg-blue-600 transition
                       disabled:opacity-50 disabled:cursor-not-allowed">
            <FiShoppingCart size={14} />
            {adding ? 'Adding...' : product.is_in_stock ? 'Add to Cart' : 'Out of Stock'}
          </button>
          <button onClick={handleWishlist}
            className={`p-2 rounded-xl border transition ${wishlisted
              ? 'bg-red-50 border-red-200 text-danger'
              : 'border-gray-200 dark:border-gray-700 text-gray-400 hover:text-danger'}`}>
            <FiHeart size={15} fill={wishlisted ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products,    setProducts]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [count,       setCount]       = useState(0);
  const [view,        setView]        = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search:    searchParams.get('search') || '',
    category:  searchParams.get('category') || '',
    condition: searchParams.get('condition') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    sort:      searchParams.get('sort') || '-created_at',
    in_stock:  searchParams.get('in_stock') || '',
  });

  useEffect(() => {
    productsAPI.getCategories().then((res) => {
  setCategories(res.data.results || res.data.categories || res.data || []);
});
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const res = await productsAPI.getAll(params);
      setProducts(res.data.results || res.data);
      setCount(res.data.count || 0);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateFilter = (key, value) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    const params = {};
    Object.entries(next).forEach(([k, v]) => { if (v) params[k] = v; });
    setSearchParams(params);
  };

  const clearFilters = () => {
    const reset = { search: '', category: '', condition: '', min_price: '', max_price: '', sort: '-created_at', in_stock: '' };
    setFilters(reset);
    setSearchParams({});
  };

  const hasActiveFilters = filters.category || filters.condition || filters.min_price || filters.max_price || filters.in_stock;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold dark:text-white">Shop</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {loading ? 'Loading...' : `${count} products found`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={filters.sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-gray-200
                         dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white
                         text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
          </div>

          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm transition
              ${showFilters
                ? 'bg-primary text-white border-primary'
                : 'border-gray-200 dark:border-gray-700 dark:text-white hover:border-primary'}`}>
            <FiFilter size={14} />
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-accent rounded-full"></span>
            )}
          </button>

          <div className="flex border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <button onClick={() => setView('grid')}
              className={`p-2 transition ${view === 'grid' ? 'bg-primary text-white' : 'dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
              <FiGrid size={16} />
            </button>
            <button onClick={() => setView('list')}
              className={`p-2 transition ${view === 'list' ? 'bg-primary text-white' : 'dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
              <FiList size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative mb-6">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          placeholder="Search products, brands, categories..."
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700
                     bg-white dark:bg-gray-900 dark:text-white focus:outline-none
                     focus:ring-2 focus:ring-primary transition"
        />
      </div>

      {/* Filters panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
                     dark:border-gray-800 p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                Category
              </label>
              <select value={filters.category}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700
                           bg-gray-50 dark:bg-gray-800 dark:text-white text-sm focus:outline-none
                           focus:ring-2 focus:ring-primary">
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                Condition
              </label>
              <select value={filters.condition}
                onChange={(e) => updateFilter('condition', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700
                           bg-gray-50 dark:bg-gray-800 dark:text-white text-sm focus:outline-none
                           focus:ring-2 focus:ring-primary">
                <option value="">Any Condition</option>
                {CONDITIONS.map((c) => (
                  <option key={c} value={c} className="capitalize">{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                Price Range (KES)
              </label>
              <div className="flex gap-2">
                <input type="number" placeholder="Min" value={filters.min_price}
                  onChange={(e) => updateFilter('min_price', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700
                             bg-gray-50 dark:bg-gray-800 dark:text-white text-sm focus:outline-none
                             focus:ring-2 focus:ring-primary" />
                <input type="number" placeholder="Max" value={filters.max_price}
                  onChange={(e) => updateFilter('max_price', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700
                             bg-gray-50 dark:bg-gray-800 dark:text-white text-sm focus:outline-none
                             focus:ring-2 focus:ring-primary" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                Availability
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox"
                  checked={filters.in_stock === 'true'}
                  onChange={(e) => updateFilter('in_stock', e.target.checked ? 'true' : '')}
                  className="w-4 h-4 text-primary rounded" />
                <span className="text-sm dark:text-white">In stock only</span>
              </label>
            </div>
          </div>

          {hasActiveFilters && (
            <button onClick={clearFilters}
              className="mt-4 flex items-center gap-2 text-sm text-danger hover:underline">
              <FiX size={14} /> Clear all filters
            </button>
          )}
        </motion.div>
      )}

      {/* Products grid */}
      {loading ? (
        <div className={`grid gap-4 ${view === 'grid'
          ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
          : 'grid-cols-1'}`}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse aspect-square" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">🔍</p>
          <h3 className="font-heading text-xl font-semibold dark:text-white mb-2">No products found</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Try adjusting your search or filters</p>
          <button onClick={clearFilters}
            className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-blue-600 transition text-sm">
            Clear Filters
          </button>
        </div>
      ) : (
        <div className={`grid gap-4 ${view === 'grid'
          ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
          : 'grid-cols-1'}`}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} view={view} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopPage;