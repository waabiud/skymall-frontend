import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiSearch, FiFilter, FiChevronDown,
  FiX, FiHeart, FiShoppingCart, FiStar, FiZap
} from 'react-icons/fi';
import { productsAPI, cartAPI } from '../../api/endpoints';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';
import toast from 'react-hot-toast';

const SORT_OPTIONS = [
  { label: 'Newest First',  value: '-created_at' },
  { label: 'Oldest First',  value: 'created_at' },
  { label: 'Price: Low',    value: 'price' },
  { label: 'Price: High',   value: '-price' },
  { label: 'Most Popular',  value: '-views_count' },
];

const ProductCard = ({ product }) => {
  const { isAuth }  = useAuthStore();
  const { setCart } = useCartStore();
  const [adding,    setAdding]    = useState(false);
  const [wishlisted,setWishlisted]= useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuth) { toast.error('Please login'); return; }
    setAdding(true);
    try {
      const res = await cartAPI.addItem({ product_id: product.id, quantity: 1 });
      setCart(res.data);
      toast.success('Added to cart');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200
                    dark:border-gray-800 overflow-hidden hover:shadow-lg transition
                    group relative">
      <button
        onClick={(e) => {
          e.preventDefault();
          if (!isAuth) { toast.error('Please login'); return; }
          setWishlisted(!wishlisted);
          toast.success(wishlisted ? 'Removed' : 'Added to wishlist');
        }}
        className="absolute top-2 right-2 z-10 w-8 h-8 bg-white dark:bg-gray-800
                   rounded-full flex items-center justify-center shadow
                   opacity-0 group-hover:opacity-100 transition">
        <FiHeart size={14}
          className={wishlisted ? 'text-primary fill-primary' : 'text-gray-400'}
          fill={wishlisted ? 'currentColor' : 'none'} />
      </button>

      <Link to={`/shop/${product.slug}`}>
        <div className="relative bg-gray-50 dark:bg-gray-800"
             style={{ paddingBottom: '100%' }}>
          <div className="absolute inset-0 flex items-center justify-center p-2">
            {product.primary_image ? (
              <img src={product.primary_image} alt={product.name}
                   className="w-full h-full object-contain group-hover:scale-105
                              transition duration-300" />
            ) : (
              <FiShoppingCart size={36} className="text-gray-300" />
            )}
          </div>
          {product.discount > 0 && (
            <div className="absolute top-2 left-2 bg-primary text-white text-xs
                            font-bold px-1.5 py-0.5 rounded">
              -{product.discount}%
            </div>
          )}
          {product.is_flash_sale && (
            <div className="absolute bottom-2 left-2 bg-secondary text-white text-xs
                            font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <FiZap size={9} /> Flash
            </div>
          )}
        </div>

        <div className="p-2.5">
          <p className="text-xs text-gray-400 truncate">{product.category_name}</p>
          <h3 className="text-sm text-gray-800 dark:text-white line-clamp-2
                         leading-tight my-1 min-h-[2.5rem]">
            {product.name}
          </h3>
          <div className="flex items-center gap-0.5 mb-1">
            {[1,2,3,4,5].map((s) => (
              <FiStar key={s} size={10} className="text-accent fill-accent"
                fill="currentColor" />
            ))}
          </div>
          <p className="font-bold text-gray-900 dark:text-white">
            KES {Number(product.discounted_price).toLocaleString()}
          </p>
          {product.discount > 0 && (
            <p className="text-xs text-gray-400 line-through">
              KES {Number(product.price).toLocaleString()}
            </p>
          )}
          {!product.is_in_stock && (
            <p className="text-xs text-danger font-medium mt-1">Out of stock</p>
          )}
        </div>
      </Link>

      <div className="px-2.5 pb-2.5">
        <button onClick={handleAddToCart}
          disabled={adding || !product.is_in_stock}
          className="w-full py-1.5 bg-primary hover:bg-primary-dark text-white
                     text-xs font-semibold rounded transition disabled:opacity-50
                     flex items-center justify-center gap-1">
          <FiShoppingCart size={12} />
          {adding ? 'Adding...' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products,    setProducts]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [count,       setCount]       = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search:    searchParams.get('search')    || '',
    category:  searchParams.get('category') || '',
    condition: searchParams.get('condition')|| '',
    min_price: searchParams.get('min_price')|| '',
    max_price: searchParams.get('max_price')|| '',
    sort:      searchParams.get('sort')     || '-created_at',
    in_stock:  searchParams.get('in_stock') || '',
    featured:  searchParams.get('featured') || '',
    flash_sale:searchParams.get('flash_sale')|| '',
  });

  useEffect(() => {
    productsAPI.getCategories().then((res) => setCategories(res.data));
  }, []);

  useEffect(() => { fetchProducts(); }, [filters]);

  const fetchProducts = async () => {
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
  };

  const updateFilter = (key, value) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    const params = {};
    Object.entries(next).forEach(([k, v]) => { if (v) params[k] = v; });
    setSearchParams(params);
  };

  const clearFilters = () => {
    const reset = {
      search: '', category: '', condition: '', min_price: '',
      max_price: '', sort: '-created_at', in_stock: '', featured: '', flash_sale: ''
    };
    setFilters(reset);
    setSearchParams({});
  };

  const hasActiveFilters = filters.category || filters.condition ||
    filters.min_price || filters.max_price || filters.in_stock;

  return (
    <div className="bg-sky-gray dark:bg-dark min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">

        {/* Search + Sort bar */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200
                        dark:border-gray-800 p-3 mb-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16} />
            <input type="text" value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200
                         dark:border-gray-700 bg-gray-50 dark:bg-gray-800
                         dark:text-white text-sm focus:outline-none
                         focus:ring-2 focus:ring-primary" />
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <select value={filters.sort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 rounded-lg border
                           border-gray-200 dark:border-gray-700 bg-white
                           dark:bg-gray-800 dark:text-white text-sm
                           focus:outline-none focus:ring-2 focus:ring-primary">
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2
                                        text-gray-400 pointer-events-none" size={14} />
            </div>

            <button onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border
                         text-sm transition ${showFilters
                           ? 'bg-primary text-white border-primary'
                           : 'border-gray-200 dark:border-gray-700 dark:text-white'}`}>
              <FiFilter size={14} />
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-yellow-400 rounded-full" />
              )}
            </button>
          </div>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200
                       dark:border-gray-800 p-4 mb-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500
                                  uppercase tracking-wide mb-1.5">
                  Category
                </label>
                <select value={filters.category}
                  onChange={(e) => updateFilter('category', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200
                             dark:border-gray-700 bg-gray-50 dark:bg-gray-800
                             dark:text-white text-sm focus:outline-none
                             focus:ring-2 focus:ring-primary">
                  <option value="">All</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500
                                  uppercase tracking-wide mb-1.5">
                  Condition
                </label>
                <select value={filters.condition}
                  onChange={(e) => updateFilter('condition', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200
                             dark:border-gray-700 bg-gray-50 dark:bg-gray-800
                             dark:text-white text-sm focus:outline-none
                             focus:ring-2 focus:ring-primary">
                  <option value="">Any</option>
                  <option value="new">New</option>
                  <option value="used">Used</option>
                  <option value="refurbished">Refurbished</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500
                                  uppercase tracking-wide mb-1.5">
                  Min Price (KES)
                </label>
                <input type="number" placeholder="0" value={filters.min_price}
                  onChange={(e) => updateFilter('min_price', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200
                             dark:border-gray-700 bg-gray-50 dark:bg-gray-800
                             dark:text-white text-sm focus:outline-none
                             focus:ring-2 focus:ring-primary" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500
                                  uppercase tracking-wide mb-1.5">
                  Max Price (KES)
                </label>
                <input type="number" placeholder="999999" value={filters.max_price}
                  onChange={(e) => updateFilter('max_price', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200
                             dark:border-gray-700 bg-gray-50 dark:bg-gray-800
                             dark:text-white text-sm focus:outline-none
                             focus:ring-2 focus:ring-primary" />
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t
                            border-gray-100 dark:border-gray-800">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox"
                  checked={filters.in_stock === 'true'}
                  onChange={(e) => updateFilter('in_stock', e.target.checked ? 'true' : '')}
                  className="w-4 h-4 text-primary rounded" />
                <span className="text-sm dark:text-white">In stock only</span>
              </label>
              {hasActiveFilters && (
                <button onClick={clearFilters}
                  className="flex items-center gap-1 text-sm text-danger hover:underline">
                  <FiX size={14} /> Clear filters
                </button>
              )}
            </div>
          </motion.div>
        )}

        <div className="flex gap-4">

          {/* Sidebar — desktop */}
          <div className="hidden lg:block w-56 flex-shrink-0">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200
                            dark:border-gray-800 p-4 sticky top-28">
              <h3 className="font-semibold dark:text-white mb-3 text-sm uppercase
                             tracking-wide text-gray-600 dark:text-gray-400">
                Categories
              </h3>
              <div className="space-y-1">
                <button onClick={() => updateFilter('category', '')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition
                    ${!filters.category
                      ? 'bg-primary text-white font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-pink-50 dark:hover:bg-gray-800'
                    }`}>
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button key={cat.id}
                    onClick={() => updateFilter('category', cat.slug)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition
                      ${filters.category === cat.slug
                        ? 'bg-primary text-white font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-pink-50 dark:hover:bg-gray-800'
                      }`}>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="flex-1">
            {/* Results count */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {loading ? 'Loading...' : `${count} products found`}
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i}
                    className="bg-white dark:bg-gray-800 rounded-lg border
                               border-gray-200 dark:border-gray-700 overflow-hidden
                               animate-pulse">
                    <div className="aspect-square bg-gray-200 dark:bg-gray-700" />
                    <div className="p-3 space-y-2">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-xl
                              border border-gray-200 dark:border-gray-800">
                <FiSearch size={40} className="text-gray-300 mx-auto mb-3" />
                <h3 className="font-semibold dark:text-white mb-2">No products found</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                  Try adjusting your search or filters
                </p>
                <button onClick={clearFilters}
                  className="px-6 py-2 bg-primary text-white rounded-lg text-sm
                             hover:bg-primary-dark transition">
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
