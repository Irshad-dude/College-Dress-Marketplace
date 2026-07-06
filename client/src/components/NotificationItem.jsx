import { MdFavorite, MdChat, MdSell, MdInfo } from 'react-icons/md';
import { formatDate } from '../utils/helpers';
import clsx from 'clsx';

const typeIcons = {
  interest: <MdFavorite className="text-rose-500" />,
  message: <MdChat className="text-blue-500" />,
  sold: <MdSell className="text-green-500" />,
  default: <MdInfo className="text-amber-800" />,
};

export default function NotificationItem({ notification }) {
  const { type, title, message, createdAt, read } = notification;
  const icon = typeIcons[type] || typeIcons.default;

  return (
    <div
      className={clsx(
        'flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors',
        !read && 'bg-amber-100/40'
      )}
    >
      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={clsx('text-sm', !read ? 'font-semibold text-gray-900' : 'text-gray-700')}>
          {title}
        </p>
        {message && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{message}</p>}
        {createdAt && (
          <p className="text-xs text-gray-400 mt-1">{formatDate(createdAt)}</p>
        )}
      </div>
      {!read && <div className="w-2 h-2 rounded-full bg-amber-700 mt-2 flex-shrink-0" />}
    </div>
  );
}
