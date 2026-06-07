import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import { MdSend, MdChat } from 'react-icons/md';
import { getUserChats, getMessages, sendMessage as sendMsg } from '../services/chatService';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { formatDate, getInitials, truncate } from '../utils/helpers';
import EmptyState from '../components/EmptyState';

function ConversationItem({ chat, currentUserId, isActive, onClick }) {
  const other = chat.buyerId?._id === currentUserId ? chat.sellerId : chat.buyerId;
  const product = chat.productId;
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 border-b border-gray-100 hover:bg-amber-50 transition-colors ${isActive ? 'bg-amber-50 border-l-4 border-l-amber-500' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center flex-shrink-0 text-sm">
          {getInitials(other?.name || 'U')}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900 text-sm truncate">{other?.name || 'Unknown'}</p>
          <p className="text-xs text-gray-400 truncate">{truncate(product?.title || '', 30)}</p>
          <p className="text-xs text-gray-400 truncate">{truncate(chat.lastMessage || 'No messages yet', 35)}</p>
        </div>
      </div>
    </button>
  );
}

export default function Chat() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    getUserChats()
      .then((res) => setChats(res.data.chats || res.data))
      .catch(() => toast.error('Failed to load chats'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = (msg) => {
      if (msg.chatId === activeChat?._id) {
        setMessages((prev) => [...prev, msg]);
      }
      setChats((prev) =>
        prev.map((c) => c._id === msg.chatId ? { ...c, lastMessage: msg.message } : c)
      );
    };
    socket.on('receive-message', handler);
    return () => socket.off('receive-message', handler);
  }, [socket, activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectChat = useCallback(async (chat) => {
    if (socket && activeChat) socket.emit('leave-chat', activeChat._id);
    setActiveChat(chat);
    try {
      const res = await getMessages(chat._id);
      setMessages(res.data.messages || res.data);
    } catch {
      setMessages([]);
    }
    if (socket) socket.emit('join-chat', chat._id);
  }, [socket, activeChat]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;
    setSending(true);
    const msgText = newMessage.trim();
    setNewMessage('');
    try {
      const res = await sendMsg({ chatId: activeChat._id, message: msgText });
      const saved = res.data.message || res.data;
      setMessages((prev) => [...prev, saved]);
      if (socket) socket.emit('send-message', { chatId: activeChat._id, message: msgText });
    } catch {
      toast.error('Failed to send message');
      setNewMessage(msgText);
    } finally {
      setSending(false);
    }
  };

  const getOther = (chat) => {
    if (!user || !chat) return null;
    return chat.buyerId?._id === user._id ? chat.sellerId : chat.buyerId;
  };

  return (
    <div className="flex h-[calc(100vh-120px)] -mx-6 -mt-2 rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-white">
      {/* Conversation list */}
      <div className="w-80 flex-shrink-0 border-r border-gray-100 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Messages</h2>
          <p className="text-xs text-gray-400">{chats.length} conversation{chats.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="overflow-y-auto flex-1">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="p-4 border-b border-gray-100 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100" />
                  <div className="flex-1">
                    <div className="h-3 bg-gray-100 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))
          ) : chats.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">No conversations yet</div>
          ) : (
            chats.map((chat) => (
              <ConversationItem
                key={chat._id}
                chat={chat}
                currentUserId={user?._id}
                isActive={activeChat?._id === chat._id}
                onClick={() => selectChat(chat)}
              />
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {!activeChat ? (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState
              icon={<MdChat className="text-5xl text-gray-200" />}
              title="Select a conversation"
              message="Choose a chat from the left to start messaging"
            />
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-sm">
                {getInitials(getOther(activeChat)?.name || 'U')}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{getOther(activeChat)?.name}</p>
                <p className="text-xs text-gray-400 truncate max-w-xs">{activeChat.productId?.title}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-8">No messages yet. Say hello! 👋</p>
              ) : (
                messages.map((msg, i) => {
                  const isOwn = msg.senderId === user?._id || msg.senderId?._id === user?._id;
                  return (
                    <div key={msg._id || i} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                        isOwn
                          ? 'bg-amber-500 text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                      }`}>
                        <p>{msg.message}</p>
                        <p className={`text-xs mt-1 ${isOwn ? 'text-amber-100' : 'text-gray-400'}`}>
                          {formatDate(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-gray-100 flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="input flex-1"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="btn-primary px-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MdSend />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
