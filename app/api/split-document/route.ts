import { NextRequest, NextResponse } from 'next/server';
import { simpleDocumentService } from '@/utilities/simplifiedDocumentService';
import { pdfSplitterService } from '@/utilities/pdfSplitterService';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { documentId, loanId } = data;
    
    if (!documentId) {
      return NextResponse.json({ success: false, message: 'Document ID is required' }, { status: 400 });
    }
    
    // Get the document to split
    const document = simpleDocumentService.getDocumentById(documentId);
    
    if (!document) {
      return NextResponse.json({ success: false, message: 'Document not found' }, { status: 404 });
    }
    
    // Use the document's loanId if none provided
    const targetLoanId = loanId || document.loanId;
    
    // Split the document
    const splitResult = await pdfSplitterService.splitLoanPackage(document, targetLoanId);
    
    if (!splitResult.success) {
      return NextResponse.json({ 
        success: false, 
        message: splitResult.message 
      }, { status: 500 });
    }
    
    // Save the split documents
    const savedDocuments = [];
    for (const doc of splitResult.splitDocuments) {
      const savedDoc = await simpleDocumentService.addDocumentDirectly(doc);
      if (savedDoc) {
        savedDocuments.push(savedDoc);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully split document into ${savedDocuments.length} parts`,
      originalDocument: {
        id: document.id,
        filename: document.filename
      },
      splitDocuments: savedDocuments.map(doc => ({
        id: doc.id,
        filename: doc.filename,
        docType: doc.docType,
        category: doc.category
      }))
    });
  } catch (error) {
    console.error('Error in split-document API:', error);
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 