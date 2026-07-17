const Product = require('../models/Product');
const Notification = require('../models/Notification');
const cloudinary = require('../config/cloudinary');

/**
 * @desc    Create a new product listing
 * @route   POST /api/v1/products
 * @access  Private
 */
const createProduct = async (req, res, next) => {
  try {
    const { title, description, price, size, condition, department } = req.body;

    // Securely inherit collegeName from the logged-in user
    const User = require('../models/User');
    const seller = await User.findById(req.user.id);
    if (!seller || !seller.collegeName) {
      return res.status(403).json({ success: false, message: 'Seller college information is missing.' });
    }
    const collegeName = seller.collegeName;

    // Images come from uploadImages middleware → req.cloudinaryUrls
    // Fallback: if images[] URLs were sent as JSON strings in body
    const images = req.cloudinaryUrls && req.cloudinaryUrls.length > 0
      ? req.cloudinaryUrls
      : req.body.images
        ? (Array.isArray(req.body.images) ? req.body.images : [req.body.images])
        : [];

    if (!title || !description || !price || !size || !condition) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, price, size, and condition are required.',
      });
    }

    const product = await Product.create({
      sellerId: req.user.id,
      title,
      description,
      price: Number(price),
      size,
      condition,
      images,
      collegeName,
      department,
    });

    res.status(201).json({
      success: true,
      message: 'Product listed successfully.',
      product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all products with optional filtering and pagination
 * @route   GET /api/v1/products
 * @access  Public
 * @query   search, size, condition, minPrice, maxPrice, page, limit, status
 */
const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      size,
      condition,
      minPrice,
      maxPrice,
      status,
      collegeName,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};

    // Full-text search on title, collegeName, description
    if (search && search.trim()) {
      filter.$text = { $search: search.trim() };
    }

    if (size) filter.size = { $in: size.split(',') };
    if (condition) filter.condition = { $in: condition.split(',') };
    if (status) filter.status = status;
    if (collegeName) filter.collegeName = collegeName;

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('sellerId', 'name email profileImage')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      products,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single product by ID
 * @route   GET /api/v1/products/:id
 * @access  Public
 */
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'sellerId',
      'name email profileImage'
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a product (seller only)
 * @route   PUT /api/v1/products/:id
 * @access  Private
 */
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    // Only the seller who listed the product can update it
    if (product.sellerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized. You can only update your own listings.',
      });
    }

    const allowedFields = ['title', 'description', 'price', 'size', 'condition', 'collegeName', 'department', 'status'];
    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = field === 'price' ? Number(req.body[field]) : req.body[field];
      }
    });

    // If new images were uploaded via multer → Cloudinary, update them
    if (req.cloudinaryUrls && req.cloudinaryUrls.length > 0) {
      updateData.images = req.cloudinaryUrls;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('sellerId', 'name email profileImage');

    res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      product: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a product and its Cloudinary images (seller only)
 * @route   DELETE /api/v1/products/:id
 * @access  Private
 */
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    if (product.sellerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized. You can only delete your own listings.',
      });
    }

    // Delete each image from Cloudinary by extracting the public_id from the URL
    if (product.images && product.images.length > 0) {
      const deletePromises = product.images.map((imageUrl) => {
        // Extract public_id from the Cloudinary URL
        // URL format: https://res.cloudinary.com/<cloud>/image/upload/v<ver>/<folder>/<public_id>.<ext>
        const parts = imageUrl.split('/');
        const fileWithExt = parts[parts.length - 1];
        const fileName = fileWithExt.split('.')[0];
        const folder = parts[parts.length - 2];
        const publicId = `${folder}/${fileName}`;

        return cloudinary.uploader.destroy(publicId).catch((err) => {
          // Log but don't fail the deletion if Cloudinary removal errors
          console.warn(`Failed to delete Cloudinary image: ${publicId}`, err.message);
        });
      });

      await Promise.all(deletePromises);
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark a product as sold and notify interested buyers
 * @route   PATCH /api/v1/products/:id/sold
 * @access  Private (seller only)
 */
const markAsSold = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    if (product.sellerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized. You can only mark your own listings as sold.',
      });
    }

    // Update status
    product.status = 'sold';
    await product.save();

    // Find all buyers who expressed interest in this product (via 'interest' notifications)
    // These notifications were created with userId = seller, but we need to notify buyers.
    // We identify interested buyers from notifications of type 'interest' where productId matches,
    // looking in notifications where the message was created FOR the seller about THIS product.
    // The buyer info is embedded in those notifications' context.
    // Instead, we find notifications where type='interest' AND productId=product._id
    // and notify the users referenced in those notifications' userId fields.
    // (In the interest flow: notification goes to the SELLER; buyer is req.user)
    // So we need a different approach: find all chats where productId matches, then notify buyers.
    const Chat = require('../models/Chat');
    const { sendNotificationToUser } = require('../sockets/socket');

    const chats = await Chat.find({ productId: product._id });
    const buyerIds = [...new Set(chats.map((c) => c.buyerId.toString()))];

    // Create "sold" notifications for each interested buyer
    const notificationDocs = buyerIds.map((buyerId) => ({
      userId: buyerId,
      title: 'Item Sold',
      message: `The item "${product.title}" you were interested in has been sold.`,
      type: 'sold',
      productId: product._id,
    }));

    if (notificationDocs.length > 0) {
      const savedNotifications = await Notification.insertMany(notificationDocs);

      // Emit real-time notifications to online buyers
      savedNotifications.forEach((notif) => {
        sendNotificationToUser(notif.userId.toString(), notif);
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product marked as sold. Interested buyers have been notified.',
      product,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  markAsSold,
};
