import { NextResponse } from 'next/server';
import { storageService } from '@/services/storageService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const loanId = searchParams.get('loanId');
    
    if (loanId) {
      // Get documents for a specific loan
      const documents = await storageService.getDocumentsForLoan(loanId);
      return NextResponse.json({ documents });
    } else {
      // Get all documents with pagination
      const limit = Number(searchParams.get('limit') || '1000');
      const cursor = Number(searchParams.get('cursor') || '0');
      const result = await storageService.getAllDocuments(limit, cursor);
      return NextResponse.json(result);
    }
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const document = await request.json();
    const result = await storageService.saveDocument(document);
    return NextResponse.json({ document: result });
  } catch (error) {
    console.error('Error saving document:', error);
    return NextResponse.json({ error: 'Failed to save document' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const docId = searchParams.get('id');
    
    if (!docId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }
    
    const success = await storageService.deleteDocument(docId);
    return NextResponse.json({ success });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
} 