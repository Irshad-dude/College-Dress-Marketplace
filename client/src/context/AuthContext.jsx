/**
 * AuthContext — C1 + H6 + M17 fixes applied
 *
 * Token strategy:
 *  - Access token (15min): httpOnly 'jwt' cookie for API + window.__authToken__ for Socket.IO
 *  - Refresh token (7d): httpOnly 'refreshToken' cookie only — never exposed to JS
 *  - On app mount: call getProfile() — cookie is sent automatically
 *  - On tab focus (visibilitychange): silently re-verify session (M17)
 *  - Token stored in window.__authToken__ (not localStorage — XSS-safe)
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null); // In-memory — for Socket.IO auth
  const [loading, setLoading] = useState(true);

  /** Store token in both React state AND window global (for Axios interceptor) */
  const storeToken = useCallback((t) => {
    setToken(t);
    window.__authToken__ = t || null;
  }, []);

  /** Restore session from httpOnly cookie — called on mount and tab focus */
  const restoreSession = useCallback(async (showExpiredToast = false) => {
    try {
      const res = await authService.getProfile();
      const { user: u, token: t } = res.data;
      setUser(u);
      storeToken(t);
    } catch (err) {
      if (showExpiredToast && err.response?.status === 401) {
        toast.warning('Your session has expired. Please log in again.', { toastId: 'session-expired' });
      }
      setUser(null);
      storeToken(null);
    }
  }, [storeToken]);

  // Mount: restore session from cookie
  useEffect(() => {
    restoreSession().finally(() => setLoading(false));
  }, [restoreSession]);

  // M17: On tab refocus, silently verify session is still valid
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        restoreSession(true); // Show toast if session expired while away
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
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
      // Network errors on logout are non-fatal — clear local state regardless
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
