import { redis } from '../config/redis';

export const CacheKeys = {
  userProjects: (userId: string) => `projects:user:${userId}`,
  project: (projectId: string) => `project:${projectId}`,
};

export const CacheTTL = {
  userProjects: 300,  // 5 minutes
  project: 120,       // 2 minutes
};

export const cacheGet = async <T>(key: string): Promise<T | null> => {
  try {
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
};

export const cacheSet = async (key: string, value: unknown, ttlSeconds: number): Promise<void> => {
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch {
    // silently fail — cache is not critical
  }
};

export const cacheDel = async (...keys: string[]): Promise<void> => {
  try {
    if (keys.length > 0) await redis.del(...keys);
  } catch {
    // silently fail
  }
};
