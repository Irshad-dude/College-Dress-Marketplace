const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

/**
 * Multer memory storage — files are buffered in memory and then streamed to Cloudinary.
 * This approach is fully compatible with Cloudinary SDK v2.
 */
const storage = multer.memoryStorage();

/**
 * Multer file filter — only allow image MIME types.
 */
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, JPEG, PNG, and WEBP image files are allowed.'), false);
  }
};

/**
 * Multer instance: memory storage, 5 MB limit, image-only filter.
 */
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per file
});

/**
 * Helper: wrap a Buffer into a Readable stream for Cloudinary's upload_stream.
 */
const bufferToStream = (buffer) => {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
};

/**
 * Helper: upload a single buffer to Cloudinary and return the secure URL.
 *
 * @param {Buffer} buffer - File buffer from multer memory storage
 * @param {string} originalname - Original file name (used for Cloudinary display)
 * @returns {Promise<string>} Secure Cloudinary URL
 */
const uploadToCloudinary = (buffer, originalname) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'college-dress-marketplace',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }],
        use_filename: false,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );

    bufferToStream(buffer).pipe(uploadStream);
  });
};

/**
 * Middleware: accept up to 5 files from the 'images' form field,
 * then upload each buffer to Cloudinary and attach the secure URLs to req.cloudinaryUrls.
 */
const uploadImages = [
  // Step 1: multer reads files into memory
  upload.array('images', 5),

  // Step 2: stream each file buffer to Cloudinary
  async (req, res, next) => {
    try {
      if (!req.files || req.files.length === 0) {
        // No files is allowed; controllers decide whether to enforce presence
        return next();
      }

      const uploadPromises = req.files.map((file) =>
        uploadToCloudinary(file.buffer, file.originalname)
      );

      const urls = await Promise.all(uploadPromises);

      // Attach URLs so the upload controller can return them,
      // and also populate req.files[*].path for compatibility
      req.cloudinaryUrls = urls;
      req.files.forEach((file, i) => {
        file.path = urls[i]; // align with multer-cloudinary convention
      });

      next();
    } catch (error) {
      next(error);
    }
  },
];

module.exports = { uploadImages };
