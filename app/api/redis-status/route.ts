import { NextRequest, NextResponse } from "next/server";
import { serverRedisUtil } from '@/lib/redis-server';
import { STORAGE_CONFIG, isRedisConfigured } from '@/configuration/storageConfig';

export const runtime = "nodejs";

/**
 * API endpoint for checking Redis connection status
 * GET /api/redis-status
 */
export async function GET(req: NextRequest) {
  try {
    // Check if Redis is configured
    const redisConfigured = isRedisConfigured();
    const redisUrl = process.env.REDIS_URL || 'Not configured';
    
    // Preview of Redis URL (safe for logging)
    const redisUrlPreview = redisUrl !== 'Not configured' 
      ? `${redisUrl.substring(0, 15)}...` 
      : 'Not configured';
    
    // Storage mode information
    const storageMode = STORAGE_CONFIG.USE_FALLBACK 
      ? 'localStorage' 
      : (redisConfigured ? 'redis' : 'localStorage');
    
    let pingResult = null;
    let redisConnected = false;
    
    // Try to ping Redis if it's configured
    if (redisConfigured) {
      try {
        pingResult = await serverRedisUtil.ping();
        redisConnected = pingResult === 'PONG';
        console.log(`Redis ping result: ${pingResult}`);
      } catch (pingError) {
        console.error('Error pinging Redis:', pingError);
        pingResult = `Error: ${pingError instanceof Error ? pingError.message : 'Unknown error'}`;
      }
    }
    
    // Return status information
    return NextResponse.json({
      redis_configured: redisConfigured,
      redis_url_preview: redisUrlPreview,
      redis_connected: redisConnected,
      ping_result: pingResult,
      storage_mode: storageMode,
      use_fallback: STORAGE_CONFIG.USE_FALLBACK,
      server_timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking Redis status:', error);
    return NextResponse.json({ 
      error: `Failed to check Redis status: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
} 