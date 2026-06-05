import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FiShoppingCart, FiHeart, FiStar,
  FiTruck, FiShield, FiRefreshCw, FiMinus, FiPlus
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { productsAPI, cartAPI, reviewsAPI } from '../../api/endpoints';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';

const StarRating = ({ rating, size = 16 }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <FiStar key={s} size={size}
        className={s <= rating ? 'text-accent fill-accent' : 'text-gray-300'}
        fill={s <= rating ? 'currentColor' : 'none'} />
    ))}
  </div>
);

const ProductDetailPage = () => {
  const { slug }       = useParams();
  const navigate       = useNavigate();
  const { isAuth }     = useAuthStore();
  const { setCart }    = useCartStore();

  const [product,    setProduct]    = useState(null);
  const [rating,     setRating]     = useState(null);
  const [reviews,    setReviews]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [activeImg,  setActiveImg]  = useState(0);
  const [quantity,   setQuantity]   = useState(1);
  const [adding,     setAdding]     = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchProduct = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, ratingRes, reviewRes] = await Promise.all([
        productsAPI.getOne(slug),
        reviewsAPI.getRating(slug),
        reviewsAPI.getReviews(slug),
      ]);
      setProduct(prodRes.data);
      setRating(ratingRes.data);
      setReviews(reviewRes.data.results || reviewRes.data);
    } catch {
      toast.error('Product not found');
      navigate('/shop');
    } finally {
      setLoading(false);
    }
  }, [slug, navigate]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleAddToCart = async () => {
    if (!isAuth) { toast.error('Please login to add to cart'); return; }
    setAdding(true);
    try {
      const res = await cartAPI.addItem({ product_id: product.id, quantity });
      setCart(res.data);
      toast.success(`${quantity} item(s) added to cart`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  const handleWishlist = async () => {
    if (!isAuth) { toast.error('Please login'); return; }
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

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuth) { toast.error('Please login to review'); return; }
    setSubmitting(true);
    try {
      await reviewsAPI.createReview(slug, reviewForm);
      toast.success('Review submitted successfully');
      setReviewForm({ rating: 5, title: '', comment: '' });
      fetchProduct();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
          <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-2xl" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-6 bg-gray-100 dark:bg-gray-800 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const images = product.images?.length > 0
    ? product.images
    : [{ image: null, alt_text: product.name }];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Link to="/" className="hover:text-primary transition">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-primary transition">Shop</Link>
        <span>/</span>
        <span className="text-dark dark:text-white truncate">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">

        {/* Images */}
        <div>
          <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden mb-3">
            {images[activeImg]?.image
              ? <img src={images[activeImg].image} alt={product.name}
                     className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
            }
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition
                    ${activeImg === i ? 'border-primary' : 'border-transparent'}`}>
                  {img.image
                    ? <img src={img.image} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-gray-100 dark:bg-gray-800" />
                  }
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {product.category?.name}
            </span>
            {product.is_flash_sale && (
              <span className="px-2 py-0.5 bg-accent text-white text-xs rounded-lg font-bold">Flash Sale</span>
            )}
            {product.is_featured && (
              <span className="px-2 py-0.5 bg-primary text-white text-xs rounded-lg">Featured</span>
            )}
            <span className={`px-2 py-0.5 text-xs rounded-lg capitalize
              ${product.condition === 'new' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
              {product.condition}
            </span>
          </div>

          <h1 className="font-heading text-2xl md:text-3xl font-bold dark:text-white mb-3">
            {product.name}
          </h1>

          {rating && rating.total_reviews > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <StarRating rating={Math.round(rating.average_rating)} />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {rating.average_rating?.toFixed(1)} ({rating.total_reviews} reviews)
              </span>
            </div>
          )}

          <div className="flex items-baseline gap-3 mb-4">
            <span className="font-heading text-3xl font-bold text-primary">
              KES {Number(product.discounted_price).toLocaleString()}
            </span>
            {product.discount > 0 && (
              <>
                <span className="text-lg text-gray-400 line-through">
                  KES {Number(product.price).toLocaleString()}
                </span>
                <span className="px-2 py-0.5 bg-danger/10 text-danger text-sm font-bold rounded-lg">
                  -{product.discount}% OFF
                </span>
              </>
            )}
          </div>

          <p className={`text-sm font-medium mb-6 ${product.is_in_stock ? 'text-green-600' : 'text-danger'}`}>
            {product.is_in_stock ? `In Stock (${product.stock} available)` : 'Out of Stock'}
          </p>

          {product.is_in_stock && (
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium dark:text-white">Quantity</span>
              <div className="flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-xl">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-l-xl transition">
                  <FiMinus size={16} className="dark:text-white" />
                </button>
                <span className="w-10 text-center font-semibold dark:text-white">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-r-xl transition">
                  <FiPlus size={16} className="dark:text-white" />
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-3 mb-8">
            <button onClick={handleAddToCart}
              disabled={adding || !product.is_in_stock}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-white
                         font-semibold rounded-xl hover:bg-blue-600 transition
                         disabled:opacity-50 disabled:cursor-not-allowed">
              <FiShoppingCart size={18} />
              {adding ? 'Adding...' : 'Add to Cart'}
            </button>
            <button onClick={handleWishlist}
              className={`p-3 rounded-xl border-2 transition ${wishlisted
                ? 'bg-red-50 border-danger text-danger'
                : 'border-gray-200 dark:border-gray-700 text-gray-400 hover:border-danger hover:text-danger'}`}>
              <FiHeart size={20} fill={wishlisted ? 'currentColor' : 'none'} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: FiTruck,     label: 'Fast Delivery' },
              { icon: FiShield,    label: 'Secure Payment' },
              { icon: FiRefreshCw, label: 'Easy Returns' },
            ].map((b) => (
              <div key={b.label}
                className="flex flex-col items-center gap-1 p-3 bg-gray-50 dark:bg-gray-800
                           rounded-xl text-center">
                <b.icon size={18} className="text-primary" />
                <span className="text-xs text-gray-600 dark:text-gray-400">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
                      dark:border-gray-800 p-6 mb-8">
        <h2 className="font-heading text-lg font-bold dark:text-white mb-4">Product Description</h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed whitespace-pre-line">
          {product.description}
        </p>
      </div>

      {/* Reviews */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100
                      dark:border-gray-800 p-6">
        <h2 className="font-heading text-lg font-bold dark:text-white mb-6">
          Reviews {rating && `(${rating.total_reviews})`}
        </h2>

        {rating && rating.total_reviews > 0 && (
          <div className="flex items-center gap-8 mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div className="text-center">
              <div className="font-heading text-4xl font-bold text-primary">
                {rating.average_rating?.toFixed(1)}
              </div>
              <StarRating rating={Math.round(rating.average_rating)} />
              <p className="text-xs text-gray-500 mt-1">{rating.total_reviews} reviews</p>
            </div>
            <div className="flex-1 space-y-1">
              {[5, 4, 3, 2, 1].map((s) => {
                const count = rating[`${['one','two','three','four','five'][s-1]}_star`] || 0;
                const pct   = rating.total_reviews ? (count / rating.total_reviews) * 100 : 0;
                return (
                  <div key={s} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-3">{s}</span>
                    <FiStar size={12} className="text-accent fill-accent" fill="currentColor" />
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full transition-all"
                           style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 w-4">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-4 mb-8">
          {reviews.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
              No reviews yet. Be the first to review!
            </p>
          ) : reviews.map((r) => (
            <div key={r.id} className="border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {r.username?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold dark:text-white">{r.username}</p>
                    {r.is_verified && (
                      <span className="text-xs text-green-600">Verified Purchase</span>
                    )}
                  </div>
                </div>
                <StarRating rating={r.rating} size={14} />
              </div>
              {r.title && <p className="font-medium text-sm dark:text-white mb-1">{r.title}</p>}
              <p className="text-sm text-gray-600 dark:text-gray-400">{r.comment}</p>
            </div>
          ))}
        </div>

        {isAuth && (
          <div>
            <h3 className="font-heading font-semibold dark:text-white mb-4">Write a Review</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Your Rating</label>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map((s) => (
                    <button key={s} type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: s })}>
                      <FiStar size={24}
                        className={s <= reviewForm.rating ? 'text-accent' : 'text-gray-300'}
                        fill={s <= reviewForm.rating ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>
              <input type="text" placeholder="Review title (optional)"
                value={reviewForm.title}
                onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700
                           bg-gray-50 dark:bg-gray-800 dark:text-white text-sm focus:outline-none
                           focus:ring-2 focus:ring-primary" />
              <textarea placeholder="Share your experience with this product..."
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                required rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700
                           bg-gray-50 dark:bg-gray-800 dark:text-white text-sm focus:outline-none
                           focus:ring-2 focus:ring-primary resize-none" />
              <button type="submit" disabled={submitting}
                className="px-8 py-3 bg-primary text-white font-semibold rounded-xl
                           hover:bg-blue-600 transition disabled:opacity-60">
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;