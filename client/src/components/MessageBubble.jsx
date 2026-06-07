import clsx from 'clsx';
import { formatDate } from '../utils/helpers';

export default function MessageBubble({ message, isOwn }) {
  return (
    <div className={clsx('flex', isOwn ? 'justify-end' : 'justify-start')}>
      <div className="max-w-[70%]">
        <div
          className={clsx(
            'px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
            isOwn
              ? 'bg-amber-500 text-white rounded-br-sm'
              : 'bg-white text-gray-900 rounded-bl-sm shadow-sm border border-gray-100'
          )}
        >
          {message.content}
        </div>
        <p
          className={clsx(
            'text-xs text-gray-400 mt-1',
            isOwn ? 'text-right' : 'text-left'
          )}
        >
          {message.createdAt ? formatDate(message.createdAt) : ''}
        </p>
      </div>
    </div>
  );
}
