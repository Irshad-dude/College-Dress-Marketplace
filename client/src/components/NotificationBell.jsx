import { useState, useRef, useEffect } from 'react';
import { MdNotifications } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import NotificationItem from './NotificationItem';

export default function NotificationBell() {
  const { notifications, unreadCount, markAllRead, fetchNotifications } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const latest5 = notifications.slice(0, 5);
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
      >
        <MdNotifications className="text-2xl" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-amber-700 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-amber-800 hover:text-amber-900 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>
          {/* Items */}
          <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
            {latest5.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">No notifications yet</p>
            ) : (
              latest5.map((n) => <NotificationItem key={n._id} notification={n} />)
            )}
          </div>
          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-100 text-center">
            <Link
              to="/dashboard/notifications"
              onClick={() => setOpen(false)}
              className="text-xs text-amber-800 hover:text-amber-900 font-semibold">
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
