const cloudinary = require('cloudinary').v2;

/**
 * Configure the Cloudinary SDK v2 with credentials from environment variables.
 * This module exports the configured cloudinary instance for use in the upload middleware.
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Always use HTTPS URLs
});

module.exports = cloudinary;
