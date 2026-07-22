
import axios from 'axios';

const SILENT_401_ROUTES = [
  '/auth/profile',
  '/auth/refresh-token',
  '/auth/login',
  '/auth/register',
];

const isSilentRoute = (url = '') =>
  SILENT_401_ROUTES.some((route) => url.includes(route));

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = window.__authToken__;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);
let isRefreshing = false;
let refreshQueue = [];

const processQueue = (error, token = null) => {
  refreshQueue.forEach((cb) => (error ? cb.reject(error) : cb.resolve(token)));
  refreshQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || '';
    if (
      error.response?.status === 401 &&
      error.response?.data?.expired === true &&
      !originalRequest._retried &&
      !isSilentRoute(requestUrl)
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retried = true;
      isRefreshing = true;

      try {
        const res = await api.post('/auth/refresh-token');
        const newToken = res.data?.token;
        if (newToken) {
          window.__authToken__ = newToken;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);
          return api(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        window.__authToken__ = null;
        if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    if (
      error.response?.status === 401 &&
      !originalRequest._retried &&
      !isSilentRoute(requestUrl) &&
      !window.location.pathname.startsWith('/login') &&
      !window.location.pathname.startsWith('/register')
    ) {
      window.__authToken__ = null;
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
