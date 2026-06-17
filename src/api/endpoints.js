import api from './axios';

export const authAPI = {
  register:      (data)        => api.post('/auth/register/', data),
  verifyOTP:     (data)        => api.post('/auth/verify-otp/', data),
  login:         (data)        => api.post('/auth/login/', data),
  logout:        (data)        => api.post('/auth/logout/', data),
  requestOTP:    (data)        => api.post('/auth/request-otp/', data),
  refreshToken:  (data)        => api.post('/auth/token/refresh/', data),
  getProfile:    ()            => api.get('/auth/profile/'),
  updateProfile: (data)        => api.patch('/auth/profile/', data),
  changePassword:(data)        => api.post('/auth/change-password/', data),
  googleAuth:    (data)        => api.post('/auth/google/', data),
  facebookAuth:  (data)        => api.post('/auth/facebook/', data),
};

export const productsAPI = {
  getAll:        (params)      => api.get('/products/', { params }),
  getDetail:     (slug)        => api.get(`/products/${slug}/`),
  getFeatured:   ()            => api.get('/products/featured/'),
  getFlashSale:  ()            => api.get('/products/flash-sale/'),
  getTrending:   ()            => api.get('/products/trending/'),
  getCategories: ()            => api.get('/products/categories/'),
  getWishlist:   ()            => api.get('/products/wishlist/'),
  addWishlist:   (data)        => api.post('/products/wishlist/', data),
  removeWishlist:(id)          => api.delete(`/products/wishlist/${id}/remove/`),
  getRecent:     ()            => api.get('/products/recently-viewed/'),
};

export const cartAPI = {
  getCart:       ()            => api.get('/cart/'),
  addItem:       (data)        => api.post('/cart/add/', data),
  updateItem:    (id, data)    => api.patch(`/cart/update/${id}/`, data),
  removeItem:    (id)          => api.delete(`/cart/remove/${id}/`),
  clearCart:     ()            => api.delete('/cart/clear/'),
};

export const ordersAPI = {
  checkout:      (data)        => api.post('/orders/checkout/', data),
  getOrders:     ()            => api.get('/orders/'),
  getOrder:      (orderNumber) => api.get(`/orders/${orderNumber}/`),
  cancelOrder:   (orderNumber) => api.post(`/orders/${orderNumber}/cancel/`),
};

export const paymentsAPI = {
  stkPush:       (data)        => api.post('/payments/mpesa/stk-push/', data),
  checkStatus:   (checkoutId)  => api.get(`/payments/mpesa/status/${checkoutId}/`),
};

export const vendorAPI = {
  // profile & analytics
  getProfile:    ()            => api.get('/vendor/profile/'),
  updateProfile: (data)        => api.patch('/vendor/profile/', data),
  getAnalytics:  ()            => api.get('/vendor/analytics/'),

  // products
  getProducts:   (params)      => api.get('/vendor/products/', { params }),
  createProduct: (data)        => api.post('/vendor/products/create/', data),
  updateProduct: (slug, data)  => api.patch(`/vendor/products/${slug}/`, data),
  deleteProduct: (slug)        => api.delete(`/vendor/products/${slug}/`),
  updateStock:   (slug, data)  => api.patch(`/vendor/products/${slug}/stock/`, data),
  uploadImage:   (slug, data)  => api.post(`/products/manage/${slug}/images/`, data),

  // orders
  getOrders:     (params)      => api.get('/vendor/orders/', { params }),
  updateOrder:   (num, data)   => api.patch(`/vendor/orders/${num}/update/`, data),

  // withdrawals
  getWithdrawals:()            => api.get('/vendor/withdrawals/'),
  requestWithdrawal:(data)     => api.post('/vendor/withdrawals/', data),
};

export const reviewsAPI = {
  getReviews:    (productSlug) => api.get(`/reviews/${productSlug}/`),
  addReview:     (data)        => api.post('/reviews/', data),
};
