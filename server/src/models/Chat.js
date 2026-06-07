const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
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
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure only one chat thread exists per buyer + seller + product combination
chatSchema.index({ buyerId: 1, sellerId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model('Chat', chatSchema);
