/**
 * Chat.jsx — Real-time chat page
 *
 * Fixes applied:
 *  M18: Deduplicate messages — socket events and API responses no longer double-append
 *  M20: Chat list loading skeleton
 *  L25: usePageTitle
 *  C2:  Message length validation on frontend (2000 char limit)
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import { MdSend, MdChat } from 'react-icons/md';
import { getUserChats, getMessages, sendMessage as sendMsg } from '../services/chatService';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { formatDate, getInitials, truncate } from '../utils/helpers';
import EmptyState from '../components/EmptyState';
import usePageTitle from '../hooks/usePageTitle';

const MAX_MESSAGE_LENGTH = 2000;

function ConversationItem({ chat, currentUserId, isActive, onClick }) {
  const other   = chat.buyerId?._id === currentUserId ? chat.sellerId : chat.buyerId;
  const product = chat.productId;
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 border-b border-gray-100 hover:bg-amber-50 transition-colors ${
        isActive ? 'bg-amber-50 border-l-4 border-l-amber-500' : ''
      }`}
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

/** M20: Chat list skeleton */
function ChatListSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-4 border-b border-gray-100 animate-pulse">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex-shrink-0" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-3 bg-gray-100 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
              <div className="h-2 bg-gray-100 rounded w-2/3" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

export default function Chat() {
  usePageTitle('Chat'); // L25

  const { user }    = useAuth();
  const { socket }  = useSocket();
  const [chats, setChats]         = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages]   = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingChats, setLoadingChats]   = useState(true); // M20
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const activeChatId = activeChat?._id;

  // Load conversation list
  useEffect(() => {
    getUserChats()
      .then((res) => setChats(res.data.chats || res.data))
      .catch(() => toast.error('Failed to load chats'))
      .finally(() => setLoadingChats(false));
  }, []);

  // M18: Socket receive-message — deduplicate by _id before appending
  useEffect(() => {
    if (!socket) return;

    const handler = (msg) => {
      if (msg.chatId === activeChatId || msg.chatId?._id === activeChatId) {
        setMessages((prev) => {
          // M18: Skip if we already have this message (sent by us via API response)
          const alreadyExists = prev.some((m) => m._id && m._id === msg._id);
          if (alreadyExists) return prev;
          return [...prev, msg];
        });
      }
      // Update chat preview
      setChats((prev) =>
        prev.map((c) => (c._id === (msg.chatId?._id || msg.chatId) ? { ...c, lastMessage: msg.message } : c))
      );
    };

    socket.on('receive-message', handler);
    return () => socket.off('receive-message', handler);
  }, [socket, activeChatId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectChat = useCallback(
    async (chat) => {
      if (socket && activeChat) socket.emit('leave-chat', activeChat._id);
      setActiveChat(chat);
      setMessages([]);
      setLoadingMessages(true);
      try {
        const res = await getMessages(chat._id);
        setMessages(res.data.messages || res.data);
      } catch {
        setMessages([]);
        toast.error('Failed to load messages');
      } finally {
        setLoadingMessages(false);
      }
      if (socket) socket.emit('join-chat', chat._id);
    },
    [socket, activeChat]
  );

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || sending) return;

    // C2: Enforce message length on frontend too
    if (newMessage.trim().length > MAX_MESSAGE_LENGTH) {
      toast.error(`Message too long (max ${MAX_MESSAGE_LENGTH} characters)`);
      return;
    }

    setSending(true);
    const msgText = newMessage.trim();
    setNewMessage('');

    try {
      const res  = await sendMsg({ chatId: activeChat._id, message: msgText });
      const saved = res.data.message;

      // M18: Add API response message to state directly
      // The socket 'receive-message' event will also fire for this message.
      // The deduplication logic in the socket handler above will prevent double-adding.
      setMessages((prev) => {
        const alreadyExists = prev.some((m) => m._id && m._id === saved._id);
        return alreadyExists ? prev : [...prev, saved];
      });

      // Emit to socket so the OTHER user receives it in real time
      if (socket) socket.emit('send-message', { chatId: activeChat._id, message: saved });

      // Update chat list preview
      setChats((prev) =>
        prev.map((c) => (c._id === activeChat._id ? { ...c, lastMessage: msgText } : c))
      );
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to send message';
      toast.error(errMsg);
      setNewMessage(msgText); // Restore on failure
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
          {!loadingChats && (
            <p className="text-xs text-gray-400">
              {chats.length} conversation{chats.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className="overflow-y-auto flex-1">
          {loadingChats ? (
            <ChatListSkeleton /> // M20: skeleton while loading
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
      <div className="flex-1 flex flex-col min-w-0">
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
              <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-sm flex-shrink-0">
                {getInitials(getOther(activeChat)?.name || 'U')}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{getOther(activeChat)?.name}</p>
                <p className="text-xs text-gray-400 truncate max-w-xs">{activeChat.productId?.title}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full" />
                </div>
              ) : messages.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-8">No messages yet. Say hello! 👋</p>
              ) : (
                messages.map((msg, i) => {
                  const isOwn = msg.senderId === user?._id || msg.senderId?._id === user?._id;
                  return (
                    <div key={msg._id || i} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                          isOwn
                            ? 'bg-amber-500 text-white rounded-br-sm'
                            : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                        }`}
                      >
                        <p className="break-words">{msg.message}</p>
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
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="input w-full"
                  disabled={sending}
                  maxLength={MAX_MESSAGE_LENGTH}
                />
                {newMessage.length > MAX_MESSAGE_LENGTH * 0.9 && (
                  <p className="text-xs text-gray-400 mt-1">
                    {newMessage.length}/{MAX_MESSAGE_LENGTH}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="btn-primary px-4 disabled:opacity-50 disabled:cursor-not-allowed self-start"
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
