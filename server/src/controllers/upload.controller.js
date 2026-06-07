/**
 * @desc    Upload one or more images to Cloudinary
 * @route   POST /api/v1/upload
 * @access  Private
 *
 * The actual file upload is handled by the uploadImages middleware (multer + Cloudinary).
 * By the time this controller runs, req.files contains the uploaded file metadata.
 */
const uploadImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files were uploaded.',
      });
    }

    // Extract the secure Cloudinary URLs from each uploaded file
    const imageUrls = req.files.map((file) => file.path);

    res.status(200).json({
      success: true,
      message: `${imageUrls.length} image(s) uploaded successfully.`,
      imageUrls,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadImages };
