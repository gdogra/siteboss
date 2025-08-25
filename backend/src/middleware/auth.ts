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