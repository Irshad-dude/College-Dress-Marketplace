/**
 * server.js — College Dress Marketplace API entry point
 *
 * Security & Infrastructure:
 *  C1  — httpOnly cookies via cookie-parser
 *  C4  — NoSQL injection via express-mongo-sanitize
 *  C5  — Graceful shutdown (server.close before exit)
 *  L23 — Structured logging via pino
 *  M22 — Multi-origin production CORS
 */

require('dotenv').config();

const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const helmet     = require('helmet');
const cors       = require('cors');
const rateLimit  = require('express-rate-limit');
const cookieParser   = require('cookie-parser');
const mongoSanitize  = require('express-mongo-sanitize');
const logger         = require('./src/utils/logger');
const connectDB      = require('./src/config/db');
const { initSocket } = require('./src/sockets/socket');

// ── Routes ─────────────────────────────────────────────────────────────────────
const authRoutes         = require('./src/routes/auth.routes');
const productRoutes      = require('./src/routes/product.routes');
const chatRoutes         = require('./src/routes/chat.routes');
const messageRoutes      = require('./src/routes/message.routes');
const notificationRoutes = require('./src/routes/notification.routes');
const uploadRoutes       = require('./src/routes/upload.routes');
const errorHandler       = require('./src/middleware/error.middleware');

// ── App ────────────────────────────────────────────────────────────────────────
const app = express();

// Security headers
app.use(helmet());

// M22: Multi-origin CORS — supports local dev, Vercel previews, and production domain
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:3000',
  /^https:\/\/.*\.vercel\.app$/, // All Vercel preview deployments
];

if (process.env.EXTRA_ORIGINS) {
  allowedOrigins.push(...process.env.EXTRA_ORIGINS.split(',').map(o => o.trim()));
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server requests (no origin header) and Postman
    if (!origin) return callback(null, true);
    const allowed = allowedOrigins.some(o =>
      typeof o === 'string' ? o === origin : o.test(origin)
    );
    if (allowed) return callback(null, true);
    logger.warn({ origin }, 'CORS rejected request from unauthorized origin');
    callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Required for httpOnly cookies
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// C1: httpOnly cookie parsing
app.use(cookieParser());

// C4: Strip MongoDB operators from all inputs ($, .)
app.use(mongoSanitize({ replaceWith: '_' }));

// ── Rate limiters ───────────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 5 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again after a minute.' },
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please slow down.' },
});

app.use('/api/v1/auth', authLimiter);
app.use('/api/', apiLimiter);

// ── Health check ────────────────────────────────────────────────────────────────
app.get('/health', (req, res) =>
  res.status(200).json({
    success: true,
    message: 'College Dress Marketplace API is running.',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  })
);

// ── Routes ──────────────────────────────────────────────────────────────────────
app.use('/api/v1/auth',          authRoutes);
app.use('/api/v1/products',      productRoutes);
app.use('/api/v1/chats',         chatRoutes);
app.use('/api/v1/messages',      messageRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/upload',        uploadRoutes);

app.use((req, res) =>
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` })
);

app.use(errorHandler);

// ── HTTP + Socket.IO ────────────────────────────────────────────────────────────
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowed = allowedOrigins.some(o =>
        typeof o === 'string' ? o === origin : o.test(origin)
      );
      callback(allowed ? null : new Error('Socket.IO: CORS not allowed'), allowed);
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
});

initSocket(io);

// ── Start ────────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      logger.info(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      logger.info(`📡 API: http://localhost:${PORT}/api/v1`);
    });
  } catch (error) {
    logger.error(error, 'Failed to start server');
    process.exit(1);
  }
};

// C5: Graceful shutdown — always close HTTP server before exiting
const gracefulShutdown = (signal, err) => {
  if (err) logger.error(err, `[${signal}] Unhandled error`);
  else     logger.info(`[${signal}] Shutdown requested`);

  server.close(() => {
    logger.info('HTTP server closed. Exiting.');
    process.exit(err ? 1 : 0);
  });

  // Force-kill after 10 seconds if connections don't close
  setTimeout(() => {
    logger.error('Force-killing after 10s timeout');
    process.exit(1);
  }, 10_000).unref();
};

process.on('unhandledRejection', (err) => gracefulShutdown('unhandledRejection', err));
process.on('uncaughtException',  (err) => gracefulShutdown('uncaughtException', err));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT',  () => gracefulShutdown('SIGINT'));

startServer();
