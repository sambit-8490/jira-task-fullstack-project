import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as authService from '../services/auth.service';
import { sendSuccess } from '../utils/response';

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const input = registerSchema.parse(req.body);
    const result = await authService.registerUser(input);
    sendSuccess(res, result, 201);
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const input = loginSchema.parse(req.body);
    const result = await authService.loginUser(input);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);
    const result = await authService.refreshAccessToken(refreshToken);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);
    await authService.logoutUser(refreshToken);
    sendSuccess(res, { message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};
