const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  markAsSold,
} = require('../controllers/product.controller');
const { createInterestNotification } = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth.middleware');
const { uploadImages } = require('../middleware/upload.middleware');

// GET  /api/v1/products        — List all products (with filters & pagination)
// POST /api/v1/products        — Create a new listing (auth + image upload)
router.route('/')
  .get(getProducts)
  .post(protect, uploadImages, createProduct);

// GET    /api/v1/products/:id  — Get single product
// PUT    /api/v1/products/:id  — Update product (auth, seller only, optional image re-upload)
// DELETE /api/v1/products/:id  — Delete product (auth, seller only)
router.route('/:id')
  .get(getProductById)
  .put(protect, uploadImages, updateProduct)
  .delete(protect, deleteProduct);

// PATCH /api/v1/products/:id/sold     — Mark product as sold (auth, seller only)
router.patch('/:id/sold', protect, markAsSold);

// POST /api/v1/products/:id/interest  — Express buyer interest (auth)
router.post('/:id/interest', protect, createInterestNotification);

module.exports = router;
