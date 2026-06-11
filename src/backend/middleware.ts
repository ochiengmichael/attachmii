/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../types.js';
import { db } from './db.js';

const JWT_SECRET = 'attachme_super_secret_session_key_2026';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1]; // Bearer <token>

    jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
      if (err) {
        db.addAuditLog('FAILED_JWT_VERIFICATION', 'anonymous', req.ip || 'unknown');
        res.status(401).json({ error: 'Token is invalid or expired. Please re-authenticate.' });
        return;
      }

      // Check user in database
      const users = db.getUsers();
      const dbUser = users.find(u => u.id === decoded.id);

      if (!dbUser) {
        res.status(401).json({ error: 'User account no longer exists.' });
        return;
      }

      if (dbUser.isSuspended) {
        res.status(403).json({ error: 'Your account has been suspended by an administrator.' });
        return;
      }

      req.user = dbUser;
      next();
    });
  } else {
    res.status(401).json({ error: 'Access token is required. Authorization header missing.' });
  }
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized. Authenticated session required.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      db.addAuditLog('RBAC_VIOLATION', req.user.email, req.ip || 'unknown');
      res.status(403).json({ error: `Forbidden. This action requires one of: ${allowedRoles.join(', ')}` });
      return;
    }

    next();
  };
}
