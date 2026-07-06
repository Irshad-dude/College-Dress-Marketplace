import usePageTitle from '../hooks/usePageTitle';
import { useEffect } from 'react';
import { MdNotifications, MdFavorite, MdChat, MdLocalOffer, MdDoneAll } from 'react-icons/md';
import { toast } from 'react-toastify';
import { useNotifications } from '../context/NotificationContext';
import { formatDate } from '../utils/helpers';

const typeIcons = {
  interest: <MdFavorite size={20} className="text-[#E16E50]" />,
  message: <MdChat size={20} className="text-black" />,
  sold: <MdLocalOffer size={20} className="text-black" />,
};

export default function Notifications() {
  usePageTitle('Notifications');
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
    <div className="max-w-[800px]">
      <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-tighter text-black mb-2">NOTIFICATIONS</h1>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
            {unreadCount > 0 ? `${unreadCount} UNREAD NOTIFICATIONS` : 'YOU ARE ALL CAUGHT UP'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn-secondary text-xs flex items-center gap-2">
            <MdDoneAll size={16} /> MARK ALL READ
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="border border-black p-16 text-center bg-[#F5F5F5] flex flex-col items-center">
          <span className="text-6xl opacity-20 mb-6">🔔</span>
          <h2 className="text-xl font-bold uppercase tracking-tighter text-black mb-2">NO NOTIFICATIONS</h2>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">WE'LL LET YOU KNOW WHEN SOMETHING HAPPENS</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.isRead && handleMarkOne(n._id)}
              className={`p-6 border transition-colors flex items-start gap-6 cursor-pointer ${
                !n.isRead 
                  ? 'border-black bg-white shadow-[4px_4px_0_0_#000]' 
                  : 'border-gray-200 bg-[#F5F5F5]'
              }`}
            >
              <div className={`w-12 h-12 border border-black flex items-center justify-center flex-shrink-0 bg-white`}>
                {typeIcons[n.type] || <MdNotifications size={20} className="text-black" />}
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <p className={`text-xs font-bold uppercase tracking-widest ${!n.isRead ? 'text-black' : 'text-gray-500'}`}>
                    {n.title}
                  </p>
                  {!n.isRead && (
                    <span className="w-2 h-2 bg-[#E16E50] flex-shrink-0 mt-1" />
                  )}
                </div>
                <p className={`text-sm mb-4 ${!n.isRead ? 'text-black font-medium' : 'text-gray-500'}`}>
                  {n.message}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  {formatDate(n.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
