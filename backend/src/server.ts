import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 BiyaheEasy API running on port ${env.PORT}`);
  logger.info(`📍 Environment: ${env.NODE_ENV}`);
  logger.info(`🌐 Frontend URL: ${env.FRONTEND_URL}`);
});

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });

  // Force close after 10s
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason: Error) => {
  logger.error('Unhandled Rejection:', { message: reason?.message, stack: reason?.stack });
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', { message: error.message, stack: error.stack });
  gracefulShutdown('uncaughtException');
});

export default server;
