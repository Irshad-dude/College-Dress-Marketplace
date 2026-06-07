const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAllRead,
  markOneRead,
} = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth.middleware');

// GET   /api/v1/notifications        — Get all notifications for current user
router.get('/', protect, getNotifications);

// PATCH /api/v1/notifications/read   — Mark all notifications as read
// Note: This must be defined BEFORE /:id/read to avoid 'read' being treated as an :id param
router.patch('/read', protect, markAllRead);

// PATCH /api/v1/notifications/:id/read — Mark a single notification as read
router.patch('/:id/read', protect, markOneRead);

module.exports = router;
