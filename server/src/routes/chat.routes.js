const express = require('express');
const router = express.Router();
const { createOrGetChat, getUserChats } = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth.middleware');

// POST /api/v1/chats  — Create or retrieve an existing chat thread
router.post('/', protect, createOrGetChat);

// GET  /api/v1/chats  — Get all chats for the authenticated user
router.get('/', protect, getUserChats);

module.exports = router;
