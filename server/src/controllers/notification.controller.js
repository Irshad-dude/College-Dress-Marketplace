const Notification = require('../models/Notification');
const Product = require('../models/Product');
const { sendNotificationToUser } = require('../sockets/socket');
const logger = require('../utils/logger');

/**
 * @desc    Get all notifications for the authenticated user, newest first
 * @route   GET /api/v1/notifications
 * @access  Private
 */
const getNotifications = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, parseInt(req.query.limit, 10) || 20);
    const skip  = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('productId', 'title images'),
      Notification.countDocuments({ userId: req.user.id }),
    ]);

    const unreadCount = await Notification.countDocuments({ userId: req.user.id, isRead: false });

    res.status(200).json({
      success: true,
      notifications,
      unreadCount,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark all notifications as read for the authenticated user
 * @route   PATCH /api/v1/notifications/read
 * @access  Private
 */
const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark a single notification as read
 * @route   PATCH /api/v1/notifications/:id/read
 * @access  Private
 */
const markOneRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user.id, // Ensure ownership
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found.',
      });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
      notification,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Internal helper — called from routes when a buyer marks interest in a product.
 *          Creates an 'interest' notification for the seller and emits it in real time.
 * @route   POST /api/v1/products/:id/interest
 * @access  Private
 */
const createInterestNotification = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    const buyerId  = req.user.id;
    const sellerId = product.sellerId.toString();

    if (buyerId === sellerId) {
      return res.status(400).json({ success: false, message: 'You cannot express interest in your own listing.' });
    }

    // H11: CORRECT deduplication — check for THIS buyer's interest in THIS product.
    // Previous code queried only by sellerId+productId, which blocked ALL buyers after the first.
    const existing = await Notification.findOne({
      userId: sellerId,
      productId: product._id,
      type: 'interest',
      buyerId: buyerId, // <-- KEY FIX: scope to the specific buyer
    });

    if (existing) {
      return res.status(200).json({ success: true, message: 'Interest already recorded.' });
    }

    const notification = await Notification.create({
      userId: sellerId,
      title: 'New Interest',
      message: `${req.user.name} is interested in your listing "${product.title}".`,
      type: 'interest',
      productId: product._id,
      buyerId: buyerId, // H11: Store for correct deduplication
    });

    sendNotificationToUser(sellerId, notification);
    logger.info({ sellerId, buyerId, productId: product._id }, 'Interest notification created');

    res.status(201).json({ success: true, message: 'Interest notification sent to seller.', notification });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAllRead,
  markOneRead,
  createInterestNotification,
};
