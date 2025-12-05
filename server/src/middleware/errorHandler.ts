import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '../types';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof AppError) {
    const errorResponse: ErrorResponse = {
      error: 'Error',
      message: err.message,
      statusCode: err.statusCode,
    };

    res.status(err.statusCode).json(errorResponse);
    return;
  }

  // Unbekannter Fehler
  console.error('❌ Unbehandelter Fehler:', err);

  const errorResponse: ErrorResponse = {
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Ein interner Fehler ist aufgetreten' 
      : err.message,
    statusCode: 500,
  };

  res.status(500).json(errorResponse);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  const errorResponse: ErrorResponse = {
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} nicht gefunden`,
    statusCode: 404,
  };

  res.status(404).json(errorResponse);
};
