import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { TaskStatus, Priority } from '@prisma/client';
import * as taskService from '../services/task.service';
import { sendSuccess, sendPaginated, parsePagination } from '../utils/response';
import { AuthenticatedRequest } from '../types';

const createTaskSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(1).max(300),
  description: z.string().max(2000).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  assignedTo: z.string().uuid().optional(),
  dueDate: z.string().datetime({ offset: true }).optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  description: z.string().max(2000).nullable().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  assignedTo: z.string().uuid().nullable().optional(),
  dueDate: z.string().nullable().optional(),
});

const taskQuerySchema = z.object({
  project_id: z.string().uuid().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export const listTasks = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const query = taskQuerySchema.parse(req.query);
    const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);
    const { tasks, total } = await taskService.getTasks(
      req.user.id,
      { projectId: query.project_id, status: query.status, priority: query.priority },
      page,
      limit,
      skip,
    );
    sendPaginated(res, tasks, { page, limit, total });
  } catch (err) {
    next(err);
  }
};

export const createTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const input = createTaskSchema.parse(req.body);
    const task = await taskService.createTask(input, req.user.id);
    sendSuccess(res, task, 201);
  } catch (err) {
    next(err);
  }
};

export const updateTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const input = updateTaskSchema.parse(req.body);
    const task = await taskService.updateTask(req.params['id'] as string, input, req.user.id);
    sendSuccess(res, task);
  } catch (err) {
    next(err);
  }
};

export const deleteTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await taskService.deleteTask(req.params['id'] as string, req.user.id);
    sendSuccess(res, { message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};
