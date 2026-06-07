/**
 * Structured logger using pino.
 * Replaces all console.log/console.error throughout the server.
 * - Development: pretty-printed with colors via pino-pretty
 * - Production: JSON output for log aggregators (Datadog, CloudWatch, etc.)
 */
const pino = require('pino');

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  ...(process.env.NODE_ENV !== 'production' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:HH:MM:ss',
        ignore: 'pid,hostname',
      },
    },
  }),
});

module.exports = logger;
