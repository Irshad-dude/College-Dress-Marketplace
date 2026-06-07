const Message = require('../models/Message');
const Chat = require('../models/Chat');
const { sendNotificationToUser } = require('../sockets/socket');
const Notification = require('../models/Notification');

/**
 * @desc    Get all messages in a chat (user must be a participant)
 * @route   GET /api/v1/messages/:chatId
 * @access  Private
 */
const getMessages = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    // Verify the requesting user is a participant in the chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found.',
      });
    }

    const isParticipant =
      chat.buyerId.toString() === userId ||
      chat.sellerId.toString() === userId;

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized. You are not a participant in this chat.',
      });
    }

    const messages = await Message.find({ chatId })
      .populate('senderId', 'name profileImage')
      .sort({ createdAt: 1 }); // Oldest first for chronological display

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Send a message in a chat
 * @route   POST /api/v1/messages
 * @access  Private
 */
const sendMessage = async (req, res, next) => {
  try {
    const { chatId, message } = req.body;
    const senderId = req.user.id;

    if (!chatId || !message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'chatId and message are required.',
      });
    }

    // Verify chat exists and user is a participant
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found.',
      });
    }

    const isParticipant =
      chat.buyerId.toString() === senderId ||
      chat.sellerId.toString() === senderId;

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized. You are not a participant in this chat.',
      });
    }

    // Create the message
    const newMessage = await Message.create({
      chatId,
      senderId,
      message: message.trim(),
    });

    // Update chat's lastMessage and updatedAt timestamp
    chat.lastMessage = message.trim();
    chat.updatedAt = new Date();
    await chat.save();

    // Populate sender info for the response
    await newMessage.populate('senderId', 'name profileImage');

    // Determine recipient (the other party in the chat)
    const recipientId =
      chat.buyerId.toString() === senderId
        ? chat.sellerId.toString()
        : chat.buyerId.toString();

    // Create a 'message' notification for the recipient
    const notification = await Notification.create({
      userId: recipientId,
      title: 'New Message',
      message: `${req.user.name}: ${message.trim().substring(0, 60)}${message.trim().length > 60 ? '...' : ''}`,
      type: 'message',
    });

    // Emit real-time notification to the recipient if they are online
    sendNotificationToUser(recipientId, notification);

    res.status(201).json({
      success: true,
      message: newMessage,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMessages, sendMessage };
