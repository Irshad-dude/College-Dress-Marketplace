const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true,
  },
  type: {
    type: String,
    enum: ['interest', 'message', 'sold'],
    required: [true, 'Notification type is required'],
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  // Reference to the related product (for 'interest' and 'sold' notifications)
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null,
  },
  // H11: Store the buyer who expressed interest so we can deduplicate correctly.
  // Previously the duplicate check was wrong — now we check (sellerId + productId + buyerId)
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for fast notification lookup (M4 fix)
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

// H11: Compound index to enforce unique interest per buyer per product
notificationSchema.index(
  { userId: 1, productId: 1, type: 1, buyerId: 1 },
  { unique: true, partialFilterExpression: { type: 'interest', buyerId: { $ne: null } } }
);

module.exports = mongoose.model('Notification', notificationSchema);
