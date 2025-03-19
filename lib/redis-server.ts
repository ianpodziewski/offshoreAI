// This file is used ONLY on the server side
import Redis from 'ioredis';
import { STORAGE_CONFIG } from '@/configuration/storageConfig';

/**
 * Server-side Redis client
 * This should ONLY be imported in server components or API routes
 */
let redis: any = null;

// Initialize Redis if we have a URL and we're on the server
if (typeof process !== 'undefined' && process.env.REDIS_URL) {
  try {
    console.log(`Initializing Redis with URL: ${process.env.REDIS_URL.substring(0, 15)}...`);
    redis = new Redis(process.env.REDIS_URL);
    console.log('Server-side Redis client successfully initialized');
  } catch (error) {
    console.error('Failed to initialize Redis client:', error);
    redis = null;
  }
} else {
  console.log('Redis URL not found or not in server environment');
}

// Simple wrapper that logs all Redis operations
const withLogging = <T extends (...args: any[]) => Promise<any>>(
  operation: string,
  fn: T
): T => {
  return (async (...args: any[]) => {
    try {
      console.log(`Redis ${operation} operation starting with args:`, args);
      const result = await fn(...args);
      console.log(`Redis ${operation} operation successful`);
      return result;
    } catch (error) {
      console.error(`Redis ${operation} operation failed:`, error);
      throw error;
    }
  }) as T;
};

// Utility functions for Redis operations that should only be called server-side
const serverRedisUtil = {
  getRedisClient: () => redis,
  
  get: withLogging('GET', async (key: string): Promise<string | null> => {
    if (!redis) return null;
    return await redis.get(key);
  }),
  
  set: withLogging('SET', async (key: string, value: string): Promise<boolean> => {
    if (!redis) return false;
    await redis.set(key, value);
    return true;
  }),
  
  del: withLogging('DEL', async (key: string): Promise<boolean> => {
    if (!redis) return false;
    await redis.del(key);
    return true;
  }),
  
  sadd: withLogging('SADD', async (key: string, ...members: string[]): Promise<boolean> => {
    if (!redis) return false;
    await redis.sadd(key, ...members);
    return true;
  }),
  
  srem: withLogging('SREM', async (key: string, ...members: string[]): Promise<boolean> => {
    if (!redis) return false;
    await redis.srem(key, ...members);
    return true;
  }),
  
  smembers: withLogging('SMEMBERS', async (key: string): Promise<string[]> => {
    if (!redis) return [];
    return await redis.smembers(key);
  }),
  
  keys: withLogging('KEYS', async (pattern: string): Promise<string[]> => {
    if (!redis) return [];
    return await redis.keys(pattern);
  }),
  
  // Add a command to test Redis connectivity
  ping: withLogging('PING', async (): Promise<string> => {
    if (!redis) return 'DISCONNECTED';
    return await redis.ping();
  }),
};

export { serverRedisUtil }; 