import { NextRequest, NextResponse } from 'next/server';
import { simpleDocumentService, SimpleDocument } from '@/utilities/simplifiedDocumentService';
import { pdfProcessingService } from '@/utilities/pdfProcessingService';

export async function POST(req: NextRequest) {
  try {
    const { documentId, loanId } = await req.json();

    // Get the original document
    const originalDoc = await simpleDocumentService.getDocumentById(documentId);
    if (!originalDoc) {
      return NextResponse.json({ 
        success: false, 
        message: 'Original document not found' 
      }, { status: 404 });
    }

    // Convert base64 to ArrayBuffer
    const base64Data = originalDoc.content.replace(/^data:application\/pdf;base64,/, '');
    const binaryData = Buffer.from(base64Data, 'base64');
    const pdfData = binaryData.buffer;

    // Process and split the PDF
    const splitDocuments = await pdfProcessingService.splitDocument(pdfData);

    // Create new documents in the system
    const createdDocs = await Promise.all(
      splitDocuments.map(async (doc) => {
        // Convert the PDF bytes back to base64
        const base64Content = Buffer.from(doc.pdfBytes).toString('base64');
        const dataUrl = `data:application/pdf;base64,${base64Content}`;

        // Create a new document
        return simpleDocumentService.addDocument(
          new File([doc.pdfBytes], `${doc.docType}.pdf`, { type: 'application/pdf' }),
          loanId,
          { 
            docType: doc.docType, 
            category: doc.category 
          }
        );
      })
    );

    // Filter out any null documents and map the results
    const validDocs = createdDocs.filter((doc): doc is SimpleDocument => doc !== null);

    return NextResponse.json({
      success: true,
      message: 'Document split successfully',
      splitDocuments: validDocs.map(doc => ({
        id: doc.id,
        filename: doc.filename,
        docType: doc.docType,
        category: doc.category
      }))
    });

  } catch (error) {
    console.error('Error splitting document:', error);
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Error splitting document' 
    }, { status: 500 });
  }
} 