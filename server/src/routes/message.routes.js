const express = require('express');
const router = express.Router();
const { getMessages, sendMessage } = require('../controllers/message.controller');
const { protect } = require('../middleware/auth.middleware');

// GET  /api/v1/messages/:chatId  — Fetch all messages in a chat
router.get('/:chatId', protect, getMessages);

// POST /api/v1/messages           — Send a new message
router.post('/', protect, sendMessage);

module.exports = router;
