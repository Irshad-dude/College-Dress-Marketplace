const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Buyer ID is required'],
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller ID is required'],
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required'],
    },
    lastMessage: {
      type: String,
      default: '',
      maxlength: 200, // Store a preview only
    },
  },
  {
    // M15: Use Mongoose timestamps instead of manually managing updatedAt
    // Automatically adds createdAt and updatedAt fields
    timestamps: true,
  }
);

// Ensure only one chat thread exists per buyer + seller + product combination
chatSchema.index({ buyerId: 1, sellerId: 1, productId: 1 }, { unique: true });

// Index for fast chat list retrieval sorted by recent activity
chatSchema.index({ buyerId: 1, updatedAt: -1 });
chatSchema.index({ sellerId: 1, updatedAt: -1 });

module.exports = mongoose.model('Chat', chatSchema);
