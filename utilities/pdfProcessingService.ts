import * as pdfjsLib from 'pdfjs-dist';
import { createWorker, type Worker } from 'tesseract.js';
import { PDFDocument } from 'pdf-lib';

// Document type definitions with their identifying characteristics
const DOCUMENT_SIGNATURES = {
  promissory_note: {
    keywords: ['promissory note', 'promise to pay', 'borrower', 'principal amount', 'interest rate'],
    required: ['promissory note', 'promise to pay'],
    score_threshold: 0.7
  },
  deed_of_trust: {
    keywords: ['deed of trust', 'trustor', 'trustee', 'beneficiary', 'security instrument'],
    required: ['deed of trust'],
    score_threshold: 0.7
  },
  closing_disclosure: {
    keywords: ['closing disclosure', 'loan terms', 'projected payments', 'costs at closing'],
    required: ['closing disclosure'],
    score_threshold: 0.7
  },
  property_appraisal: {
    keywords: ['appraisal report', 'market value', 'property description', 'comparable sales'],
    required: ['appraisal'],
    score_threshold: 0.6
  }
};

interface DocumentPage {
  pageNumber: number;
  text: string;
  imageData?: ImageData;
}

interface ClassificationResult {
  docType: string;
  confidence: number;
  startPage: number;
  endPage: number;
}

export class PdfProcessingService {
  constructor() {
    // Initialize PDF.js worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  }

  private async performOcr(canvas: HTMLCanvasElement): Promise<string> {
    let worker: Worker | null = null;
    try {
      worker = await createWorker();
      // @ts-ignore - Tesseract.js types are not up to date
      await worker.loadLanguage('eng');
      // @ts-ignore - Tesseract.js types are not up to date
      await worker.initialize('eng');
      // @ts-ignore - Tesseract.js types are not up to date
      const { data: { text } } = await worker.recognize(canvas);
      return text;
    } finally {
      if (worker) {
        await worker.terminate();
      }
    }
  }

  private async extractPageText(page: any): Promise<DocumentPage> {
    const textContent = await page.getTextContent();
    const text = textContent.items.map((item: any) => item.str).join(' ');
    
    // If text content is too sparse, use OCR
    if (text.trim().length < 100) {
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      await page.render({
        canvasContext: context!,
        viewport: viewport
      }).promise;
      
      const ocrText = await this.performOcr(canvas);
      
      return {
        pageNumber: page.pageNumber,
        text: ocrText,
        imageData: context!.getImageData(0, 0, canvas.width, canvas.height)
      };
    }

    return {
      pageNumber: page.pageNumber,
      text: text
    };
  }

  private calculateDocumentScore(text: string, docType: string): number {
    const signature = DOCUMENT_SIGNATURES[docType as keyof typeof DOCUMENT_SIGNATURES];
    if (!signature) return 0;

    const normalizedText = text.toLowerCase();
    
    // Check required keywords
    const hasRequired = signature.required.every(keyword => 
      normalizedText.includes(keyword.toLowerCase())
    );
    if (!hasRequired) return 0;

    // Calculate score based on keyword matches
    const matchedKeywords = signature.keywords.filter(keyword => 
      normalizedText.includes(keyword.toLowerCase())
    );

    return matchedKeywords.length / signature.keywords.length;
  }

  private async classifyPages(pages: DocumentPage[]): Promise<ClassificationResult[]> {
    const results: ClassificationResult[] = [];
    let currentType: string | null = null;
    let startPage = 0;
    let currentScore = 0;
    
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const scores = new Map<string, number>();

      // Calculate scores for each document type
      for (const docType of Object.keys(DOCUMENT_SIGNATURES)) {
        const score = this.calculateDocumentScore(page.text, docType);
        if (score > 0) {
          scores.set(docType, score);
        }
      }

      // Find the highest scoring document type
      let highestScore = 0;
      let highestType = null;
      
      scores.forEach((score, docType) => {
        if (score > highestScore) {
          highestScore = score;
          highestType = docType;
        }
      });

      // Handle document boundaries
      if (highestType !== currentType || i === pages.length - 1) {
        if (currentType && startPage < i) {
          const signature = DOCUMENT_SIGNATURES[currentType as keyof typeof DOCUMENT_SIGNATURES];
          if (currentScore >= (signature?.score_threshold || 0)) {
            results.push({
              docType: currentType,
              confidence: currentScore,
              startPage: startPage,
              endPage: i - 1
            });
          }
        }
        currentType = highestType;
        startPage = i;
        currentScore = highestScore;
      }
    }

    // Add the last document if it exists
    if (currentType && startPage < pages.length) {
      const signature = DOCUMENT_SIGNATURES[currentType as keyof typeof DOCUMENT_SIGNATURES];
      if (currentScore >= (signature?.score_threshold || 0)) {
        results.push({
          docType: currentType,
          confidence: currentScore,
          startPage: startPage,
          endPage: pages.length - 1
        });
      }
    }

    return results;
  }

  public async splitDocument(pdfData: ArrayBuffer): Promise<Array<{
    docType: string;
    category: 'loan' | 'legal' | 'financial' | 'misc';
    pdfBytes: Uint8Array;
    confidence: number;
  }>> {
    // Load the PDF
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
    const numPages = pdf.numPages;
    
    // Extract text from all pages
    const pages: DocumentPage[] = [];
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const pageData = await this.extractPageText(page);
      pages.push(pageData);
    }

    // Classify document sections
    const classifications = await this.classifyPages(pages);

    // Create individual PDFs for each classified section
    const splitDocuments = [];
    
    for (const classification of classifications) {
      const newPdf = await PDFDocument.create();
      const sourcePdf = await PDFDocument.load(pdfData);
      
      // Copy pages from source to new document
      for (let i = classification.startPage; i <= classification.endPage; i++) {
        const [page] = await newPdf.copyPages(sourcePdf, [i]);
        newPdf.addPage(page);
      }

      // Determine category based on document type
      let category: 'loan' | 'legal' | 'financial' | 'misc' = 'misc';
      if (classification.docType.includes('note') || classification.docType.includes('agreement')) {
        category = 'loan';
      } else if (classification.docType.includes('deed') || classification.docType.includes('trust')) {
        category = 'legal';
      } else if (classification.docType.includes('disclosure') || classification.docType.includes('appraisal')) {
        category = 'financial';
      }

      splitDocuments.push({
        docType: classification.docType,
        category: category,
        pdfBytes: await newPdf.save(),
        confidence: classification.confidence
      });
    }

    return splitDocuments;
  }
}

export const pdfProcessingService = new PdfProcessingService(); 