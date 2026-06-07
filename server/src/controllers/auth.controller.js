const User = require('../models/User');
const generateToken = require('../utils/generateToken');

/**
 * Cookie options for the httpOnly JWT session cookie. (C1 fix)
 * httpOnly: JS cannot read it → XSS-safe
 * secure: HTTPS-only in production
 * sameSite: 'strict' prevents CSRF from cross-origin forms
 */
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000, // 24 hours in ms
};

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Create user (password hashing handled by pre-save hook)
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'buyer',
    });

    const token = generateToken(user._id);

    // C1: Set httpOnly session cookie for API auth persistence
    res.cookie('jwt', token, cookieOptions);

    // Also return token in body so the frontend can use it in-memory for Socket.IO
    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login with email and password
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user and explicitly include the password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user._id);

    // C1: Set httpOnly session cookie
    res.cookie('jwt', token, cookieOptions);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token, // In-memory use only (for Socket.IO auth)
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout — clears the httpOnly cookie
 * @route   POST /api/v1/auth/logout
 * @access  Public
 */
const logout = (req, res) => {
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
};

/**
 * @desc    Get current authenticated user's profile
 *          Also returns a fresh token so frontend can refresh in-memory socket token.
 * @route   GET /api/v1/auth/profile
 * @access  Private (Bearer header OR cookie)
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Issue a fresh token so the frontend can refresh its in-memory socket token
    const token = generateToken(user._id);
    res.cookie('jwt', token, cookieOptions); // Slide the cookie expiry

    res.status(200).json({
      success: true,
      token, // Fresh token for Socket.IO (in-memory use)
      user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update authenticated user's name and/or profile image
 * @route   PUT /api/v1/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, profileImage } = req.body;

    const updateFields = {};
    if (name) updateFields.name = name.trim();
    if (profileImage) updateFields.profileImage = profileImage;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, logout, getProfile, updateProfile };
