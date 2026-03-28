import { PrismaClient } from '@prisma/client';
import supertest from 'supertest';
import { createApp } from '../src/app';
import { signAccessToken } from '../src/utils/jwt';

const testPrisma = new PrismaClient({
  datasources: { db: { url: process.env['TEST_DATABASE_URL'] ?? process.env['DATABASE_URL'] } },
});

export const app = createApp();
export const request = supertest(app);

export const prisma = testPrisma;

export const cleanDb = async () => {
  await testPrisma.export.deleteMany();
  await testPrisma.task.deleteMany();
  await testPrisma.projectMember.deleteMany();
  await testPrisma.project.deleteMany();
  await testPrisma.refreshToken.deleteMany();
  await testPrisma.user.deleteMany();
};

export const createTestUser = async (overrides?: {
  name?: string;
  email?: string;
  password?: string;
}) => {
  const bcrypt = await import('bcryptjs');
  const user = await testPrisma.user.create({
    data: {
      name: overrides?.name ?? 'Test User',
      email: overrides?.email ?? `test-${Date.now()}@example.com`,
      passwordHash: await bcrypt.hash(overrides?.password ?? 'password123', 10),
    },
  });
  const accessToken = signAccessToken({ sub: user.id, email: user.email, name: user.name });
  return { user, accessToken };
};

export const createTestProject = async (ownerId: string) => {
  const project = await testPrisma.project.create({
    data: {
      name: 'Test Project',
      description: 'A test project',
      ownerId,
      members: { create: { userId: ownerId, role: 'owner' } },
    },
  });
  return project;
};

export const createTestTask = async (projectId: string) => {
  return testPrisma.task.create({
    data: {
      projectId,
      title: 'Test Task',
      status: 'todo',
      priority: 'medium',
    },
  });
};
