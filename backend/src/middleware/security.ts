import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { Request, Response } from 'express';
import { logger } from '../config/logger';
import { env } from '../config/env';

// Rate limiting configuration
export const createRateLimiter = (options: {
  windowMs: number;
  max: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: {
      success: false,
      error: options.message || 'Too many requests from this IP, please try again later'
    },
    keyGenerator: options.keyGenerator || ((req) => req.ip || 'anonymous'),
    onLimitReached: (req: Request) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        method: req.method
      });
    },
    standardHeaders: true,
    legacyHeaders: false
  });
};

// Different rate limiters for different endpoints
export const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

export const strictLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // limit each IP to 5 requests per windowMs
});

export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 auth attempts per windowMs
  message: 'Too many authentication attempts, please try again later'
});

// Helmet configuration for security headers
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: env.NODE_ENV === 'production',
  crossOriginOpenerPolicy: { policy: 'cross-origin' },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: false,
  referrerPolicy: { policy: 'no-referrer' },
  xssFilter: true
});

// IP whitelist middleware for admin endpoints
export const createIPWhitelist = (allowedIPs: string[]) => {
  return (req: Request, res: Response, next: Function) => {
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    
    if (env.NODE_ENV !== 'production' || allowedIPs.includes(clientIP)) {
      return next();
    }
    
    logger.warn('Unauthorized IP access attempt', {
      ip: clientIP,
      url: req.originalUrl,
      userAgent: req.get('User-Agent')
    });
    
    res.status(403).json({
      success: false,
      error: 'Access denied from this IP address'
    });
  };
};

// Request size limiter
export const requestSizeLimiter = (req: Request, res: Response, next: Function) => {
  const contentLength = parseInt(req.get('Content-Length') || '0');
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (contentLength > maxSize) {
    logger.warn('Request size exceeded limit', {
      ip: req.ip,
      contentLength,
      maxSize,
      url: req.originalUrl
    });
    
    return res.status(413).json({
      success: false,
      error: 'Request entity too large'
    });
  }
  
  next();
};

// CORS configuration
export const corsOptions = {
  origin: (origin: string | undefined, callback: Function) => {
    const allowedOrigins = env.CORS_ORIGINS.split(',').map(o => o.trim());
    
    // Allow no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      logger.warn('CORS violation', { origin, allowedOrigins });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400 // 24 hours
};