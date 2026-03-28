import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors';
import { ErrorResponse } from '../types';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    const body: ErrorResponse = {
      success: false,
      error: { code: err.code, message: err.message },
    };
    res.status(err.statusCode).json(body);
    return;
  }

  if (err instanceof ZodError) {
    const body: ErrorResponse = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
      },
    };
    res.status(422).json(body);
    return;
  }

  console.error('[Unhandled Error]', err);
  const body: ErrorResponse = {
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
  };
  res.status(500).json(body);
};

export const notFoundHandler = (_req: Request, res: Response): void => {
  const body: ErrorResponse = {
    success: false,
    error: { code: 'NOT_FOUND', message: 'Route not found' },
  };
  res.status(404).json(body);
};
