import { prisma } from '../models';
import { ForbiddenError, NotFoundError, ConflictError } from '../utils/errors';
import { cacheGet, cacheSet, cacheDel, CacheKeys, CacheTTL } from '../utils/cache';

export interface CreateProjectInput {
  name: string;
  description?: string;
  ownerId: string;
}

export const getUserProjects = async (
  userId: string,
  page: number,
  limit: number,
  skip: number,
) => {
  const cacheKey = CacheKeys.userProjects(userId);

  // Only cache first page with default limit to avoid cache complexity
  const shouldCache = page === 1 && limit === 10;
  if (shouldCache) {
    const cached = await cacheGet<{ projects: unknown[]; total: number }>(cacheKey);
    if (cached) return cached;
  }

  const where = {
    OR: [
      { ownerId: userId },
      { members: { some: { userId } } },
    ],
  };

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { members: true, tasks: true } },
        members: {
          where: { userId },
          select: { role: true },
        },
      },
    }),
    prisma.project.count({ where }),
  ]);

  const result = {
    projects: projects.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      ownerId: p.ownerId,
      createdAt: p.createdAt,
      memberCount: p._count.members,
      taskCount: p._count.tasks,
      role: p.members[0]?.role ?? 'owner',
    })),
    total,
  };

  if (shouldCache) await cacheSet(cacheKey, result, CacheTTL.userProjects);
  return result;
};

export const createProject = async (input: CreateProjectInput) => {
  const project = await prisma.project.create({
    data: {
      name: input.name,
      description: input.description,
      ownerId: input.ownerId,
      members: {
        create: { userId: input.ownerId, role: 'owner' },
      },
    },
    include: { _count: { select: { members: true, tasks: true } } },
  });

  await cacheDel(CacheKeys.userProjects(input.ownerId));

  return project;
};

export const getProjectById = async (projectId: string, userId: string) => {
  const cacheKey = CacheKeys.project(projectId);
  const cached = await cacheGet<unknown>(cacheKey);
  if (cached) {
    // Still verify membership on cached response
    const cachedProject = cached as { ownerId: string; members: Array<{ userId: string }> };
    const isMember = cachedProject.ownerId === userId ||
      cachedProject.members.some((m) => m.userId === userId);
    if (!isMember) throw new ForbiddenError('You do not have access to this project');
    return cached;
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
      tasks: {
        orderBy: { createdAt: 'desc' },
        include: { assignee: { select: { id: true, name: true, email: true } } },
      },
    },
  });

  if (!project) throw new NotFoundError('Project not found');

  const isMember = project.ownerId === userId ||
    project.members.some((m) => m.userId === userId);
  if (!isMember) throw new ForbiddenError('You do not have access to this project');

  await cacheSet(cacheKey, project, CacheTTL.project);
  return project;
};

export const addMember = async (projectId: string, requesterId: string, email: string) => {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new NotFoundError('Project not found');
  if (project.ownerId !== requesterId) throw new ForbiddenError('Only the project owner can add members');

  const userToAdd = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true },
  });
  if (!userToAdd) throw new NotFoundError('User with that email not found');

  const existing = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: userToAdd.id } },
  });
  if (existing) throw new ConflictError('User is already a member of this project');

  await prisma.projectMember.create({
    data: { projectId, userId: userToAdd.id, role: 'member' },
  });

  await cacheDel(CacheKeys.project(projectId), CacheKeys.userProjects(userToAdd.id));
  return userToAdd;
};

export const removeMember = async (
  projectId: string,
  requesterId: string,
  memberUserId: string,
) => {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new NotFoundError('Project not found');
  if (project.ownerId !== requesterId) throw new ForbiddenError('Only the project owner can remove members');
  if (project.ownerId === memberUserId) throw new ForbiddenError('Cannot remove the project owner');

  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: memberUserId } },
  });
  if (!member) throw new NotFoundError('User is not a member of this project');

  await prisma.projectMember.delete({
    where: { projectId_userId: { projectId, userId: memberUserId } },
  });

  await cacheDel(CacheKeys.project(projectId), CacheKeys.userProjects(memberUserId));
};
