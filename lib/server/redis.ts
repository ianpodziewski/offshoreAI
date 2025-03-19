// lib/server/redis.ts
import 'server-only';
import { STORAGE_CONFIG } from '../../configuration/storageConfig';

// Define a type for Redis
type RedisType = any;
let redis: RedisType | null = null;
let Redis: any = null;

// Dynamic import to prevent client-side bundling
if (typeof window === 'undefined') {
  // This code only runs on the server
  import('ioredis').then((module) => {
    Redis = module.default;
  }).catch((err: Error) => {
    console.error('Failed to import ioredis:', err);
  });
}

// Create a function to lazy-initialize Redis to avoid issues during build
export function getRedisClient() {
  if (!redis && Redis && STORAGE_CONFIG.REDIS_URL) {
    console.log('🔄 Initializing Redis client');
    redis = new Redis(STORAGE_CONFIG.REDIS_URL, {
      // Add any additional Redis configuration options here
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => {
        // Exponential backoff with max of 2000ms
        return Math.min(times * 50, 2000);
      }
    });
    
    redis.on('error', (err: Error) => {
      console.error('❌ Redis connection error:', err);
    });
    
    redis.on('connect', () => {
      console.log('✅ Connected to Redis');
    });
  }
  
  return redis;
}

// Helper function to safely stringify objects for Redis
export function safeStringify(obj: any): string {
  try {
    return JSON.stringify(obj);
  } catch (error) {
    console.error('Error stringifying object for Redis:', error);
    return '{}';
  }
}

// Helper function to safely parse Redis responses
export function safeParse(str: string | null): any {
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch (error) {
    console.error('Error parsing Redis response:', error);
    return null;
  }
}

// Check if Redis is available
export function isRedisAvailable(): boolean {
  return !!getRedisClient();
} 