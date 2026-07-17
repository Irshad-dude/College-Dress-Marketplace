const { body, validationResult } = require('express-validator');

/**
 * Validation rules for user registration.
 * Checks: name (≥2 chars), valid email, strong password, matching confirmPassword.
 */
const registerValidationRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters long.'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),

  body('collegeName')
    .trim()
    .notEmpty().withMessage('College name is required.'),

  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.')
    .matches(/[0-9]/).withMessage('Password must contain at least one number.'),

  body('confirmPassword')
    .notEmpty().withMessage('Confirm password is required.')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match.');
      }
      return true;
    }),
];

/**
 * Validation rules for user login.
 */
const loginValidationRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required.'),
];

/**
 * Middleware to run after validation rules.
 * If there are validation errors, responds with 422 and the list of errors.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed.',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

module.exports = { registerValidationRules, loginValidationRules, validate };
