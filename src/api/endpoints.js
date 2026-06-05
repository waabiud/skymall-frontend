import api from './axios';

export const authAPI = {
  register:       (data) => api.post('/auth/register/', data),
  verifyOTP:      (data) => api.post('/auth/verify-otp/', data),
  login:          (data) => api.post('/auth/login/', data),
  logout:         (data) => api.post('/auth/logout/', data),
  requestOTP:     (data) => api.post('/auth/request-otp/', data),
  getProfile:     ()     => api.get('/auth/profile/'),
  updateProfile:  (data) => api.patch('/auth/profile/', data),
  changePassword: (data) => api.post('/auth/change-password/', data),
};

export const productsAPI = {
  getAll:          (params) => api.get('/products/', { params }),
  getOne:          (slug)   => api.get(`/products/${slug}/`),
  getFeatured:     ()       => api.get('/products/featured/'),
  getFlashSale:    ()       => api.get('/products/flash-sale/'),
  getTrending:     ()       => api.get('/products/trending/'),
  getCategories:   ()       => api.get('/products/categories/'),
  getWishlist:     ()       => api.get('/products/wishlist/'),
  addWishlist:     (data)   => api.post('/products/wishlist/', data),
  removeWishlist:  (id)     => api.delete(`/products/wishlist/${id}/remove/`),
  getRecentViewed: ()       => api.get('/products/recently-viewed/'),
};

export const reviewsAPI = {
  getReviews:   (slug)       => api.get(`/products/${slug}/reviews/`),
  getRating:    (slug)       => api.get(`/products/${slug}/rating/`),
  createReview: (slug, data) => api.post(`/products/${slug}/reviews/create/`, data),
  markHelpful:  (id)         => api.post(`/products/reviews/${id}/helpful/`),
};

export const cartAPI = {
  getCart:    ()         => api.get('/cart/'),
  addItem:    (data)     => api.post('/cart/add/', data),
  updateItem: (id, data) => api.patch(`/cart/update/${id}/`, data),
  removeItem: (id)       => api.delete(`/cart/remove/${id}/`),
  clearCart:  ()         => api.delete('/cart/clear/'),
};

export const ordersAPI = {
  checkout:    (data)        => api.post('/orders/checkout/', data),
  getOrders:   ()            => api.get('/orders/'),
  getOrder:    (orderNumber) => api.get(`/orders/${orderNumber}/`),
  cancelOrder: (orderNumber) => api.post(`/orders/${orderNumber}/cancel/`),
};

export const paymentsAPI = {
  stkPush:     (data) => api.post('/payments/mpesa/stk-push/', data),
  checkStatus: (id)   => api.get(`/payments/mpesa/status/${id}/`),
};

export const vendorAPI = {
  register:         (data)         => api.post('/vendor/register/', data),
  getProfile:       ()             => api.get('/vendor/profile/'),
  updateProfile:    (data)         => api.patch('/vendor/profile/', data),
  getAnalytics:     ()             => api.get('/vendor/analytics/'),
  getProducts:      (params)       => api.get('/vendor/products/', { params }),
  getProduct:       (slug)         => api.get(`/vendor/products/${slug}/`),
  createProduct:    (data)         => api.post('/vendor/products/create/', data),
  updateProduct:    (slug, data)   => api.patch(`/vendor/products/${slug}/`, data),
  deleteProduct:    (slug)         => api.delete(`/vendor/products/${slug}/`),
  updateStock:      (slug, data)   => api.patch(`/vendor/products/${slug}/stock/`, data),
  getOrders:        (params)       => api.get('/vendor/orders/', { params }),
  updateOrder:      (num, data)    => api.patch(`/vendor/orders/${num}/update/`, data),
  getWithdrawals:   ()             => api.get('/vendor/withdrawals/'),
  requestWithdrawal:(data)         => api.post('/vendor/withdrawals/', data),
};
