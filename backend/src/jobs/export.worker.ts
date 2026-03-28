import { Worker } from 'bullmq';
import path from 'path';
import fs from 'fs';
import { createObjectCsvWriter } from 'csv-writer';
import { prisma } from '../models';
import { redis } from '../config/redis';
import { env } from '../config/env';
import { ExportJobData } from './export.queue';

const ensureExportsDir = (): string => {
  const dir = path.resolve(env.EXPORTS_DIR);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
};

export const startExportWorker = () => {
  const worker = new Worker<ExportJobData>(
    'exports',
    async (job) => {
      const { exportId, projectId } = job.data;

      await prisma.export.update({
        where: { id: exportId },
        data: { status: 'processing' },
      });

      const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          tasks: {
            include: { assignee: { select: { name: true } } },
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!project) throw new Error(`Project ${projectId} not found`);

      const exportsDir = ensureExportsDir();
      const filePath = path.join(exportsDir, `${exportId}.csv`);

      // ── Task rows (one row per task, spec: title/status/priority/assignee/due/created) ──
      const taskRows = project.tasks.map((task) => ({
        title: task.title,
        status: task.status,
        priority: task.priority,
        assignee: task.assignee?.name ?? 'Unassigned',
        due_date: task.dueDate
          ? new Date(task.dueDate).toISOString().split('T')[0]
          : '',
        created_at: task.createdAt.toISOString().split('T')[0],
      }));

      // ── Summary rows ──────────────────────────────────────────────────────────────────
      const total = project.tasks.length;
      const byStatus = project.tasks.reduce<Record<string, number>>((acc, t) => {
        acc[t.status] = (acc[t.status] ?? 0) + 1;
        return acc;
      }, {});
      const byPriority = project.tasks.reduce<Record<string, number>>((acc, t) => {
        acc[t.priority] = (acc[t.priority] ?? 0) + 1;
        return acc;
      }, {});

      const summaryRows = [
        { title: '--- SUMMARY ---', status: '', priority: '', assignee: '', due_date: '', created_at: '' },
        { title: 'Total tasks',     status: String(total),                       priority: '', assignee: '', due_date: '', created_at: '' },
        { title: 'Todo',            status: String(byStatus['todo'] ?? 0),       priority: '', assignee: '', due_date: '', created_at: '' },
        { title: 'In Progress',     status: String(byStatus['in_progress'] ?? 0),priority: '', assignee: '', due_date: '', created_at: '' },
        { title: 'Done',            status: String(byStatus['done'] ?? 0),       priority: '', assignee: '', due_date: '', created_at: '' },
        { title: 'Low priority',    status: '',                                  priority: String(byPriority['low'] ?? 0),    assignee: '', due_date: '', created_at: '' },
        { title: 'Medium priority', status: '',                                  priority: String(byPriority['medium'] ?? 0), assignee: '', due_date: '', created_at: '' },
        { title: 'High priority',   status: '',                                  priority: String(byPriority['high'] ?? 0),   assignee: '', due_date: '', created_at: '' },
      ];

      const csvWriter = createObjectCsvWriter({
        path: filePath,
        header: [
          { id: 'title',      title: 'Title' },
          { id: 'status',     title: 'Status' },
          { id: 'priority',   title: 'Priority' },
          { id: 'assignee',   title: 'Assignee' },
          { id: 'due_date',   title: 'Due Date' },
          { id: 'created_at', title: 'Created' },
        ],
      });

      // Write project info as comment rows at the top, then tasks, then summary
      const projectInfoRows = [
        { title: `Project: ${project.name}`, status: '', priority: '', assignee: '', due_date: '', created_at: project.createdAt.toISOString().split('T')[0] },
        { title: `Description: ${project.description ?? '—'}`, status: '', priority: '', assignee: '', due_date: '', created_at: '' },
        { title: '--- TASKS ---', status: '', priority: '', assignee: '', due_date: '', created_at: '' },
      ];

      await csvWriter.writeRecords([...projectInfoRows, ...taskRows, ...summaryRows]);

      await prisma.export.update({
        where: { id: exportId },
        data: { status: 'completed', filePath, completedAt: new Date() },
      });

      console.log(`[ExportWorker] Export ${exportId} completed (${total} tasks)`);
    },
    { connection: redis, concurrency: 5 },
  );

  worker.on('failed', async (job, err) => {
    if (!job) return;
    const isLastAttempt = job.attemptsMade >= (job.opts.attempts ?? 1);
    if (isLastAttempt) {
      console.error(`[ExportWorker] Export ${job.data.exportId} permanently failed after ${job.attemptsMade} attempts: ${err.message}`);
      await prisma.export
        .update({ where: { id: job.data.exportId }, data: { status: 'failed' } })
        .catch(() => {});
    } else {
      console.warn(`[ExportWorker] Export ${job.data.exportId} — attempt ${job.attemptsMade} failed, retrying…`);
    }
  });

  worker.on('error', (err) => {
    console.error('[ExportWorker] Unexpected worker error:', err.message);
  });

  return worker;
};
