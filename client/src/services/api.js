/**
 * api.js — Axios instance with auth interceptors
 *
 * C1: withCredentials sends httpOnly cookies automatically
 * H6: On 401 with expired:true, auto-call /auth/refresh-token once, then retry
 * M17: On unrecoverable 401, redirect to /login
 */
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // C1: Send httpOnly cookies with every request
});

// ── Request interceptor — attach Bearer token for Socket.IO compatibility ──────
// The primary auth method is the httpOnly cookie, but we also attach the
// in-memory token (if available) as Bearer so API clients work too.
api.interceptors.request.use(
  (config) => {
    const token = window.__authToken__; // Set by AuthContext after login/register
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — H6 token refresh + M17 auto-logout ─────────────────
let isRefreshing = false;
let refreshQueue = []; // Queued requests waiting for token refresh

const processQueue = (error, token = null) => {
  refreshQueue.forEach((cb) => (error ? cb.reject(error) : cb.resolve(token)));
  refreshQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // H6: If 401 and token was expired (not missing), try to refresh once
    if (
      error.response?.status === 401 &&
      error.response?.data?.expired === true &&
      !originalRequest._retried
    ) {
      if (isRefreshing) {
        // Another request is already refreshing — queue this one
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
          window.__authToken__ = newToken; // Update in-memory token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);
          return api(originalRequest); // Retry original request with new token
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh failed — force logout
        window.__authToken__ = null;
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // M17: For any other 401 (no token at all), redirect to login
    if (error.response?.status === 401 && !originalRequest._retried) {
      window.__authToken__ = null;
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
