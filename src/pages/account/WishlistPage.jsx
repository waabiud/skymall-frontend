import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiTrash2, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { productsAPI, cartAPI } from '../../api/endpoints';
import useCartStore from '../../store/cartStore';

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [adding,   setAdding]   = useState(null);
  const { setCart }             = useCartStore();

  useEffect(() => {
    productsAPI.getWishlist()
      .then((res) => setWishlist(res.data.results || res.data))
      .catch(() => toast.error('Failed to load wishlist'))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (id) => {
    try {
      await productsAPI.removeWishlist(id);
      setWishlist(wishlist.filter((w) => w.id !== id));
      toast.success('Removed from wishlist');
    } catch {
      toast.error('Failed to remove item');
    }
  };

  const handleAddToCart = async (product, wishlistId) => {
    setAdding(wishlistId);
    try {
      const res = await cartAPI.addItem({ product_id: product.id, quantity: 1 });
      setCart(res.data);
      toast.success('Added to cart');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add to cart');
    } finally {
      setAdding(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-heading text-2xl font-bold dark:text-white mb-6 flex items-center gap-2">
        <FiHeart className="text-danger" /> Wishlist
        <span className="text-base font-normal text-gray-500">({wishlist.length})</span>
      </h1>

      {wishlist.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center
                          justify-center mx-auto mb-4">
            <FiHeart size={32} className="text-danger" />
          </div>
          <h2 className="font-heading text-xl font-bold dark:text-white mb-2">
            Your wishlist is empty
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
            Save items you love for later
          </p>
          <Link to="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white
                       font-semibold rounded-xl hover:bg-blue-600 transition text-sm">
            Browse Products <FiArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {wishlist.map((item) => {
            const product = item.product;
            return (
              <div key={item.id}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
                           dark:border-gray-800 overflow-hidden hover:shadow-md transition group">
                <Link to={`/shop/${product.slug}`} className="block">
                  <div className="aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden relative">
                    {product.primary_image
                      ? <img src={product.primary_image} alt={product.name}
                             className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                      : <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                          No image
                        </div>
                    }
                    <button onClick={(e) => { e.preventDefault(); handleRemove(item.id); }}
                      className="absolute top-2 right-2 w-8 h-8 bg-white dark:bg-gray-900 rounded-full
                                 flex items-center justify-center shadow-md hover:bg-red-50
                                 dark:hover:bg-red-900/20 transition">
                      <FiTrash2 size={14} className="text-danger" />
                    </button>
                  </div>
                </Link>
                <div className="p-3">
                  <Link to={`/shop/${product.slug}`}>
                    <h3 className="text-sm font-semibold dark:text-white line-clamp-2
                                   hover:text-primary transition mb-1">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-primary font-bold text-sm mb-2">
                    KES {Number(product.discounted_price).toLocaleString()}
                  </p>
                  <button
                    onClick={() => handleAddToCart(product, item.id)}
                    disabled={adding === item.id || !product.is_in_stock}
                    className="w-full flex items-center justify-center gap-1 py-2 bg-primary text-white
                               text-xs font-medium rounded-xl hover:bg-blue-600 transition
                               disabled:opacity-50 disabled:cursor-not-allowed">
                    <FiShoppingCart size={13} />
                    {adding === item.id ? 'Adding...'
                      : product.is_in_stock ? 'Add to Cart'
                      : 'Out of Stock'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
