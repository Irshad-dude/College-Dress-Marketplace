import { useEffect } from 'react';
import { MdNotifications, MdFavorite, MdChat, MdLocalOffer, MdDoneAll } from 'react-icons/md';
import { toast } from 'react-toastify';
import { useNotifications } from '../context/NotificationContext';
import { formatDate } from '../utils/helpers';
import EmptyState from '../components/EmptyState';

const typeIcons = {
  interest: <MdFavorite className="text-red-400" />,
  message: <MdChat className="text-blue-400" />,
  sold: <MdLocalOffer className="text-green-400" />,
};

export default function Notifications() {
  const { notifications, unreadCount, fetchNotifications, markAllRead, markOneRead } = useNotifications();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleMarkOne = async (id) => {
    try {
      await markOneRead(id);
    } catch {}
  };

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn-secondary flex items-center gap-2 text-sm">
            <MdDoneAll /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={<MdNotifications className="text-5xl text-gray-200" />}
          title="No notifications"
          message="You'll be notified when buyers show interest or message you"
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.isRead && handleMarkOne(n._id)}
              className={`card p-4 flex items-start gap-4 cursor-pointer transition-colors ${
                !n.isRead ? 'border-l-4 border-l-amber-500 bg-amber-50/30' : ''
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${
                n.type === 'interest' ? 'bg-red-50' : n.type === 'message' ? 'bg-blue-50' : 'bg-green-50'
              }`}>
                {typeIcons[n.type] || <MdNotifications className="text-gray-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`font-semibold text-sm ${!n.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                    {n.title}
                  </p>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0 mt-1.5" />
                  )}
                </div>
                <p className="text-gray-500 text-sm mt-0.5">{n.message}</p>
                <p className="text-gray-400 text-xs mt-1">{formatDate(n.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
