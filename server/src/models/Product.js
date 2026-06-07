const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller ID is required'],
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  size: {
    type: String,
    required: [true, 'Size is required'],
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'],
  },
  condition: {
    type: String,
    required: [true, 'Condition is required'],
    enum: ['New', 'Like New', 'Good', 'Fair'],
  },
  images: {
    type: [String],
    default: [],
  },
  status: {
    type: String,
    enum: ['available', 'sold'],
    default: 'available',
  },
  collegeName: {
    type: String,
    required: [true, 'College name is required'],
    trim: true,
  },
  department: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Full-text search index on title, collegeName, and description
productSchema.index({ title: 'text', collegeName: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
