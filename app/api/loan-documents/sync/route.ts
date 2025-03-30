import { NextRequest, NextResponse } from "next/server";
import { simpleDocumentService } from "@/utilities/simplifiedDocumentService";
import { STORAGE_CONFIG } from '@/configuration/storageConfig';

export const runtime = "nodejs";

/**
 * POST endpoint for syncing documents from localStorage
 */
export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const loanId = url.searchParams.get('loanId');
    
    if (!loanId) {
      return NextResponse.json({ error: 'No loan ID provided' }, { status: 400 });
    }
    
    // Since we only use localStorage now, we'll simply return success
    return NextResponse.json({
      message: `Documents for loan ${loanId} are already in localStorage storage`,
      syncedCount: 0,
      loanId: loanId
    });
  } catch (error) {
    console.error('Error processing document sync request:', error);
    return NextResponse.json({ 
      error: `Failed to process sync request: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
}

/**
 * GET endpoint for syncing documents from localStorage
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const loanId = url.searchParams.get('loanId');
    
    if (!loanId) {
      return NextResponse.json({ error: 'No loan ID provided' }, { status: 400 });
    }
    
    // Get document count for informational purposes
    const documents = simpleDocumentService.getDocumentsForLoan(loanId);
    
    return NextResponse.json({
      message: `Documents are already stored in localStorage (${documents.length} documents for loan ${loanId})`,
      documentCount: documents.length,
      loanId: loanId
    });
  } catch (error) {
    console.error('Error processing document sync request:', error);
    return NextResponse.json({ 
      error: `Failed to process sync request: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
} 