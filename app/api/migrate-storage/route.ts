import { NextResponse } from 'next/server';
import { storageService } from '@/services/storageService';

/**
 * Migration API endpoint to transfer documents from localStorage to Redis
 * POST /api/migrate-storage
 */
export async function POST(request: Request) {
  try {
    // Use the existing migration function from storageService
    const result = await storageService.migrateFromLocalStorage();
    
    return NextResponse.json({
      success: true,
      message: `Migration complete: ${result.migrated} documents migrated, ${result.errors} errors`,
      ...result
    });
  } catch (error) {
    console.error('Error during storage migration:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to migrate storage',
        message: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    );
  }
} 