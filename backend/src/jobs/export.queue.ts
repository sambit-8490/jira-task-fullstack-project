import { Queue } from 'bullmq';
import { redis } from '../config/redis';

export interface ExportJobData {
  exportId: string;
  projectId: string;
  userId: string;
}

export const exportQueue = new Queue<ExportJobData>('exports', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 200 },
  },
});
