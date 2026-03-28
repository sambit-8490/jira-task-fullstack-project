import { createApp } from './app';
import { env } from './config/env';
import { connectRedis } from './config/redis';
import { prisma } from './models';
import { startExportWorker } from './jobs/export.worker';
import { cleanupExpiredTokens } from './services/auth.service';

const start = async () => {
  try {
    // ── 1. Connect Redis (BullMQ + cache) ──────────────────────────────────────
    await connectRedis();

    // ── 2. Verify Postgres is reachable ────────────────────────────────────────
    await prisma.$connect();
    console.log('[DB] Connected to PostgreSQL');

    // ── 3. Housekeeping ────────────────────────────────────────────────────────
    await cleanupExpiredTokens();

    // ── 4. Start BullMQ export worker ──────────────────────────────────────────
    const worker = startExportWorker();
    console.log('[Worker] Export worker started');

    // ── 5. Start HTTP server ───────────────────────────────────────────────────
    const app = createApp();
    const server = app.listen(env.PORT, () => {
      console.log(`[Server] Listening on http://localhost:${env.PORT}  [${env.NODE_ENV}]`);
    });

    // ── Graceful shutdown ──────────────────────────────────────────────────────
    const shutdown = async (signal: string) => {
      console.log(`\n[Server] ${signal} — shutting down gracefully…`);
      server.close(async () => {
        await worker.close();
        await prisma.$disconnect();
        console.log('[Server] Shutdown complete');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    console.error('[Server] Fatal startup error:', err);
    process.exit(1);
  }
};

start();
