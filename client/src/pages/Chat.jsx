/**
 * Chat.jsx — Real-time messaging page
 *
 * Key fixes:
 *  - activeChatIdRef: used inside socket handler to avoid stale closure
 *  - senderId comparison: handles both string ID and populated {_id} object
 *  - chatId comparison: handles both plain string and ObjectId string
 *  - Messages load reliably from API on chat select
 *  - New incoming messages update chat list even when that chat isn't open
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import { MdSend, MdChat, MdArrowBack } from 'react-icons/md';
import { getUserChats, getMessages, sendMessage as sendMsg } from '../services/chatService';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { formatDate, getInitials, truncate } from '../utils/helpers';
import EmptyState from '../components/EmptyState';
import usePageTitle from '../hooks/usePageTitle';

const MAX_MESSAGE_LENGTH = 2000;

/** Helper: normalise any ID value to a plain string */
const toStr = (id) => (id && typeof id === 'object' ? id._id?.toString() ?? id.toString() : String(id ?? ''));

function ConversationItem({ chat, currentUserId, isActive, onClick, hasUnread }) {
  const other   = chat.buyerId?._id === currentUserId ? chat.sellerId : chat.buyerId;
  const product = chat.productId;
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 border-b border-gray-100 hover:bg-amber-100 transition-colors relative ${
        isActive ? 'bg-amber-100 border-l-4 border-l-amber-500' : ''
      }`}
    >
      {hasUnread && !isActive && (
        <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-amber-700" />
      )}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center flex-shrink-0 text-sm">
          {getInitials(other?.name || 'U')}
        </div>
        <div className="min-w-0 flex-1">
          <p className={`font-semibold text-sm truncate ${hasUnread && !isActive ? 'text-gray-900' : 'text-gray-700'}`}>
            {other?.name || 'Unknown'}
          </p>
          <p className="text-xs text-gray-400 truncate">{truncate(product?.title || '', 30)}</p>
          <p className={`text-xs truncate ${hasUnread && !isActive ? 'text-amber-900 font-medium' : 'text-gray-400'}`}>
            {truncate(chat.lastMessage || 'No messages yet', 35)}
          </p>
        </div>
      </div>
    </button>
  );
}

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
  usePageTitle('Chat');

  const { user }   = useAuth();
  const { socket, clearUnreadMsgCount } = useSocket();

  const [chats,          setChats]          = useState([]);
  const [activeChat,     setActiveChat]     = useState(null);
  const [messages,       setMessages]       = useState([]);
  const [unreadChats,    setUnreadChats]    = useState(new Set()); // chatIds with unseen messages
  const [newMessage,     setNewMessage]     = useState('');
  const [loadingChats,   setLoadingChats]   = useState(true);
  const [loadingMsgs,    setLoadingMsgs]    = useState(false);
  const [sending,        setSending]        = useState(false);

  const messagesEndRef = useRef(null);

  // Reset sidebar chat badge the moment user arrives on this page
  useEffect(() => {
    clearUnreadMsgCount();
  }, [clearUnreadMsgCount]);

  /**
   * ⚠ CRITICAL: Use a ref for activeChatId inside the socket handler.
   * Without this, the handler captures the *initial* null value (stale closure)
   * and never sees the updated activeChatId — so messages are always dropped.
   */
  const activeChatIdRef = useRef(null);
  useEffect(() => {
    activeChatIdRef.current = activeChat?._id ?? null;
  }, [activeChat]);

  // Load conversation list once on mount
  useEffect(() => {
    getUserChats()
      .then((res) => setChats(res.data.chats || res.data || []))
      .catch(() => toast.error('Failed to load chats'))
      .finally(() => setLoadingChats(false));
  }, []);

  // Socket: receive-message handler
  useEffect(() => {
    if (!socket) return;

    const handler = (msg) => {
      // Normalise chatId from the incoming message to a plain string
      const msgChatId = toStr(msg.chatId);
      const currentActiveChatId = activeChatIdRef.current;

      if (msgChatId && msgChatId === currentActiveChatId) {
        // This chat is currently open — append the message if not duplicate
        setMessages((prev) => {
          const alreadyExists = msg._id && prev.some((m) => toStr(m._id) === toStr(msg._id));
          if (alreadyExists) return prev;
          return [...prev, msg];
        });
      } else if (msgChatId) {
        // Different chat or no chat selected — mark it as having unread
        setUnreadChats((prev) => new Set([...prev, msgChatId]));
      }

      // Always update the chat list preview so the last message shows
      if (msgChatId) {
        setChats((prev) =>
          prev.map((c) =>
            toStr(c._id) === msgChatId
              ? { ...c, lastMessage: msg.message }
              : c
          )
        );
      }
    };

    socket.on('receive-message', handler);
    return () => socket.off('receive-message', handler);
  }, [socket]); // ← no activeChatId dependency! ref handles it

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectChat = useCallback(
    async (chat) => {
      // Leave the previous chat room
      if (socket && activeChat?._id) socket.emit('leave-chat', activeChat._id);

      setActiveChat(chat);
      setMessages([]);
      setLoadingMsgs(true);

      // Clear unread indicator for this chat
      setUnreadChats((prev) => {
        const next = new Set(prev);
        next.delete(toStr(chat._id));
        return next;
      });

      try {
        const res = await getMessages(chat._id);
        // Handle both paginated { messages: [] } and plain array responses
        const msgs = res.data.messages ?? res.data ?? [];
        setMessages(Array.isArray(msgs) ? msgs : []);
      } catch {
        setMessages([]);
        toast.error('Failed to load messages');
      } finally {
        setLoadingMsgs(false);
      }

      // Join the new room AFTER loading — guarantees no missed messages
      if (socket) socket.emit('join-chat', chat._id);
    },
    [socket, activeChat]
  );

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = newMessage.trim();
    if (!trimmed || !activeChat || sending) return;

    if (trimmed.length > MAX_MESSAGE_LENGTH) {
      toast.error(`Message too long (max ${MAX_MESSAGE_LENGTH} characters)`);
      return;
    }

    setSending(true);
    setNewMessage('');

    try {
      const res   = await sendMsg({ chatId: activeChat._id, message: trimmed });
      const saved = res.data.message;

      if (!saved) throw new Error('No message returned from server');

      // Add to local state immediately (own message)
      setMessages((prev) => {
        const alreadyExists = saved._id && prev.some((m) => toStr(m._id) === toStr(saved._id));
        return alreadyExists ? prev : [...prev, saved];
      });

      // Broadcast to recipient via socket
      if (socket) {
        socket.emit('send-message', {
          chatId: toStr(activeChat._id),
          message: {
            ...saved,
            // Ensure chatId is always a plain string so recipient handler can compare
            chatId: toStr(activeChat._id),
          },
        });
      }

      // Update chat list preview
      setChats((prev) =>
        prev.map((c) => (toStr(c._id) === toStr(activeChat._id) ? { ...c, lastMessage: trimmed } : c))
      );
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to send message';
      toast.error(errMsg);
      setNewMessage(trimmed); // Restore on failure
    } finally {
      setSending(false);
    }
  };

  const getOther = (chat) => {
    if (!user || !chat) return null;
    return toStr(chat.buyerId?._id) === toStr(user._id) ? chat.sellerId : chat.buyerId;
  };

  const isMine = (msg) =>
    toStr(msg.senderId?._id ?? msg.senderId) === toStr(user?._id);

  return (
    // On mobile: -mx-4 to bleed to edges; height fills viewport minus topbar
    <div className="flex h-[calc(100vh-80px)] -mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8 overflow-hidden bg-white" style={{ borderTop: '1px solid #f3f4f6' }}>

      {/* ── Conversation list ─────────────────────────────────────────────────
          Mobile:  visible only when NO chat is active (full width)
          Desktop: always visible, fixed 288px / 320px width
      ────────────────────────────────────────────────────────────────────── */}
      <div className={`
        flex-shrink-0 border-r border-gray-100 flex flex-col
        w-full sm:w-72 lg:w-80
        ${activeChat ? 'hidden sm:flex' : 'flex'}
      `}>
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
            <ChatListSkeleton />
          ) : chats.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">No conversations yet</div>
          ) : (
            chats.map((chat) => (
              <ConversationItem
                key={chat._id}
                chat={chat}
                currentUserId={toStr(user?._id)}
                isActive={toStr(activeChat?._id) === toStr(chat._id)}
                hasUnread={unreadChats.has(toStr(chat._id))}
                onClick={() => selectChat(chat)}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Chat area ──────────────────────────────────────────────────────────
          Mobile:  visible only when a chat IS active (full width)
          Desktop: always visible, takes remaining space
      ────────────────────────────────────────────────────────────────────── */}
      <div className={`
        flex-1 flex flex-col min-w-0
        ${activeChat ? 'flex' : 'hidden sm:flex'}
      `}>
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
            {/* Header — back button on mobile */}
            <div className="p-3 sm:p-4 border-b border-gray-100 flex items-center gap-3">
              {/* Mobile back button */}
              <button
                onClick={() => setActiveChat(null)}
                className="sm:hidden p-1.5 -ml-1 rounded-lg hover:bg-gray-100 text-gray-500"
                aria-label="Back to conversations"
              >
                <MdArrowBack className="text-xl" />
              </button>
              <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-sm flex-shrink-0">
                {getInitials(getOther(activeChat)?.name || 'U')}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{getOther(activeChat)?.name}</p>
                <p className="text-xs text-gray-400 truncate max-w-[180px] sm:max-w-xs">{activeChat.productId?.title}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
              {loadingMsgs ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin w-6 h-6 border-2 border-amber-700 border-t-transparent rounded-full" />
                </div>
              ) : messages.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-8">No messages yet. Say hello! 👋</p>
              ) : (
                messages.map((msg, i) => {
                  const mine = isMine(msg);
                  return (
                    <div key={toStr(msg._id) || i} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[75%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-sm ${
                          mine
                            ? 'bg-amber-700 text-white rounded-br-sm'
                            : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                        }`}
                      >
                        <p className="break-words">{msg.message}</p>
                        <p className={`text-xs mt-1 ${mine ? 'text-amber-100' : 'text-gray-400'}`}>
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
            <form onSubmit={handleSend} className="p-3 sm:p-4 border-t border-gray-100 flex gap-2">
              <div className="flex-1">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="input w-full text-sm"
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
                className="btn-primary px-3 sm:px-4 disabled:opacity-50 disabled:cursor-not-allowed self-start"
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


