/**
 * models/index.ts — single source of truth for the data layer.
 *
 * schema.prisma  → database schema (tables, enums, relations)
 *
 * Every other file in this codebase must import the Prisma client and Prisma
 * types exclusively from here — never directly from @prisma/client.
 */

import { PrismaClient } from '@prisma/client';
import { env } from '../config/env';

// ─── Singleton Prisma Client ───────────────────────────────────────────────────
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url:
          env.NODE_ENV === 'test' && env.TEST_DATABASE_URL
            ? env.TEST_DATABASE_URL
            : env.DATABASE_URL,
      },
    },
  });

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// ─── Prisma generated types ────────────────────────────────────────────────────
export type {
  User,
  Project,
  ProjectMember,
  Task,
  Export,
  RefreshToken,
  MemberRole,
  TaskStatus,
  Priority,
  ExportStatus,
} from '@prisma/client';

// ─── Custom DTO shapes used across services ────────────────────────────────────
// MemberRole is imported here solely to use inside this file's interface defs.
import type { MemberRole } from '@prisma/client';

export interface ProjectSummaryDTO {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  createdAt: Date;
  memberCount: number;
  taskCount: number;
  role: MemberRole;
}

export interface UserPublicDTO {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface AuthResultDTO {
  user: UserPublicDTO;
  accessToken: string;
  refreshToken: string;
}
