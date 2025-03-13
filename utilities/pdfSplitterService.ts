import { PDFDocument } from 'pdf-lib';
import { v4 as uuidv4 } from 'uuid';
import { SimpleDocument } from './simplifiedDocumentService';
import pdfParse from 'pdf-parse';

// Interface for document boundaries
interface DocumentBoundary {
  startPage: number;
  endPage: number;
  docType: string;
  category: 'loan' | 'legal' | 'financial' | 'misc';
  title: string;
}

// Interface for split result
export interface SplitResult {
  originalDocument: SimpleDocument;
  splitDocuments: SimpleDocument[];
  success: boolean;
  message: string;
}

// Document type patterns for identification
const DOCUMENT_PATTERNS = [
  {
    type: 'promissory_note',
    category: 'loan' as const,
    patterns: ['promissory note', 'promise to pay', 'loan note'],
    title: 'Promissory Note'
  },
  {
    type: 'deed_of_trust',
    category: 'legal' as const,
    patterns: ['deed of trust', 'security instrument', 'mortgage deed'],
    title: 'Deed of Trust'
  },
  {
    type: 'closing_disclosure',
    category: 'financial' as const,
    patterns: ['closing disclosure', 'settlement statement', 'closing statement'],
    title: 'Closing Disclosure'
  },
  {
    type: 'loan_agreement',
    category: 'loan' as const,
    patterns: ['loan agreement', 'credit agreement', 'financing agreement'],
    title: 'Loan Agreement'
  },
  {
    type: 'insurance_policy',
    category: 'legal' as const,
    patterns: ['insurance policy', 'insurance certificate', 'evidence of insurance'],
    title: 'Insurance Policy'
  },
  {
    type: 'property_appraisal',
    category: 'financial' as const,
    patterns: ['appraisal report', 'property valuation', 'market value analysis'],
    title: 'Property Appraisal'
  },
  {
    type: 'title_report',
    category: 'legal' as const,
    patterns: ['title report', 'title commitment', 'title insurance'],
    title: 'Title Report'
  },
  {
    type: 'escrow_agreement',
    category: 'financial' as const,
    patterns: ['escrow agreement', 'escrow instructions', 'escrow letter'],
    title: 'Escrow Agreement'
  }
];

/**
 * PDF Splitter Service
 * Provides functionality to analyze and split PDF loan document packages
 */
