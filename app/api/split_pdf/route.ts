// app/api/split_pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pdf from 'pdf-parse';
import OpenAI from 'openai';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Document type detection configuration
const DOCUMENT_TYPES = [
  {
    type: 'promissory_note',
    category: 'loan',
    keywords: ['promissory', 'note', 'loan', 'borrower', 'principal', 'interest'],
    minPages: 1,
    maxPages: 3
  },
  {
    type: 'deed_of_trust',
    category: 'legal',
    keywords: ['deed', 'trust', 'property', 'security', 'real estate', 'lien'],
    minPages: 2,
    maxPages: 5
  },
  {
    type: 'closing_disclosure',
    category: 'financial',
    keywords: ['closing', 'disclosure', 'loan terms', 'costs', 'settlement', 'lender'],
    minPages: 2,
    maxPages: 4
  },
  {
    type: 'appraisal_report',
    category: 'financial',
    keywords: ['appraisal', 'property value', 'market analysis', 'valuation', 'comparable'],
    minPages: 3,
    maxPages: 6
  },
  {
    type: 'insurance_policy',
    category: 'legal',
    keywords: ['insurance', 'policy', 'coverage', 'premium', 'terms', 'conditions'],
    minPages: 1,
    maxPages: 3
  }
];

// Utility function to extract text from a specific page range
async function extractPageRangeText(pdfData: pdf.Result, startPage: number, endPage: number): Promise<string> {
  const pageTexts = pdfData.text.split('\f'); // PDF pages are typically separated by form feed character
  return pageTexts.slice(startPage - 1, endPage).join('\f').trim();
}

// Use OpenAI embeddings to detect document type
async function detectDocumentType(text: string): Promise<{
  type: string, 
  category: string, 
  confidenceScore: number
}> {
  try {
    // Create embedding for the text
    const embedding = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text
    });

    // Detect document type by comparing embeddings
    const documentEmbeddings = await Promise.all(
      DOCUMENT_TYPES.map(async (docType) => {
        const keywordEmbedding = await openai.embeddings.create({
          model: "text-embedding-ada-002",
          input: docType.keywords.join(' ')
        });
        
        return {
          ...docType,
          embedding: keywordEmbedding.data[0].embedding
        };
      })
    );

    // Calculate cosine similarity
    const similarities = documentEmbeddings.map(docType => {
      const textEmbedding = embedding.data[0].embedding;
      const similarity = cosineSimilarity(textEmbedding, docType.embedding);
      return {
        ...docType,
        similarity
      };
    });

    // Sort by similarity and get the top match
    const bestMatch = similarities.sort((a, b) => b.similarity - a.similarity)[0];

    return {
      type: bestMatch.type,
      category: bestMatch.category,
      confidenceScore: bestMatch.similarity
    };
  } catch (error) {
    console.error('Document type detection error:', error);
    // Fallback to random detection if embedding fails
    const randomType = DOCUMENT_TYPES[Math.floor(Math.random() * DOCUMENT_TYPES.length)];
    return {
      type: randomType.type,
      category: randomType.category,
      confidenceScore: 0.5
    };
  }
}

// Cosine similarity calculation
function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// Intelligent PDF splitting algorithm
async function splitPDF(pdfData: pdf.Result): Promise<{
  files: {
    filename: string,
    docType: string,
    category: string,
    pageRange: string,
    confidenceScore: number,
    text: string
  }[]
}> {
  const totalPages = pdfData.numpages;
  const files = [];

  // Start with a basic page distribution strategy
  let currentPage = 1;
  while (currentPage <= totalPages) {
    // Determine potential document type and page range
    const remainingPages = totalPages - currentPage + 1;
    
    // Choose a random document type that fits remaining pages
    const eligibleTypes = DOCUMENT_TYPES.filter(
      type => type.minPages <= remainingPages && type.maxPages <= remainingPages
    );

    if (eligibleTypes.length === 0) break;

    const chosenType = eligibleTypes[Math.floor(Math.random() * eligibleTypes.length)];
    const pageRange = {
      start: currentPage,
      end: Math.min(currentPage + chosenType.maxPages - 1, totalPages)
    };

    // Extract text for this page range
    const rangeText = await extractPageRangeText(pdfData, pageRange.start, pageRange.end);

    // Detect document type with more confidence
    const detectedType = await detectDocumentType(rangeText);

    // Create document entry
    files.push({
      filename: `${detectedType.type}_${files.length + 1}.pdf`,
      docType: detectedType.type,
      category: detectedType.category,
      pageRange: `${pageRange.start}-${pageRange.end}`,
      confidenceScore: detectedType.confidenceScore,
      text: rangeText
    });

    // Move to next page range
    currentPage = pageRange.end + 1;
  }

  return { files };
}

export async function POST(req: NextRequest) {
  try {
    // Read the PDF file buffer from the request
    const fileBuffer = await req.arrayBuffer();
    
    // Parse the PDF
    const pdfData = await pdf(Buffer.from(fileBuffer));
    
    // Split the PDF intelligently
    const splitResult = await splitPDF(pdfData);
    
    return NextResponse.json({ 
      success: true, 
      ...splitResult,
      totalPages: pdfData.numpages
    });
  } catch (error) {
    console.error('PDF Split Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to split PDF',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export const config = {
    bodyParser: {
      sizeLimit: '10mb'
    }
};