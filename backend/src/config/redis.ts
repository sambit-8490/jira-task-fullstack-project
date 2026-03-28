import Redis from 'ioredis';
import { env } from './env';

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,
});

redis.on('error', (err) => {
  if (env.NODE_ENV !== 'test') {
    console.error('[Redis] Connection error:', err.message);
  }
});

redis.on('connect', () => {
  if (env.NODE_ENV !== 'test') {
    console.log('[Redis] Connected');
  }
});

export const connectRedis = async (): Promise<void> => {
  try {
    await redis.connect();
  } catch {
    console.error('[Redis] Failed to connect');
  }
};
