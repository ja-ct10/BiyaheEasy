import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthenticatedRequest } from '../types';
import { sendError } from '../utils/response';
import { logger } from '../utils/logger';

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 'Access token is required', 401);
      return;
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      sub: string;
      email: string;
    };

    req.user = {
      id: decoded.sub,
      email: decoded.email,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      sendError(res, 'Token has expired', 401);
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      sendError(res, 'Invalid token', 401);
      return;
    }
    logger.error('Auth middleware error:', error);
    sendError(res, 'Authentication failed', 401);
  }
};
