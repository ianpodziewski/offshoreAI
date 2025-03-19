import { NextRequest, NextResponse } from "next/server";
import { indexDocumentsForLoan } from '@/utilities/loanDocumentService';
import storageService from '@/services/storageService';
import { STORAGE_CONFIG, isRedisConfigured } from '@/configuration/storageConfig';

export const runtime = "nodejs";

/**
 * API endpoint for indexing loan documents
 * POST /api/loan-documents/index-docs
 */
export async function POST(req: NextRequest) {
  try {
    const { loanId } = await req.json();
    
    if (!loanId) {
      return NextResponse.json({ error: 'No loan ID provided' }, { status: 400 });
    }
    
    // Storage mode for logging and debugging
    const storageMode = STORAGE_CONFIG.USE_FALLBACK ? 'localStorage' : (isRedisConfigured() ? 'redis' : 'localStorage');
    console.log(`Indexing documents for loan ${loanId} using storage mode: ${storageMode}`);
    
    // Get all documents for this loan
    const documents = await storageService.getDocumentsForLoan(loanId);
    console.log(`Found ${documents.length} documents for loan ${loanId} to index`);
    
    if (!documents || documents.length === 0) {
      console.log(`No documents found for loan ${loanId} using storage mode: ${storageMode}`);
      
      // Check if we have any documents without a loan ID that could be fixed
      const allDocs = await storageService.getAllDocuments(0, 1000);
      const unassociatedDocs = allDocs.documents.filter(doc => !doc.loanId || doc.loanId === 'undefined' || doc.loanId === 'null');
      const hasFixableDocuments = unassociatedDocs.length > 0;
      
      return NextResponse.json({ 
        error: 'No documents found for this loan', 
        loanId, 
        unassociatedDocuments: unassociatedDocs.length,
        hasFixableDocuments,
        storageMode
      }, { status: 404 });
    }

    // Start the indexing process
    console.log(`Beginning indexing process for ${documents.length} documents for loan ${loanId}`);
    const result = await indexDocumentsForLoan(loanId, documents);
    console.log(`Indexing complete. Indexed ${result.indexedCount} out of ${documents.length} documents.`);

    return NextResponse.json({
      message: 'Documents indexed successfully',
      loanId,
      indexedDocuments: result.indexedCount,
      totalDocuments: documents.length,
      storageMode
    });
  } catch (error) {
    console.error('Error indexing documents:', error);
    return NextResponse.json({ 
      error: `Failed to index documents: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
}

/**
 * API endpoint for checking document indexing status
 * GET /api/loan-documents/index-docs?loanId=...
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const loanId = url.searchParams.get('loanId');

    if (!loanId) {
      return NextResponse.json({ error: 'No loan ID provided' }, { status: 400 });
    }

    // Storage mode for logging and debugging
    const storageMode = STORAGE_CONFIG.USE_FALLBACK ? 'localStorage' : (isRedisConfigured() ? 'redis' : 'localStorage');
    console.log(`Checking document status for loan ${loanId} using storage mode: ${storageMode}`);
    
    // Get all documents for this loan
    const documents = await storageService.getDocumentsForLoan(loanId);
    
    if (!documents || documents.length === 0) {
      // Check if we have any documents without a loan ID that could be fixed
      const allDocs = await storageService.getAllDocuments(0, 1000);
      const unassociatedDocs = allDocs.documents.filter(doc => !doc.loanId || doc.loanId === 'undefined' || doc.loanId === 'null');
      const hasFixableDocuments = unassociatedDocs.length > 0;
      
      return NextResponse.json({ 
        message: 'No documents found for this loan', 
        indexed: false,
        loanId,
        unassociatedDocuments: unassociatedDocs.length,
        hasFixableDocuments,
        storageMode
      });
    }

    return NextResponse.json({
      message: `Found ${documents.length} documents for loan ${loanId}`,
      documentCount: documents.length,
      loanId,
      storageMode
    });
  } catch (error) {
    console.error('Error checking document status:', error);
    return NextResponse.json({ 
      error: `Failed to check document status: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
} 