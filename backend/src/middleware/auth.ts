import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';
import { AuthPayload, UserRole } from '../types';

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ 
        success: false, 
        error: 'Access token required' 
      });
      return;
    }

    const token = authHeader.substring(7);

    // Dev/demo fallback: accept a demo token and derive identity from headers
    if (token === 'demo-token') {
      const role = (req.headers['x-user-role'] as string) || 'company_admin';
      const companyId = (req.headers['x-company-id'] as string) || '123e4567-e89b-12d3-a456-426614174000';
      const userId = (req.headers['x-user-id'] as string) || '123e4567-e89b-12d3-a456-426614174001';
      const email = (req.headers['x-user-email'] as string) || 'demo@siteboss.com';
      req.user = { userId, companyId, role: role as any, email };
      return next();
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      error: 'Invalid or expired token' 
    });
  }
};

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ 
        success: false, 
        error: 'Insufficient permissions' 
      });
      return;
    }

    next();
  };
};

export const checkCompanyAccess = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const companyId = req.params.companyId || req.body.company_id;
  
  if (!req.user) {
    res.status(401).json({ 
      success: false, 
      error: 'Authentication required' 
    });
    return;
  }

  if (req.user.role !== 'super_admin' && req.user.companyId !== companyId) {
    res.status(403).json({ 
      success: false, 
      error: 'Access denied to this company data' 
    });
    return;
  }

  next();
};
