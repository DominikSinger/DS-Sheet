import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { AppError } from './errorHandler';

export const requireAdminToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers['x-admin-token'] || req.query.token;

  if (!token) {
    throw new AppError(401, 'Admin-Token fehlt');
  }

  if (token !== config.adminToken) {
    throw new AppError(403, 'Ungültiger Admin-Token');
  }

  next();
};
