import { NextRequest, NextResponse } from 'next/server';
import { simpleDocumentService, SimpleDocument } from '@/utilities/simplifiedDocumentService';

export async function POST(req: NextRequest) {
  try {
    const { documentId, loanId } = await req.json();

    // Get the original document
    const originalDoc = simpleDocumentService.getDocumentById(documentId);
    if (!originalDoc) {
      return NextResponse.json({ 
        success: false, 
        message: 'Original document not found' 
      }, { status: 404 });
    }

    // Here we would normally use a PDF processing library to split the document
    // For now, we'll simulate the split by creating new documents for each expected type
    const expectedDocTypes: Array<{
      docType: string;
      label: string;
      category: 'loan' | 'legal' | 'financial' | 'misc' | 'chat';
    }> = [
      { docType: 'promissory_note', label: 'Promissory Note', category: 'legal' },
      { docType: 'deed_of_trust', label: 'Deed of Trust', category: 'legal' },
      { docType: 'closing_disclosure', label: 'Closing Disclosure', category: 'financial' },
      { docType: 'property_appraisal', label: 'Property Appraisal', category: 'financial' }
    ];

    // Simulate document splitting and classification
    const splitDocuments = expectedDocTypes.map(docType => {
      // In a real implementation, we would:
      // 1. Use OCR/ML to identify document types
      // 2. Extract relevant pages for each document type
      // 3. Create new PDFs from the extracted pages
      // For now, we'll create placeholder documents
      return simpleDocumentService.addDocument(
        new File([originalDoc.content], `${docType.docType}.pdf`, { type: 'application/pdf' }),
        loanId,
        { docType: docType.docType, category: docType.category }
      );
    });

    // Wait for all documents to be created
    const createdDocs = await Promise.all(splitDocuments);

    return NextResponse.json({
      success: true,
      message: 'Document split successfully',
      splitDocuments: createdDocs
    });

  } catch (error) {
    console.error('Error splitting document:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error splitting document' 
    }, { status: 500 });
  }
} 