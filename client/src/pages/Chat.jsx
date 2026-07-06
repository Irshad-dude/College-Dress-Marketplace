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

const toStr = (id) => (id && typeof id === 'object' ? id._id?.toString() ?? id.toString() : String(id ?? ''));

function ConversationItem({ chat, currentUserId, isActive, onClick, hasUnread }) {
  const other   = chat.buyerId?._id === currentUserId ? chat.sellerId : chat.buyerId;
  const product = chat.productId;
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-6 border-b border-gray-200 transition-colors relative ${
        isActive ? 'bg-black text-white' : 'bg-white hover:bg-gray-50'
      }`}
    >
      {hasUnread && !isActive && (
        <span className="absolute top-4 right-4 w-2 h-2 bg-[#E16E50]" />
      )}
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 flex items-center justify-center font-bold text-lg flex-shrink-0 border ${isActive ? 'bg-white text-black border-white' : 'bg-black text-white border-black'}`}>
          {getInitials(other?.name || 'U')}
        </div>
        <div className="min-w-0 flex-1">
          <p className={`text-xs font-bold uppercase tracking-widest truncate ${isActive ? 'text-white' : 'text-black'}`}>
            {other?.name || 'UNKNOWN'}
          </p>
          <p className={`text-[10px] font-bold uppercase tracking-widest truncate mt-1 ${isActive ? 'text-gray-400' : 'text-gray-500'}`}>
            {truncate(product?.title || '', 30)}
          </p>
          <p className={`text-[10px] font-bold uppercase tracking-widest truncate mt-1 ${hasUnread && !isActive ? 'text-[#E16E50]' : isActive ? 'text-gray-300' : 'text-gray-400'}`}>
            {truncate(chat.lastMessage || 'NO MESSAGES YET', 35)}
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
        <div key={i} className="p-6 border-b border-gray-200 animate-pulse bg-white">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-gray-200 flex-shrink-0" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-3 bg-gray-200 w-3/4" />
              <div className="h-3 bg-gray-200 w-1/2" />
              <div className="h-2 bg-gray-200 w-2/3 mt-2" />
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
  const [unreadChats,    setUnreadChats]    = useState(new Set());
  const [newMessage,     setNewMessage]     = useState('');
  const [loadingChats,   setLoadingChats]   = useState(true);
  const [loadingMsgs,    setLoadingMsgs]    = useState(false);
  const [sending,        setSending]        = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    clearUnreadMsgCount();
  }, [clearUnreadMsgCount]);

  const activeChatIdRef = useRef(null);
  useEffect(() => {
    activeChatIdRef.current = activeChat?._id ?? null;
  }, [activeChat]);

  useEffect(() => {
    getUserChats()
      .then((res) => setChats(res.data.chats || res.data || []))
      .catch(() => toast.error('Failed to load chats'))
      .finally(() => setLoadingChats(false));
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handler = (msg) => {
      const msgChatId = toStr(msg.chatId);
      const currentActiveChatId = activeChatIdRef.current;

      if (msgChatId && msgChatId === currentActiveChatId) {
        setMessages((prev) => {
          const alreadyExists = msg._id && prev.some((m) => toStr(m._id) === toStr(msg._id));
          if (alreadyExists) return prev;
          return [...prev, msg];
        });
      } else if (msgChatId) {
        setUnreadChats((prev) => new Set([...prev, msgChatId]));
      }

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
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectChat = useCallback(
    async (chat) => {
      if (socket && activeChat?._id) socket.emit('leave-chat', activeChat._id);

      setActiveChat(chat);
      setMessages([]);
      setLoadingMsgs(true);

      setUnreadChats((prev) => {
        const next = new Set(prev);
        next.delete(toStr(chat._id));
        return next;
      });

      try {
        const res = await getMessages(chat._id);
        const msgs = res.data.messages ?? res.data ?? [];
        setMessages(Array.isArray(msgs) ? msgs : []);
      } catch {
        setMessages([]);
        toast.error('Failed to load messages');
      } finally {
        setLoadingMsgs(false);
      }

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

      setMessages((prev) => {
        const alreadyExists = saved._id && prev.some((m) => toStr(m._id) === toStr(saved._id));
        return alreadyExists ? prev : [...prev, saved];
      });

      if (socket) {
        socket.emit('send-message', {
          chatId: toStr(activeChat._id),
          message: {
            ...saved,
            chatId: toStr(activeChat._id),
          },
        });
      }

      setChats((prev) =>
        prev.map((c) => (toStr(c._id) === toStr(activeChat._id) ? { ...c, lastMessage: trimmed } : c))
      );
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to send message';
      toast.error(errMsg);
      setNewMessage(trimmed);
    } finally {
      setSending(false);
    }
  };

  const getOther = (chat) => {
    if (!user || !chat) return null;
    return toStr(chat.buyerId?._id) === toStr(user._id) ? chat.sellerId : chat.buyerId;
  };

  const isMine = (msg) => toStr(msg.senderId?._id ?? msg.senderId) === toStr(user?._id);

  return (
    <div className="flex h-[calc(100vh-80px)] -mx-6 sm:-mx-10 -mt-6 sm:-mt-10 overflow-hidden bg-white border border-gray-200">

      {/* ── Conversation list ───────────────────────────────────────────────── */}
      <div className={`
        flex-shrink-0 border-r border-gray-200 flex flex-col bg-[#F5F5F5]
        w-full sm:w-[350px]
        ${activeChat ? 'hidden sm:flex' : 'flex'}
      `}>
        <div className="p-6 border-b border-gray-200 bg-white">
          <h2 className="text-xl font-bold uppercase tracking-tighter text-black">MESSAGES</h2>
          {!loadingChats && (
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1">
              {chats.length} CONVERSATION{chats.length !== 1 ? 'S' : ''}
            </p>
          )}
        </div>
        <div className="overflow-y-auto flex-1">
          {loadingChats ? (
            <ChatListSkeleton />
          ) : chats.length === 0 ? (
            <div className="p-12 text-center text-[10px] font-bold uppercase tracking-widest text-gray-400">NO CONVERSATIONS YET</div>
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

      {/* ── Chat area ────────────────────────────────────────────────────────── */}
      <div className={`
        flex-1 flex flex-col min-w-0 bg-white
        ${activeChat ? 'flex' : 'hidden sm:flex'}
      `}>
        {!activeChat ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <span className="text-6xl opacity-20 mb-6">💬</span>
            <h2 className="text-xl font-bold uppercase tracking-tighter text-black mb-2">SELECT A CONVERSATION</h2>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">CHOOSE A CHAT FROM THE LEFT TO START MESSAGING</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center gap-4 bg-[#F5F5F5]">
              <button
                onClick={() => setActiveChat(null)}
                className="sm:hidden p-2 -ml-2 text-black"
                aria-label="Back to conversations"
              >
                <MdArrowBack size={24} />
              </button>
              <div className="w-12 h-12 bg-black text-white font-bold flex items-center justify-center text-lg flex-shrink-0">
                {getInitials(getOther(activeChat)?.name || 'U')}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-widest text-black">{getOther(activeChat)?.name}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1 truncate max-w-[180px] sm:max-w-xs">{activeChat.productId?.title}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {loadingMsgs ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">LOADING MESSAGES...</div>
                </div>
              ) : messages.length === 0 ? (
                <p className="text-center text-[10px] font-bold uppercase tracking-widest text-gray-400 py-12">NO MESSAGES YET. SAY HELLO!</p>
              ) : (
                messages.map((msg, i) => {
                  const mine = isMine(msg);
                  return (
                    <div key={toStr(msg._id) || i} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[85%] sm:max-w-md px-4 sm:px-5 py-3 text-sm ${
                          mine
                            ? 'bg-black text-white'
                            : 'bg-[#F5F5F5] text-black border border-gray-200'
                        }`}
                      >
                        <p className="break-words font-medium">{msg.message}</p>
                        <p className={`text-[10px] font-bold uppercase tracking-widest mt-2 text-right ${mine ? 'text-gray-400' : 'text-gray-500'}`}>
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
            <form onSubmit={handleSend} className="p-4 sm:p-6 border-t border-gray-200 bg-white flex gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="TYPE A MESSAGE..."
                  className="w-full border-b border-black py-4 px-0 text-sm focus:outline-none focus:border-[#E16E50] font-bold tracking-wider transition-colors bg-transparent"
                  disabled={sending}
                  maxLength={MAX_MESSAGE_LENGTH}
                />
              </div>
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="btn-primary px-8 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                SEND
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
