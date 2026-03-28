import { Response } from 'express';
import { PaginatedResponse, SuccessResponse } from '../types';

export const sendSuccess = <T>(res: Response, data: T, statusCode = 200): Response => {
  const body: SuccessResponse<T> = { success: true, data };
  return res.status(statusCode).json(body);
};

export const sendPaginated = <T>(
  res: Response,
  data: T[],
  pagination: { page: number; limit: number; total: number },
): Response => {
  const body: PaginatedResponse<T> = {
    success: true,
    data,
    pagination: {
      ...pagination,
      totalPages: Math.ceil(pagination.total / pagination.limit),
    },
  };
  return res.status(200).json(body);
};

export const parsePagination = (
  query: Record<string, unknown>,
  maxLimit = 50,
): { page: number; limit: number; skip: number } => {
  const page = Math.max(1, parseInt(String(query['page'] ?? '1'), 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(String(query['limit'] ?? '10'), 10) || 10));
  return { page, limit, skip: (page - 1) * limit };
};
