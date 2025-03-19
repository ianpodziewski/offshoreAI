import { NextRequest, NextResponse } from "next/server";
import { simpleDocumentService } from "@/utilities/simplifiedDocumentService";
import { isVercelKVConfigured, KV_CONFIG } from '@/configuration/storageConfig';

export const runtime = "nodejs";

/**
 * POST endpoint for syncing documents from localStorage to server storage
 */
export async function POST(req: NextRequest) {
  try {
    const { loanId } = await req.json();
    
    // Check if server storage is configured
    if (!isVercelKVConfigured() || KV_CONFIG.USE_FALLBACK) {
      return NextResponse.json({ 
        error: 'Server storage not properly configured', 
        storageMode: KV_CONFIG.USE_FALLBACK ? 'localStorage Fallback' : 'Not Configured'
      }, { status: 400 });
    }
    
    // Sync documents
    const syncResult = await simpleDocumentService.syncDocumentsToServer(loanId);
    
    if (!syncResult.success) {
      return NextResponse.json({
        error: 'Document synchronization failed',
        details: syncResult.errors,
        syncedCount: syncResult.syncedCount
      }, { status: 500 });
    }
    
    return NextResponse.json({
      message: `Successfully synced ${syncResult.syncedCount} documents to server storage`,
      syncedCount: syncResult.syncedCount,
      loanId: loanId || 'all'
    });
  } catch (error) {
    console.error('Error syncing documents:', error);
    return NextResponse.json({ 
      error: `Failed to sync documents: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
}

/**
 * GET endpoint for syncing documents from localStorage to server storage
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const loanId = url.searchParams.get('loanId');
    
    // Check if server storage is configured
    if (!isVercelKVConfigured() || KV_CONFIG.USE_FALLBACK) {
      return NextResponse.json({ 
        error: 'Server storage not properly configured', 
        storageMode: KV_CONFIG.USE_FALLBACK ? 'localStorage Fallback' : 'Not Configured'
      }, { status: 400 });
    }
    
    // Sync documents
    const syncResult = await simpleDocumentService.syncDocumentsToServer(loanId || undefined);
    
    if (!syncResult.success) {
      return NextResponse.json({
        error: 'Document synchronization failed',
        details: syncResult.errors,
        syncedCount: syncResult.syncedCount
      }, { status: 500 });
    }
    
    return NextResponse.json({
      message: `Successfully synced ${syncResult.syncedCount} documents to server storage`,
      syncedCount: syncResult.syncedCount,
      loanId: loanId || 'all'
    });
  } catch (error) {
    console.error('Error syncing documents:', error);
    return NextResponse.json({ 
      error: `Failed to sync documents: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
} 