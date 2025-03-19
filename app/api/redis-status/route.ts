import { NextResponse } from 'next/server';
import { serverRedisUtil } from '@/lib/redis-server';

/**
 * Simple API endpoint to check Redis connectivity
 * GET /api/redis-status
 */
export async function GET(request: Request) {
  try {
    // Check if Redis is configured
    const redisConfigured = !!process.env.REDIS_URL;
    
    // Attempt to ping Redis
    let pingResult = 'Not attempted';
    let isConnected = false;
    
    if (redisConfigured) {
      try {
        pingResult = await serverRedisUtil.ping();
        isConnected = pingResult === 'PONG';
      } catch (error) {
        console.error('Redis ping error:', error);
        pingResult = error instanceof Error ? error.message : String(error);
      }
    }
    
    return NextResponse.json({
      redis_configured: redisConfigured,
      redis_url_preview: redisConfigured ? `${process.env.REDIS_URL!.substring(0, 15)}...` : 'Not configured',
      redis_connected: isConnected,
      ping_result: pingResult,
      server_timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking Redis status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check Redis status',
        message: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    );
  }
} 