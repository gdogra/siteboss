import 'express-async-errors'; // Must be first
import express from 'express';
import compression from 'compression';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB, disconnectDB } from './database/connection';
import { env, corsOrigins } from './config/env';
import { logger, morganStream } from './config/logger';
import { 
  errorHandler, 
  notFoundHandler,
  AppError 
} from './middleware/errorHandler';
import { 
  helmetConfig,
  corsOptions,
  generalLimiter,
  authLimiter,
  requestSizeLimiter 
} from './middleware/security';

// Routes
import healthRoutes from './routes/health';
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import taskRoutes from './routes/tasks';
import budgetRoutes from './routes/budget';
import subcontractorRoutes from './routes/subcontractors';
import usersRoutes from './routes/users';
import resourceRoutes from './routes/resources';
import billingRoutes from './routes/billing';
import uploadsRoutes from './routes/uploads';
import documentRoutes from './routes/documents';

const app = express();
const PORT = env.PORT;

// Trust proxy configuration
if (env.TRUSTED_PROXIES) {
  app.set('trust proxy', env.TRUSTED_PROXIES);
} else {
  app.set('trust proxy', env.NODE_ENV === 'production');
}

// Disable Express server identification
app.disable('x-powered-by');

// Security middleware
app.use(helmetConfig);
app.use(cors(corsOptions));

// Compression middleware (should be early in the stack)
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6,
  threshold: 1024
}));

// Request logging (only if enabled)
if (env.ENABLE_REQUEST_LOGGING) {
  const morganFormat = env.NODE_ENV === 'production' 
    ? 'combined'
    : 'dev';
  
  app.use(morgan(morganFormat, { 
    stream: morganStream,
    skip: (req) => req.originalUrl.startsWith('/health')
  }));
}

// Request size limiting
app.use(requestSizeLimiter);

// Body parsing middleware
app.use(express.json({ 
  limit: `${env.MAX_FILE_SIZE}b`,
  strict: true
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: `${env.MAX_FILE_SIZE}b` 
}));

// Global rate limiting
app.use(generalLimiter);

// API routes
app.use('/health', healthRoutes);
app.use('/ready', healthRoutes); // Alias for health check
app.use('/live', healthRoutes);  // Alias for health check

// Authentication routes with stricter rate limiting
app.use('/api/auth', authLimiter, authRoutes);

// API routes
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/subcontractors', subcontractorRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/upload', uploadsRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'SiteBoss Construction Project Management API',
    version: process.env.npm_package_version || '1.0.0',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    documentation: env.ENABLE_SWAGGER ? '/api/docs' : undefined
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'SiteBoss API v1',
    version: process.env.npm_package_version || '1.0.0',
    endpoints: {
      auth: '/api/auth',
      projects: '/api/projects',
      tasks: '/api/tasks',
      budget: '/api/budget',
      subcontractors: '/api/subcontractors',
      users: '/api/users',
      resources: '/api/resources',
      health: '/health'
    }
  });
});

// 404 handler (must be before error handler)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Server instance
let server: import('http').Server | undefined;

// Graceful shutdown handler
const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info(`${signal} signal received, starting graceful shutdown`);
  
  const shutdownTimeout = setTimeout(() => {
    logger.error('Graceful shutdown timed out, forcing exit');
    process.exit(1);
  }, 30000); // 30 second timeout

  try {
    // Close HTTP server
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server!.close((err) => {
          if (err) {
            logger.error('Error closing HTTP server', { error: err });
            reject(err);
          } else {
            logger.info('HTTP server closed');
            resolve();
          }
        });
      });
    }

    // Close database connections
    await disconnectDB();
    
    clearTimeout(shutdownTimeout);
    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown', { error });
    clearTimeout(shutdownTimeout);
    process.exit(1);
  }
};

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDB();
    
    // Start HTTP server
    server = app.listen(PORT, () => {
      logger.info('🚀 SiteBoss API server started', {
        port: PORT,
        environment: env.NODE_ENV,
        nodeVersion: process.version,
        pid: process.pid
      });
      
      if (env.NODE_ENV !== 'production') {
        logger.info(`📊 Health check: http://localhost:${PORT}/health`);
        logger.info(`🔗 API endpoints: http://localhost:${PORT}/api`);
      }
    });

    // Handle server errors
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use`);
      } else {
        logger.error('Server error', { error });
      }
      process.exit(1);
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception', { error });
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection', { reason, promise });
      gracefulShutdown('UNHANDLED_REJECTION');
    });

    // Handle termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
};

// Start the application
startServer().catch((error) => {
  logger.error('Critical error during startup', { error });
  process.exit(1);
});

export default app;