export const pdfSplitterService = {
  /**
   * Analyzes a PDF document to identify document boundaries
   * @param pdfBytes The PDF file as a Uint8Array
   * @returns Array of document boundaries
   */
  analyzeDocumentBoundaries: async (pdfBytes: Uint8Array): Promise<DocumentBoundary[]> => {
    try {
      // Load the PDF document
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const totalPages = pdfDoc.getPageCount();
      
      // Parse the PDF to extract text
      const pdfData = await pdfParse(Buffer.from(pdfBytes));
      const fullText = pdfData.text;
      
      // Split text by pages (approximate)
      const pageTexts: string[] = [];
      const avgCharsPerPage = fullText.length / totalPages;
      
      for (let i = 0; i < totalPages; i++) {
        const startChar = Math.floor(i * avgCharsPerPage);
        const endChar = Math.floor((i + 1) * avgCharsPerPage);
        pageTexts.push(fullText.substring(startChar, endChar));
      }
      
      // Identify document boundaries
      const boundaries: DocumentBoundary[] = [];
      let currentStartPage = 0;
      let currentDocType = '';
      let currentCategory: 'loan' | 'legal' | 'financial' | 'misc' = 'misc';
      let currentTitle = '';
      
      // Check each page for document type indicators
      for (let i = 0; i < pageTexts.length; i++) {
        const pageText = pageTexts[i].toLowerCase();
        
        // Check for new document start indicators
        let foundNewDoc = false;
        
        for (const docPattern of DOCUMENT_PATTERNS) {
          for (const pattern of docPattern.patterns) {
            if (pageText.includes(pattern)) {
              // If we already have a document in progress, save it
              if (currentDocType && i > currentStartPage) {
                boundaries.push({
                  startPage: currentStartPage,
                  endPage: i - 1,
                  docType: currentDocType,
                  category: currentCategory,
                  title: currentTitle
                });
              }
              
              // Start new document
              currentStartPage = i;
              currentDocType = docPattern.type;
              currentCategory = docPattern.category;
              currentTitle = docPattern.title;
              foundNewDoc = true;
              break;
            }
          }
          if (foundNewDoc) break;
        }
      }
      
      // Add the last document
      if (currentDocType) {
        boundaries.push({
          startPage: currentStartPage,
          endPage: totalPages - 1,
          docType: currentDocType,
          category: currentCategory,
          title: currentTitle
        });
      }
      
      // If no documents were identified, treat the whole PDF as one document
      if (boundaries.length === 0) {
        boundaries.push({
          startPage: 0,
          endPage: totalPages - 1,
          docType: 'general_document',
          category: 'misc',
          title: 'General Document'
        });
      }
      
      return boundaries;
    } catch (error) {
      console.error('Error analyzing document boundaries:', error);
      // Return a single boundary for the entire document as fallback
      return [{
        startPage: 0,
        endPage: 999, // Large number to include all pages
        docType: 'general_document',
        category: 'misc',
        title: 'General Document'
      }];
    }
  },
  
  /**
   * Splits a PDF document based on identified boundaries
   * @param pdfBytes The PDF file as a Uint8Array
   * @param boundaries Array of document boundaries
   * @returns Array of split PDF documents as Uint8Array
   */
  splitDocument: async (pdfBytes: Uint8Array, boundaries: DocumentBoundary[]): Promise<{bytes: Uint8Array, boundary: DocumentBoundary}[]> => {
    try {
      const sourcePdfDoc = await PDFDocument.load(pdfBytes);
      const splitDocuments: {bytes: Uint8Array, boundary: DocumentBoundary}[] = [];
      
      for (const boundary of boundaries) {
        // Create a new PDF document
        const newPdfDoc = await PDFDocument.create();
        
        // Copy pages from source document
        const pageIndicesToCopy = [];
        for (let i = boundary.startPage; i <= boundary.endPage; i++) {
          pageIndicesToCopy.push(i);
        }
        
        const copiedPages = await newPdfDoc.copyPages(sourcePdfDoc, pageIndicesToCopy);
        
        // Add copied pages to new document
        copiedPages.forEach(page => {
          newPdfDoc.addPage(page);
        });
        
        // Save the new document
        const newPdfBytes = await newPdfDoc.save();
        
        splitDocuments.push({
          bytes: newPdfBytes,
          boundary
        });
      }
      
      return splitDocuments;
    } catch (error) {
      console.error('Error splitting document:', error);
      throw error;
    }
  },
  
  /**
   * Converts a Uint8Array to a base64 string with PDF data URL prefix
   * @param bytes The PDF file as a Uint8Array
   * @returns Base64 string with PDF data URL prefix
   */
  bytesToBase64: (bytes: Uint8Array): string => {
    const base64 = Buffer.from(bytes).toString('base64');
    return `data:application/pdf;base64,${base64}`;
  },
  
  /**
   * Splits a loan document package into individual documents
   * @param document The original document to split
   * @param loanId The loan ID to associate with the split documents
   * @returns Promise with the split result
   */
  splitLoanPackage: async (document: SimpleDocument, loanId: string): Promise<SplitResult> => {
    try {
      // Extract base64 data from the document content
      let base64Data = document.content;
      if (base64Data.includes('base64')) {
        base64Data = base64Data.split(',')[1];
      }
      
      // Convert to buffer
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Analyze document boundaries
      const boundaries = await pdfSplitterService.analyzeDocumentBoundaries(buffer);
      
      // Split the document
      const splitDocs = await pdfSplitterService.splitDocument(buffer, boundaries);
      
      // Create SimpleDocument objects for each split document
      const splitDocuments: SimpleDocument[] = splitDocs.map((doc, index) => {
        const boundary = doc.boundary;
        const content = pdfSplitterService.bytesToBase64(doc.bytes);
        
        return {
          id: uuidv4(),
          loanId,
          filename: `${boundary.title || 'Document'}_${index + 1}.pdf`,
          fileType: 'application/pdf',
          fileSize: doc.bytes.length,
          dateUploaded: new Date().toISOString(),
          category: boundary.category,
          docType: boundary.docType,
          status: 'pending',
          content,
          notes: `Split from ${document.filename}`
        };
      });
      
      return {
        originalDocument: document,
        splitDocuments,
        success: true,
        message: `Successfully split document into ${splitDocuments.length} parts`
      };
    } catch (error) {
      console.error('Error splitting loan package:', error);
      return {
        originalDocument: document,
        splitDocuments: [],
        success: false,
        message: `Error splitting document: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}; 