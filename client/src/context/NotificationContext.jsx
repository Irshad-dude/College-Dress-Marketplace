import { createContext, useContext, useState, useCallback } from 'react';
import * as notificationService from '../services/notificationService';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const res  = await notificationService.getNotifications();
      const data = res.data.notifications || res.data;
      setNotifications(Array.isArray(data) ? data : []);
      setUnreadCount(res.data.unreadCount ?? data.filter((n) => !n.isRead).length);
    } catch {
      // silently fail — user may not be logged in yet
    }
  }, []);

  /**
   * Mark all notifications as read.
   * Optimistically updates UI, then calls API.
   * Throws on API error so calling page can show a toast.
   */
  const markAllRead = useCallback(async () => {
    // Optimistic update — instant UI feedback
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    // Persist to server — rethrow so Notifications.jsx can catch and show toast
    await notificationService.markAllRead();
  }, []);

  /**
   * Mark a single notification as read.
   */
  const markOneRead = useCallback(async (id) => {
    try {
      await notificationService.markOneRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // silently fail for single-item read
    }
  }, []);

  /**
   * Prepend a new incoming notification (from Socket.IO new-notification event).
   */
  const addNotification = useCallback((notification) => {
    setNotifications((prev) => {
      // Deduplicate by _id in case the socket fires twice
      const exists = prev.some((n) => n._id && n._id === notification._id);
      if (exists) return prev;
      return [notification, ...prev];
    });
    setUnreadCount((prev) => prev + 1);
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, fetchNotifications, markAllRead, markOneRead, addNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};
