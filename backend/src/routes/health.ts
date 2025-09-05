import { Router, Request, Response } from 'express';
import { pool } from '../database/connection';
import { logger } from '../config/logger';
import { env } from '../config/env';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

interface HealthCheck {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  services: {
    database: {
      status: 'healthy' | 'unhealthy';
      responseTime?: number;
      error?: string;
    };
    redis?: {
      status: 'healthy' | 'unhealthy';
      responseTime?: number;
      error?: string;
    };
  };
  system: {
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    cpu: {
      loadAverage: number[];
    };
  };
}

// Basic health check
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  // Check database connection
  let dbStatus: 'healthy' | 'unhealthy' = 'healthy';
  let dbResponseTime: number | undefined;
  let dbError: string | undefined;
  
  try {
    const dbStart = Date.now();
    await pool.query('SELECT 1');
    dbResponseTime = Date.now() - dbStart;
  } catch (error) {
    dbStatus = 'unhealthy';
    dbError = error instanceof Error ? error.message : 'Unknown database error';
    logger.error('Database health check failed', { error });
  }
  
  // System metrics
  const memoryUsage = process.memoryUsage();
  const totalMemory = memoryUsage.rss + memoryUsage.heapUsed + memoryUsage.external;
  
  const healthCheck: HealthCheck = {
    status: dbStatus === 'healthy' ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    services: {
      database: {
        status: dbStatus,
        responseTime: dbResponseTime,
        error: dbError
      }
    },
    system: {
      memory: {
        used: Math.round(totalMemory / 1024 / 1024), // MB
        total: Math.round(memoryUsage.rss / 1024 / 1024), // MB
        percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)
      },
      cpu: {
        loadAverage: require('os').loadavg()
      }
    }
  };
  
  const responseTime = Date.now() - startTime;
  
  res.status(healthCheck.status === 'healthy' ? 200 : 503).json({
    ...healthCheck,
    responseTime
  });
}));

// Readiness probe (for Kubernetes/Docker)
router.get('/ready', asyncHandler(async (req: Request, res: Response) => {
  try {
    // Check if application can serve traffic
    await pool.query('SELECT 1');
    
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Readiness check failed', { error });
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

// Liveness probe (for Kubernetes/Docker)
router.get('/live', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime())
  });
});

// Detailed health check (admin only)
router.get('/detailed', asyncHandler(async (req: Request, res: Response) => {
  const checks = await Promise.allSettled([
    // Database connection pool info
    new Promise(async (resolve, reject) => {
      try {
        const poolInfo = {
          totalCount: pool.totalCount,
          idleCount: pool.idleCount,
          waitingCount: pool.waitingCount
        };
        resolve({ type: 'database_pool', status: 'healthy', data: poolInfo });
      } catch (error) {
        reject({ type: 'database_pool', status: 'unhealthy', error: error });
      }
    }),
    
    // Database query performance
    new Promise(async (resolve, reject) => {
      try {
        const start = Date.now();
        await pool.query('SELECT COUNT(*) FROM users');
        const queryTime = Date.now() - start;
        resolve({ type: 'database_query', status: 'healthy', responseTime: queryTime });
      } catch (error) {
        reject({ type: 'database_query', status: 'unhealthy', error: error });
      }
    })
  ]);
  
  const results = checks.map(check => 
    check.status === 'fulfilled' ? check.value : check.reason
  );
  
  res.json({
    status: 'detailed_health_check',
    timestamp: new Date().toISOString(),
    checks: results,
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      architecture: process.arch,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      pid: process.pid
    }
  });
}));

export default router;