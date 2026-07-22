import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true);
  const mountedRef    = useRef(false);
  // Debounce timer for visibilitychange
  const visTimerRef   = useRef(null);
  // Prevent concurrent restoreSession calls
  const refreshingRef = useRef(false);

  /** Store token in both React state AND window global (for Axios interceptor) */
  const storeToken = useCallback((t) => {
    setToken(t);
    window.__authToken__ = t ?? null;
  }, []);

  /**
   * Restore session from httpOnly cookie.
   * Called on mount and (debounced) on tab focus.
   * @param {boolean} showExpiredToast - show a toast if 401 is received
   */
  const restoreSession = useCallback(
    async (showExpiredToast = false) => {
      // Prevent parallel calls (e.g. multiple HMR triggers)
      if (refreshingRef.current) return;
      refreshingRef.current = true;
      try {
        const res  = await authService.getProfile();
        const data = res.data;
        setUser(data.user || data);
        if (data.token) storeToken(data.token);
      } catch (err) {
        if (showExpiredToast && err.response?.status === 401) {
          toast.warning('Your session has expired. Please log in again.', {
            toastId: 'session-expired', // Prevent duplicate toasts
          });
        }
        setUser(null);
        storeToken(null);
      } finally {
        refreshingRef.current = false;
      }
    },
    [storeToken]
  );

  // Mount: restore session from httpOnly cookie (runs once)
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    restoreSession().finally(() => setLoading(false));
  }, [restoreSession]);

  // Debounced visibilitychange — only re-verify if tab was hidden for > 5 seconds
  useEffect(() => {
    let hiddenAt = null;

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        hiddenAt = Date.now();
        return;
      }
      // Only refresh if tab was away for more than 5 seconds AND user is logged in
      if (!user || !hiddenAt || Date.now() - hiddenAt < 5000) return;

      // Debounce: cancel any pending timer and set a new one
      clearTimeout(visTimerRef.current);
      visTimerRef.current = setTimeout(() => {
        restoreSession(true);
      }, 300);
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      clearTimeout(visTimerRef.current);
    };
  }, [user, restoreSession]);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    const { token: t, user: u } = res.data;
    storeToken(t);
    setUser(u);
    return u;
  };

  const register = async (data) => {
    const res = await authService.register(data);
    const { token: t, user: u } = res.data;
    storeToken(t);
    setUser(u);
    return u;
  };

  /** Logout: clear local state AND call backend to clear httpOnly cookies */
  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Network errors on logout are non-fatal
    }
    storeToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser) => setUser(updatedUser);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
