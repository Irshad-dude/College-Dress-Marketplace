import { useEffect, useRef, useState } from 'react';
import { MdSend } from 'react-icons/md';
import { getInitials } from '../utils/helpers';
import MessageBubble from './MessageBubble';

export default function ChatWindow({ chat, messages, onSendMessage, currentUserId }) {
  const [text, setText] = useState('');
  const bottomRef = useRef(null);

  const otherUser =
    chat?.participants?.find((p) => p._id !== currentUserId) || {};

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text.trim());
    setText('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-white flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-amber-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {getInitials(otherUser.name)}
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">{otherUser.name || 'Unknown'}</p>
          {chat?.product && (
            <p className="text-xs text-gray-400 truncate max-w-xs">
              Re: {chat.product.title}
            </p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 text-sm pt-10">
            No messages yet. Start the conversation!
          </p>
        )}
        {messages.map((msg) => (
          <MessageBubble
            key={msg._id}
            message={msg}
            isOwn={msg.sender?._id === currentUserId || msg.sender === currentUserId}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="px-4 py-3 bg-white border-t border-gray-100 flex gap-3 items-center"
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="btn-primary p-2.5 rounded-xl disabled:opacity-50"
        >
          <MdSend className="text-xl" />
        </button>
      </form>
    </div>
  );
}
