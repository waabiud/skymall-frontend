import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'https://waabiud.pythonanywhere.com/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    // check if token is expired before sending
    try {
      const payload    = JSON.parse(atob(token.split('.')[1]));
      const isExpired  = payload.exp * 1000 < Date.now();
      if (!isExpired) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // invalid token — don't send it
      localStorage.removeItem('access_token');
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('refresh_token');

      if (refresh) {
        try {
          const res = await axios.post(`${BASE_URL}/auth/token/refresh/`, { refresh });
          const newToken = res.data.access;
          localStorage.setItem('access_token', newToken);
          original.headers.Authorization = `Bearer ${newToken}`;
          return api(original);
        } catch {
          // refresh failed — clear auth and redirect to login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/#/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
