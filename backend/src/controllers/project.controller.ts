import { Response, NextFunction } from 'express';
import { z } from 'zod';
import * as projectService from '../services/project.service';
import { sendSuccess, sendPaginated, parsePagination } from '../utils/response';
import { AuthenticatedRequest } from '../types';

const createProjectSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
});

const addMemberSchema = z.object({
  email: z.string().email(),
});

export const listProjects = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query as Record<string, unknown>);
    const { projects, total } = await projectService.getUserProjects(req.user.id, page, limit, skip);
    sendPaginated(res, projects, { page, limit, total });
  } catch (err) {
    next(err);
  }
};

export const createProject = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const input = createProjectSchema.parse(req.body);
    const project = await projectService.createProject({ ...input, ownerId: req.user.id });
    sendSuccess(res, project, 201);
  } catch (err) {
    next(err);
  }
};

export const getProject = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const project = await projectService.getProjectById(req.params['id'] as string, req.user.id);
    sendSuccess(res, project);
  } catch (err) {
    next(err);
  }
};

export const addMember = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email } = addMemberSchema.parse(req.body);
    const member = await projectService.addMember(req.params['id'] as string, req.user.id, email);
    sendSuccess(res, member, 201);
  } catch (err) {
    next(err);
  }
};

export const removeMember = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await projectService.removeMember(
      req.params['id'] as string,
      req.user.id,
      req.params['userId'] as string,
    );
    sendSuccess(res, { message: 'Member removed' });
  } catch (err) {
    next(err);
  }
};
