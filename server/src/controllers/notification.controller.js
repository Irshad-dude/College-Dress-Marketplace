const Notification = require('../models/Notification');
const Product = require('../models/Product');
const { sendNotificationToUser } = require('../sockets/socket');

/**
 * @desc    Get all notifications for the authenticated user, newest first
 * @route   GET /api/v1/notifications
 * @access  Private
 */
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('productId', 'title images');

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    res.status(200).json({
      success: true,
      notifications,
      unreadCount,
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

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    const buyerId = req.user.id;
    const sellerId = product.sellerId.toString();

    // Prevent a seller from expressing interest in their own product
    if (buyerId === sellerId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot express interest in your own listing.',
      });
    }

    // Check if this buyer already expressed interest (avoid duplicate notifications)
    const existing = await Notification.findOne({
      userId: sellerId,
      productId: product._id,
      type: 'interest',
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        message: 'Interest already recorded.',
      });
    }

    // Create the notification for the seller
    const notification = await Notification.create({
      userId: sellerId,
      title: 'New Interest',
      message: `${req.user.name} is interested in your listing "${product.title}".`,
      type: 'interest',
      productId: product._id,
    });

    // Emit real-time notification to the seller if they are online
    sendNotificationToUser(sellerId, notification);

    res.status(201).json({
      success: true,
      message: 'Interest notification sent to seller.',
      notification,
    });
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
