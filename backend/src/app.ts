import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { env } from './config/env';
import { prisma } from './models';
import { redis } from './config/redis';
import authRoutes from './routes/auth.routes';
import projectRoutes from './routes/project.routes';
import taskRoutes from './routes/task.routes';
import exportRoutes from './routes/export.routes';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
  app.use(compression());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  if (env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
  }

  // ── Health check — verifies DB + Redis connectivity ────────────────────────
  app.get('/health', async (_req: Request, res: Response) => {
    const checks: Record<string, 'ok' | 'error'> = {
      db: 'error',
      redis: 'error',
    };

    try {
      await prisma.$queryRaw`SELECT 1`;
      checks['db'] = 'ok';
    } catch { /* db unreachable */ }

    try {
      await redis.ping();
      checks['redis'] = 'ok';
    } catch { /* redis unreachable */ }

    const allOk = Object.values(checks).every((v) => v === 'ok');
    res.status(allOk ? 200 : 503).json({
      status: allOk ? 'ok' : 'degraded',
      checks,
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/tasks', taskRoutes);
  app.use('/api/exports', exportRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
