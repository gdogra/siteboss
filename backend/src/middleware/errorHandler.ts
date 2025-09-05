import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { env } from '../config/env';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const createError = (message: string, statusCode: number = 500, code?: string) => {
  return new AppError(message, statusCode, code);
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let err = { ...error };
  err.message = error.message;

  // Log error
  logger.error('Error occurred', {
    error: {
      message: err.message,
      stack: error.stack,
      statusCode: err.statusCode || 500
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    },
    user: req.user ? { id: req.user.userId, email: req.user.email } : 'Anonymous'
  });

  // PostgreSQL errors
  if (error.code === '23505') {
    const message = 'Duplicate field value entered';
    err = new AppError(message, 400, 'DUPLICATE_VALUE');
  }

  if (error.code === '23503') {
    const message = 'Resource not found';
    err = new AppError(message, 404, 'NOT_FOUND');
  }

  if (error.code === '22P02') {
    const message = 'Invalid input syntax';
    err = new AppError(message, 400, 'INVALID_INPUT');
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    err = new AppError(message, 401, 'INVALID_TOKEN');
  }

  if (error.name === 'TokenExpiredError') {
    const message = 'Token expired';
    err = new AppError(message, 401, 'TOKEN_EXPIRED');
  }

  // Validation errors
  if (error.name === 'ValidationError') {
    const message = Object.values(error.errors).map((val: any) => val.message).join(', ');
    err = new AppError(message, 400, 'VALIDATION_ERROR');
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Something went wrong';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(err.code && { code: err.code }),
    ...(env.NODE_ENV === 'development' && {
      stack: error.stack,
      details: error
    })
  });
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404, 'NOT_FOUND');
  next(error);
};