const mongoose = require('mongoose');
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const { sendNotificationToUser, getOnlineUsers } = require('../sockets/socket');
const Notification = require('../models/Notification');
const logger = require('../utils/logger');

/**
 * @desc    Get messages for a chat with pagination (H9)
 * @route   GET /api/v1/messages/:chatId?page=1&limit=50
 * @access  Private — must be a chat participant
 */
const getMessages = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    // Validate ObjectId to prevent CastErrors
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ success: false, message: 'Invalid chat ID.' });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found.' });

    const isParticipant = chat.buyerId.toString() === userId || chat.sellerId.toString() === userId;
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Not authorized. You are not a participant in this chat.' });
    }

    // H9: Pagination — default 50 messages per page, newest page first
    const page  = Math.max(1, parseInt(req.query.page, 10)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit, 10) || 50);
    const skip  = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      Message.find({ chatId })
        .populate('senderId', 'name profileImage')
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit),
      Message.countDocuments({ chatId }),
    ]);

    res.status(200).json({
      success: true,
      messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Send a message in a chat
 * @route   POST /api/v1/messages
 * @access  Private — must be a chat participant
 */
const sendMessage = async (req, res, next) => {
  try {
    const { chatId, message } = req.body;
    const senderId = req.user.id;

    if (!chatId || !message?.trim()) {
      return res.status(400).json({ success: false, message: 'chatId and message are required.' });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ success: false, message: 'Invalid chat ID.' });
    }

    // C2: Message length limit
    if (message.trim().length > 2000) {
      return res.status(400).json({ success: false, message: 'Message exceeds 2000 character limit.' });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found.' });

    const isParticipant = chat.buyerId.toString() === senderId || chat.sellerId.toString() === senderId;
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Not authorized. You are not a participant in this chat.' });
    }

    const newMessage = await Message.create({
      chatId,
      senderId,
      message: message.trim(),
    });

    // M15: With timestamps:true on Chat, updatedAt is auto-managed
    // We only need to update lastMessage explicitly
    await Chat.findByIdAndUpdate(chatId, { lastMessage: message.trim() });

    await newMessage.populate('senderId', 'name profileImage');

    const recipientId = chat.buyerId.toString() === senderId
      ? chat.sellerId.toString()
      : chat.buyerId.toString();

    // H8: Only create a DB notification if the recipient is OFFLINE
    // Online users receive the real-time socket event — no need for a stored notification
    const onlineUserIds = getOnlineUsers();
    if (!onlineUserIds.includes(recipientId)) {
      const notification = await Notification.create({
        userId: recipientId,
        title: 'New Message',
        message: `${req.user.name}: ${message.trim().substring(0, 60)}${message.trim().length > 60 ? '...' : ''}`,
        type: 'message',
      });
      sendNotificationToUser(recipientId, notification);
      logger.info({ recipientId }, 'Offline message notification created');
    } else {
      // Emit real-time notification only (no DB record)
      sendNotificationToUser(recipientId, {
        title: 'New Message',
        message: `${req.user.name}: ${message.trim().substring(0, 60)}`,
        type: 'message',
        isRead: false,
        createdAt: new Date(),
      });
    }

    res.status(201).json({ success: true, message: newMessage });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMessages, sendMessage };
