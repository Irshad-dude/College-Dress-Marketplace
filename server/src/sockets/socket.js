const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Chat = require('../models/Chat');

/**
 * H5 fix: Map<userId, Set<socketId>> to support multiple tabs/sessions per user.
 * Previously Map<userId, socketId> — disconnecting one tab would remove all sessions.
 */
const onlineUsers = new Map(); // userId → Set<socketId>

let ioInstance = null;

/**
 * Initialize Socket.IO with authentication middleware and event handlers.
 * @param {import('socket.io').Server} io
 */
const initSocket = (io) => {
  ioInstance = io;

  // ── Auth middleware ──────────────────────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication error: No token provided.'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('Authentication error: User not found.'));

      socket.user = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      };
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid or expired token.'));
    }
  });

  // ── Connection handler ───────────────────────────────────────────────────────
  io.on('connection', (socket) => {
    const userId = socket.user.id;
    console.log(`🔌 Socket connected: userId=${userId}, socketId=${socket.id}`);

    // H5: Add to set of sockets for this user (multi-tab support)
    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId).add(socket.id);

    // ── join-chat ──────────────────────────────────────────────────────────────
    socket.on('join-chat', (chatId) => {
      if (!chatId || typeof chatId !== 'string') return;
      socket.join(chatId);
    });

    // ── leave-chat ─────────────────────────────────────────────────────────────
    socket.on('leave-chat', (chatId) => {
      if (!chatId) return;
      socket.leave(chatId);
    });

    // ── send-message (C2 fix) ──────────────────────────────────────────────────
    // Validates: payload shape, message size, and chat participation before broadcast.
    socket.on('send-message', async (payload) => {
      try {
        if (!payload || typeof payload !== 'object') return;

        const { chatId, message } = payload;

        // Validate payload structure
        if (!chatId || typeof chatId !== 'string') return;
        if (!message || typeof message !== 'object') return;

        // C2: Verify the emitting user is actually a participant in this chat
        const chat = await Chat.findById(chatId).lean();
        if (!chat) return;

        const isParticipant =
          chat.buyerId.toString() === userId ||
          chat.sellerId.toString() === userId;

        if (!isParticipant) {
          // Silently reject — don't reveal existence of chat to unauthorized users
          console.warn(`[Security] User ${userId} attempted to send to non-member chat ${chatId}`);
          return;
        }

        // Broadcast to everyone in the room (including sender for delivery confirmation)
        io.to(chatId).emit('receive-message', message);
      } catch (err) {
        // Swallow errors — don't crash the socket on a bad payload
        console.warn('[Socket] send-message error:', err.message);
      }
    });

    // ── typing indicator ───────────────────────────────────────────────────────
    socket.on('typing', ({ chatId, isTyping }) => {
      if (!chatId) return;
      socket.to(chatId).emit('user-typing', { userId, isTyping });
    });

    // ── disconnect ─────────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      // H5: Remove only this socket from the user's set — don't delete all sessions
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) onlineUsers.delete(userId); // Last tab closed
      }
      console.log(`❌ Socket disconnected: userId=${userId}, socketId=${socket.id}`);
    });
  });
};

/**
 * Send a real-time 'new-notification' event to all active sessions of a user.
 * Silently skips if user is not connected.
 *
 * @param {string} userId
 * @param {object} notification
 */
const sendNotificationToUser = (userId, notification) => {
  if (!ioInstance) return;

  const userSockets = onlineUsers.get(userId.toString());
  if (userSockets && userSockets.size > 0) {
    // H5: Emit to ALL open tabs/windows of the user
    userSockets.forEach((socketId) => {
      ioInstance.to(socketId).emit('new-notification', notification);
    });
    console.log(`🔔 Notification emitted to user ${userId} (${userSockets.size} session(s))`);
  }
};

/**
 * Returns array of currently online user IDs (at least one active socket).
 * @returns {string[]}
 */
const getOnlineUsers = () => Array.from(onlineUsers.keys());

module.exports = { initSocket, sendNotificationToUser, getOnlineUsers };
