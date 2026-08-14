import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { corsOptions } from './config/cors';
import { rateLimiter } from './middleware/rateLimiter.middleware';
import { errorMiddleware, notFoundMiddleware } from './middleware/error.middleware';
import authRoutes from './routes/auth.routes';
import tripsRoutes from './routes/trips.routes';
import routesRoutes from './routes/routes.routes';
import budgetRoutes from './routes/budget.routes';
import profileRoutes from './routes/profile.routes';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(rateLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Compression
app.use(compression());

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripsRoutes);
app.use('/api/routes', routesRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/profile', profileRoutes);

// 404 handler
app.use(notFoundMiddleware);

// Error handler (must be last)
app.use(errorMiddleware);

export default app;
