import { prisma } from '../models';
import { ForbiddenError, NotFoundError } from '../utils/errors';
import { exportQueue } from '../jobs/export.queue';

export const triggerExport = async (projectId: string, userId: string) => {
  // Verify project access and ownership
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new NotFoundError('Project not found');

  if (project.ownerId !== userId) {
    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });
    if (!member) throw new ForbiddenError('You do not have access to this project');
    throw new ForbiddenError('Only the project owner can trigger exports');
  }

  const exportRecord = await prisma.export.create({
    data: { projectId, userId, status: 'pending' },
  });

  await exportQueue.add('export-project', { exportId: exportRecord.id, projectId, userId }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 200,
  });

  return exportRecord;
};

export const getExportStatus = async (exportId: string, userId: string) => {
  const exportRecord = await prisma.export.findUnique({ where: { id: exportId } });
  if (!exportRecord) throw new NotFoundError('Export not found');
  if (exportRecord.userId !== userId) throw new ForbiddenError('Access denied');
  return exportRecord;
};

export const getUserExports = async (userId: string) => {
  return prisma.export.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { project: { select: { id: true, name: true } } },
  });
};
