/**
 * upload.middleware.js
 *
 * Handles multipart/form-data file uploads:
 * 1. Multer reads file buffers into memory
 * 2. H13: Verifies actual file magic bytes (not just MIME header — prevents spoofing)
 * 3. Streams verified buffers to Cloudinary
 * 4. Attaches Cloudinary URLs to req.cloudinaryUrls
 */
const multer  = require('multer');
const { Readable } = require('stream');
const cloudinary = require('../config/cloudinary');
const logger = require('../utils/logger');

// Use file-type v16 (CommonJS compatible — v17+ is ESM-only)
const fileType = require('file-type');

const ALLOWED_MIME_TYPES  = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_MAGIC_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// ── Multer: memory storage, MIME-type pre-filter ──────────────────────────────

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    // First gate: check the Content-Type header (fast, but spoofable)
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, JPEG, PNG, and WEBP image files are allowed.'), false);
    }
  },
});

// ── Cloudinary upload helper ──────────────────────────────────────────────────

const bufferToStream = (buffer) => {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
};

const uploadToCloudinary = (buffer, originalname) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'college-dress-marketplace',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        // P30: Cloudinary auto optimization — serve WebP to supporting browsers, resize to max 1200px
        transformation: [
          { width: 1200, height: 1200, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
        ],
        use_filename: false,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    bufferToStream(buffer).pipe(uploadStream);
  });

// ── Combined middleware: multer → magic bytes → Cloudinary ────────────────────

const uploadImages = [
  // Step 1: Multer reads up to 5 files into memory buffers
  upload.array('images', 5),

  // Step 2: H13 Magic bytes verification + Step 3: Cloudinary upload
  async (req, res, next) => {
    try {
      if (!req.files || req.files.length === 0) return next();

      const verifiedUrls = [];

      for (const file of req.files) {
        // H13: Read actual magic bytes from the buffer — cannot be spoofed by changing filename/header
        const detected = await fileType.fromBuffer(file.buffer);

        if (!detected || !ALLOWED_MAGIC_TYPES.has(detected.mime)) {
          logger.warn(
            { originalname: file.originalname, claimedMime: file.mimetype, detectedMime: detected?.mime },
            '[Security] File upload rejected — MIME type mismatch (possible spoofing attempt)'
          );
          return res.status(400).json({
            success: false,
            message: `Invalid file: "${file.originalname}". Only real JPEG, PNG, or WebP images are accepted.`,
          });
        }

        // Step 3: Upload verified buffer to Cloudinary
        const url = await uploadToCloudinary(file.buffer, file.originalname);
        verifiedUrls.push(url);
        logger.info({ url }, 'Image uploaded to Cloudinary');
      }

      req.cloudinaryUrls = verifiedUrls;
      next();
    } catch (error) {
      next(error);
    }
  },
];

module.exports = { uploadImages };
