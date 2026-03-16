import { Request, Response, NextFunction } from 'express';

type Role = 'ADMIN' | 'RESEARCHER' | 'FISHERMAN' | 'GENERAL';

// RBAC middleware factory — returns a middleware that allows only the specified roles
export const requireRoles = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    const userRole = req.user.role as Role;

    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({
        error: `Access denied. Role "${userRole}" is not permitted to access this resource.`,
      });
      return;
    }

    next();
  };
};

// Explicitly blocks FISHERMAN from sensitive routes
export const blockFisherman = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user?.role === 'FISHERMAN') {
    res.status(403).json({
      error: 'Access strictly denied. Fisherman role cannot access research or admin resources.',
    });
    return;
  }
  next();
};
