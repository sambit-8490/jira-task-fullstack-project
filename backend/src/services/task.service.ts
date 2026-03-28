import { prisma, TaskStatus, Priority } from '../models';
import { ForbiddenError, NotFoundError } from '../utils/errors';
import { cacheDel, CacheKeys } from '../utils/cache';

export interface TaskFilters {
  projectId?: string;
  status?: TaskStatus;
  priority?: Priority;
}

export interface CreateTaskInput {
  projectId: string;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  assignedTo?: string;
  dueDate?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: Priority;
  assignedTo?: string | null;
  dueDate?: string | null;
}

/**
 * Verifies the user is a member of the project (owner OR member role).
 * Returns the membership record so callers can check the role if needed.
 */
const assertProjectAccess = async (projectId: string, userId: string) => {
  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
  if (!member) {
    const exists = await prisma.project.count({ where: { id: projectId } });
    // 403 if project exists but user has no access; 404 if project doesn't exist
    if (exists) throw new ForbiddenError('You do not have access to this project');
    throw new NotFoundError('Project not found');
  }
  return member;
};

export const getTasks = async (
  userId: string,
  filters: TaskFilters,
  page: number,
  limit: number,
  skip: number,
) => {
  // If a specific project is requested, validate access first — fail fast
  if (filters.projectId) {
    await assertProjectAccess(filters.projectId, userId);
  }

  // Collect all project IDs the user belongs to (used when no project filter)
  const allowedProjectIds = filters.projectId
    ? [filters.projectId]
    : (await prisma.projectMember.findMany({
        where: { userId },
        select: { projectId: true },
      })).map((m) => m.projectId);

  const where = {
    projectId: { in: allowedProjectIds },
    ...(filters.status && { status: filters.status }),
    ...(filters.priority && { priority: filters.priority }),
  };

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { assignee: { select: { id: true, name: true, email: true } } },
    }),
    prisma.task.count({ where }),
  ]);

  return { tasks, total };
};

export const createTask = async (input: CreateTaskInput, userId: string) => {
  await assertProjectAccess(input.projectId, userId);

  const task = await prisma.task.create({
    data: {
      projectId: input.projectId,
      title: input.title,
      description: input.description ?? null,
      status: input.status ?? 'todo',
      priority: input.priority ?? 'medium',
      assignedTo: input.assignedTo ?? null,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
    },
    include: { assignee: { select: { id: true, name: true, email: true } } },
  });

  await cacheDel(CacheKeys.project(input.projectId));
  return task;
};

export const updateTask = async (taskId: string, input: UpdateTaskInput, userId: string) => {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new NotFoundError('Task not found');

  await assertProjectAccess(task.projectId, userId);

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.priority !== undefined && { priority: input.priority }),
      ...(input.assignedTo !== undefined && { assignedTo: input.assignedTo }),
      ...(input.dueDate !== undefined && {
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
      }),
    },
    include: { assignee: { select: { id: true, name: true, email: true } } },
  });

  await cacheDel(CacheKeys.project(task.projectId));
  return updated;
};

export const deleteTask = async (taskId: string, userId: string) => {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new NotFoundError('Task not found');

  // Only the project owner can delete tasks
  const project = await prisma.project.findUnique({ where: { id: task.projectId } });
  if (!project) throw new NotFoundError('Project not found');

  if (project.ownerId !== userId) {
    // Return 403 for members, not 404 — confirms the task exists but they lack permission
    await assertProjectAccess(task.projectId, userId);
    throw new ForbiddenError('Only the project owner can delete tasks');
  }

  await prisma.task.delete({ where: { id: taskId } });
  await cacheDel(CacheKeys.project(task.projectId));
};
