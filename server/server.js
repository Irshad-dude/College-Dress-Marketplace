/**
 * server.js — Entry point for the College Dress Marketplace API
 *
 * Security fixes applied:
 *  C1 — httpOnly cookie support via cookie-parser
 *  C4 — NoSQL injection prevention via express-mongo-sanitize
 *  C5 — Graceful shutdown on uncaughtException (close server before exit)
 */

require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');           // C1
const mongoSanitize = require('express-mongo-sanitize'); // C4

const connectDB = require('./src/config/db');
const { initSocket } = require('./src/sockets/socket');

// ── Routes ─────────────────────────────────────────────────────────────────────
const authRoutes         = require('./src/routes/auth.routes');
const productRoutes      = require('./src/routes/product.routes');
const chatRoutes         = require('./src/routes/chat.routes');
const messageRoutes      = require('./src/routes/message.routes');
const notificationRoutes = require('./src/routes/notification.routes');
const uploadRoutes       = require('./src/routes/upload.routes');

// ── Middleware ─────────────────────────────────────────────────────────────────
const errorHandler = require('./src/middleware/error.middleware');

// ── App setup ──────────────────────────────────────────────────────────────────
const app = express();

// Security headers
app.use(helmet());

// CORS — allow requests from the frontend dev server with credentials
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Required for httpOnly cookies
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser — enables req.cookies for httpOnly JWT (C1)
app.use(cookieParser());

// NoSQL injection sanitization — strips $ and . from req.body/params/query (C4)
app.use(mongoSanitize({
  replaceWith: '_',
  onSanitizeError: (req, key) => {
    console.warn(`[Security] Attempted NoSQL injection on key: ${key}`);
  },
}));

// ── Rate limiters ───────────────────────────────────────────────────────────────

// Auth routes: strict limit. Use env var to allow override in dev.
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 5 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after a minute.',
  },
});

// General API limiter
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
  },
});

app.use('/api/v1/auth', authLimiter);
app.use('/api/', apiLimiter);

// ── Health check ────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'College Dress Marketplace API is running.',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ── API Routes ──────────────────────────────────────────────────────────────────
app.use('/api/v1/auth',          authRoutes);
app.use('/api/v1/products',      productRoutes);
app.use('/api/v1/chats',         chatRoutes);
app.use('/api/v1/messages',      messageRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/upload',        uploadRoutes);

// ── 404 handler ─────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ── Global error handler ────────────────────────────────────────────────────────
app.use(errorHandler);

// ── HTTP Server + Socket.IO ─────────────────────────────────────────────────────
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
});

initSocket(io);

// ── Start server ────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`\n🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      console.log(`📡 API available at: http://localhost:${PORT}/api/v1`);
      console.log(`❤️  Health check at: http://localhost:${PORT}/health\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

// ── Graceful shutdown helpers ───────────────────────────────────────────────────

const gracefulShutdown = (signal, err) => {
  if (err) console.error(`[${signal}]`, err.message);
  console.log(`\n[${signal}] Closing server gracefully...`);
  server.close(() => {
    console.log('[Server] HTTP server closed. Exiting.');
    process.exit(err ? 1 : 0);
  });
  // Force exit after 10s if connections don't close
  setTimeout(() => process.exit(1), 10_000).unref();
};

// C5 fix — close server BEFORE exiting on uncaught errors
process.on('unhandledRejection', (err) => gracefulShutdown('unhandledRejection', err));
process.on('uncaughtException',  (err) => gracefulShutdown('uncaughtException', err));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT',  () => gracefulShutdown('SIGINT'));

startServer();
