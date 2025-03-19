import { NextResponse } from 'next/server';
import { storageService } from '@/services/storageService';

// GET handler for fetching a document by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const docId = params.id;
    
    if (!docId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }
    
    const document = await storageService.getDocument(docId);
    
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    
    return NextResponse.json({ document });
  } catch (error) {
    console.error(`Error fetching document:`, error);
    return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 });
  }
} 