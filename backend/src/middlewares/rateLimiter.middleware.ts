import rateLimit from 'express-rate-limit';
import { ErrorResponse } from '../types';

const makeErrorResponse = (message: string): ErrorResponse => ({
  success: false,
  error: { code: 'RATE_LIMIT_EXCEEDED', message },
});

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: makeErrorResponse('Too many login attempts. Please try again after 15 minutes.'),
});

export const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: makeErrorResponse('Too many registration attempts. Please try again after 1 hour.'),
});

export const refreshRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: makeErrorResponse('Too many token refresh attempts. Please try again after 15 minutes.'),
});
