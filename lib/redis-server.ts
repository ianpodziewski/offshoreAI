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
    redis = new Redis(process.env.REDIS_URL);
    console.log('Server-side Redis client initialized');
  } catch (error) {
    console.error('Failed to initialize Redis client:', error);
    redis = null;
  }
}

// Utility functions for Redis operations that should only be called server-side
const serverRedisUtil = {
  getRedisClient: () => redis,
  
  get: async (key: string): Promise<string | null> => {
    if (!redis) return null;
    try {
      return await redis.get(key);
    } catch (error) {
      console.error(`Redis GET error for key ${key}:`, error);
      return null;
    }
  },
  
  set: async (key: string, value: string): Promise<boolean> => {
    if (!redis) return false;
    try {
      await redis.set(key, value);
      return true;
    } catch (error) {
      console.error(`Redis SET error for key ${key}:`, error);
      return false;
    }
  },
  
  del: async (key: string): Promise<boolean> => {
    if (!redis) return false;
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error(`Redis DEL error for key ${key}:`, error);
      return false;
    }
  },
  
  sadd: async (key: string, ...members: string[]): Promise<boolean> => {
    if (!redis) return false;
    try {
      await redis.sadd(key, ...members);
      return true;
    } catch (error) {
      console.error(`Redis SADD error for key ${key}:`, error);
      return false;
    }
  },
  
  srem: async (key: string, ...members: string[]): Promise<boolean> => {
    if (!redis) return false;
    try {
      await redis.srem(key, ...members);
      return true;
    } catch (error) {
      console.error(`Redis SREM error for key ${key}:`, error);
      return false;
    }
  },
  
  smembers: async (key: string): Promise<string[]> => {
    if (!redis) return [];
    try {
      return await redis.smembers(key);
    } catch (error) {
      console.error(`Redis SMEMBERS error for key ${key}:`, error);
      return [];
    }
  },
  
  keys: async (pattern: string): Promise<string[]> => {
    if (!redis) return [];
    try {
      return await redis.keys(pattern);
    } catch (error) {
      console.error(`Redis KEYS error for pattern ${pattern}:`, error);
      return [];
    }
  },
};

export { serverRedisUtil }; 