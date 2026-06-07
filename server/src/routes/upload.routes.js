const express = require('express');
const router = express.Router();
const { uploadImages } = require('../controllers/upload.controller');
const { protect } = require('../middleware/auth.middleware');
const { uploadImages: uploadMiddleware } = require('../middleware/upload.middleware');

// POST /api/v1/upload
// Chain: auth → multer/Cloudinary upload → controller returns URLs
router.post('/', protect, uploadMiddleware, uploadImages);

module.exports = router;
