const Chat = require('../models/Chat');

/**
 * @desc    Create a new chat or return the existing one between buyer and seller for a product
 * @route   POST /api/v1/chats
 * @access  Private
 */
const createOrGetChat = async (req, res, next) => {
  try {
    const { sellerId, productId } = req.body;
    const buyerId = req.user.id;

    // Prevent a seller from chatting with themselves
    if (buyerId === sellerId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot start a chat with yourself.',
      });
    }

    // Use findOneAndUpdate with upsert to atomically find-or-create
    let chat = await Chat.findOne({ buyerId, sellerId, productId });

    if (!chat) {
      chat = await Chat.create({ buyerId, sellerId, productId });
    }

    // Populate with participant and product details
    chat = await chat.populate([
      { path: 'buyerId', select: 'name email profileImage' },
      { path: 'sellerId', select: 'name email profileImage' },
      { path: 'productId', select: 'title images price status' },
    ]);

    res.status(200).json({
      success: true,
      chat,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all chats for the currently authenticated user (as buyer or seller)
 * @route   GET /api/v1/chats
 * @access  Private
 */
const getUserChats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Fetch chats where the user is either buyer or seller, newest first
    const chats = await Chat.find({
      $or: [{ buyerId: userId }, { sellerId: userId }],
    })
      .populate('buyerId', 'name email profileImage')
      .populate('sellerId', 'name email profileImage')
      .populate('productId', 'title images price status')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      chats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrGetChat, getUserChats };
