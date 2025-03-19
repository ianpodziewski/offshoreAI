import { NextRequest, NextResponse } from "next/server";
import storageService from '@/services/storageService';

export const runtime = "nodejs";

/**
 * API endpoint for document information (formerly indexing)
 * POST /api/loan-documents/index-docs
 */
export async function POST(req: NextRequest) {
  try {
    const { loanId } = await req.json();
    
    if (!loanId) {
      return NextResponse.json({ error: 'No loan ID provided' }, { status: 400 });
    }
    
    console.log(`Retrieving documents for loan ${loanId}`);
    
    // Get all documents for this loan
    const documents = await storageService.getDocumentsForLoan(loanId);
    console.log(`Found ${documents.length} documents for loan ${loanId}`);
    
    if (!documents || documents.length === 0) {
      console.log(`No documents found for loan ${loanId}`);
      
      // Check if we have any documents without a loan ID that could be fixed
      const allDocs = await storageService.getAllDocuments(0, 1000);
      const unassociatedDocs = allDocs.documents.filter(doc => !doc.loanId || doc.loanId === 'undefined' || doc.loanId === 'null');
      const hasFixableDocuments = unassociatedDocs.length > 0;
      
      return NextResponse.json({ 
        error: 'No documents found for this loan', 
        loanId, 
        unassociatedDocuments: unassociatedDocs.length,
        hasFixableDocuments
      }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Documents retrieved successfully',
      loanId,
      documentCount: documents.length
    });
  } catch (error) {
    console.error('Error retrieving documents:', error);
    return NextResponse.json({ 
      error: `Failed to retrieve documents: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
}

/**
 * API endpoint for checking document status
 * GET /api/loan-documents/index-docs?loanId=...
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const loanId = url.searchParams.get('loanId');

    if (!loanId) {
      return NextResponse.json({ error: 'No loan ID provided' }, { status: 400 });
    }

    console.log(`Checking document status for loan ${loanId}`);
    
    // Get all documents for this loan
    const documents = await storageService.getDocumentsForLoan(loanId);
    
    if (!documents || documents.length === 0) {
      // Check if we have any documents without a loan ID that could be fixed
      const allDocs = await storageService.getAllDocuments(0, 1000);
      const unassociatedDocs = allDocs.documents.filter(doc => !doc.loanId || doc.loanId === 'undefined' || doc.loanId === 'null');
      const hasFixableDocuments = unassociatedDocs.length > 0;
      
      return NextResponse.json({ 
        message: 'No documents found for this loan', 
        loanId,
        unassociatedDocuments: unassociatedDocs.length,
        hasFixableDocuments
      });
    }

    return NextResponse.json({
      message: `Found ${documents.length} documents for loan ${loanId}`,
      documentCount: documents.length,
      loanId
    });
  } catch (error) {
    console.error('Error checking document status:', error);
    return NextResponse.json({ 
      error: `Failed to check document status: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
} 