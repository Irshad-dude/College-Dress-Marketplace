const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Map of userId (string) -> socketId (string)
 * Used to target real-time events at specific connected users.
 */
const onlineUsers = new Map();

/** Reference to the Socket.IO server instance (set in initSocket) */
let ioInstance = null;

/**
 * Initialize Socket.IO with authentication and event handlers.
 *
 * @param {import('socket.io').Server} io - The Socket.IO server instance
 */
const initSocket = (io) => {
  ioInstance = io;

  // ── Authentication middleware ──────────────────────────────────────────────
  // Verify JWT on every new connection. Reject the connection if invalid.
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error('Authentication error: No token provided.'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return next(new Error('Authentication error: User not found.'));
      }

      // Attach user info to the socket for use in event handlers
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

  // ── Connection handler ─────────────────────────────────────────────────────
  io.on('connection', (socket) => {
    const userId = socket.user.id;
    console.log(`🔌 Socket connected: userId=${userId}, socketId=${socket.id}`);

    // Register the user's socket mapping
    onlineUsers.set(userId, socket.id);

    // ── Event: join-chat ─────────────────────────────────────────────────────
    // Client emits this to subscribe to a specific chat room.
    socket.on('join-chat', (chatId) => {
      if (!chatId) return;
      socket.join(chatId);
      console.log(`💬 User ${userId} joined chat room: ${chatId}`);
    });

    // ── Event: leave-chat ────────────────────────────────────────────────────
    socket.on('leave-chat', (chatId) => {
      if (!chatId) return;
      socket.leave(chatId);
      console.log(`🚪 User ${userId} left chat room: ${chatId}`);
    });

    // ── Event: send-message ──────────────────────────────────────────────────
    // Broadcasts a new message to all sockets in the chat room.
    // Payload: { chatId, message } (message object from the DB)
    socket.on('send-message', (payload) => {
      if (!payload || !payload.chatId) return;

      const { chatId, message } = payload;

      // Broadcast to everyone in the room (including sender for confirmation)
      io.to(chatId).emit('receive-message', message);
      console.log(`📨 Message broadcast to chat ${chatId} by user ${userId}`);
    });

    // ── Event: typing ────────────────────────────────────────────────────────
    // Broadcast typing status to the other party in the chat room.
    socket.on('typing', ({ chatId, isTyping }) => {
      if (!chatId) return;
      socket.to(chatId).emit('user-typing', { userId, isTyping });
    });

    // ── Event: disconnect ────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      console.log(`❌ Socket disconnected: userId=${userId}, socketId=${socket.id}`);
    });
  });
};

/**
 * Send a real-time 'new-notification' event to a specific user by their userId.
 * If the user is not currently connected, the event is silently skipped.
 *
 * @param {string} userId - The target user's MongoDB ObjectId string
 * @param {object} notification - The notification document to emit
 */
const sendNotificationToUser = (userId, notification) => {
  if (!ioInstance) return;

  const socketId = onlineUsers.get(userId.toString());
  if (socketId) {
    ioInstance.to(socketId).emit('new-notification', notification);
    console.log(`🔔 Notification emitted to user ${userId}`);
  }
};

/**
 * Get the set of currently online user IDs.
 * Useful for presence indicators.
 *
 * @returns {string[]} Array of currently connected user IDs
 */
const getOnlineUsers = () => Array.from(onlineUsers.keys());

module.exports = { initSocket, sendNotificationToUser, getOnlineUsers };
