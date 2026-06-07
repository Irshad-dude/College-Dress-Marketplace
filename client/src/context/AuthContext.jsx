/**
 * AuthContext — C1 Security Fix Applied
 *
 * Token strategy:
 *  - Token is stored in React state (memory) only — never in localStorage.
 *  - An httpOnly cookie (set by the backend) provides session persistence across refreshes.
 *  - On app mount: call GET /api/v1/auth/profile — the cookie is sent automatically.
 *    The backend returns a fresh token which we store in memory for Socket.IO.
 *  - This makes the token invisible to XSS scripts.
 */
import { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null); // In-memory only — for Socket.IO
  const [loading, setLoading] = useState(true);

  // On mount: restore session using the httpOnly cookie (no localStorage needed)
  useEffect(() => {
    authService
      .getProfile()
      .then((res) => {
        const data = res.data;
        setUser(data.user || data);
        // Backend now returns a fresh token in getProfile response for Socket.IO use
        if (data.token) setToken(data.token);
      })
      .catch(() => {
        // Cookie invalid or expired — user needs to log in
        setUser(null);
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    const { token: t, user: u } = res.data;
    setToken(t); // Keep in memory only
    setUser(u);
    return u;
  };

  const register = async (data) => {
    const res = await authService.register(data);
    const { token: t, user: u } = res.data;
    setToken(t);
    setUser(u);
    return u;
  };

  /**
   * Logout: clear in-memory state AND call backend to clear the httpOnly cookie.
   */
  const logout = async () => {
    try {
      await authService.logout(); // Clears httpOnly cookie server-side
    } catch {
      // Ignore network errors on logout — clear local state regardless
    }
    setToken(null);
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
