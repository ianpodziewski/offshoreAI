import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { PINECONE_INDEX_NAME } from "@/configuration/pinecone";
import { simpleDocumentService, SimpleDocument } from "@/utilities/simplifiedDocumentService";
import { indexDocumentsForLoan } from '@/utilities/loanDocumentService';
import storageService from '@/services/storageService';
import { STORAGE_CONFIG, isRedisConfigured } from '@/configuration/storageConfig';

// Maximum characters that can be safely sent to the embeddings API
const MAX_EMBEDDING_CHARS = 8000;
const CHUNK_SIZE = 4000; // Size of document chunks
const LOAN_DOCUMENTS_PREFIX = "loan-docs"; // Prefix for loan documents to separate them from other content

const pineconeApiKey = process.env.PINECONE_API_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!pineconeApiKey) throw new Error("PINECONE_API_KEY is not set");
if (!openaiApiKey) throw new Error("OPENAI_API_KEY is not set");

const pineconeClient = new Pinecone({ apiKey: pineconeApiKey });
const pineconeIndex = pineconeClient.Index(PINECONE_INDEX_NAME);

// Don't initialize OpenAI client at the module level - we'll create a fresh instance in the request handlers
// to avoid "Cannot set properties of undefined" errors

export const runtime = "nodejs";

// Helper function to extract text from HTML content
function extractTextFromHtml(htmlContent: string): string {
  try {
    console.log(`Extracting text from HTML content of length: ${htmlContent.length}`);
    // Check if we have valid HTML content
    if (!htmlContent || typeof htmlContent !== 'string') {
      console.error("Invalid HTML content:", typeof htmlContent);
      return "";
    }
    
    // Simple regex-based extraction for HTML content
    const text = htmlContent
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    console.log(`Extracted text length: ${text.length}`);
    
    // Return empty string if the extraction produced nothing substantial
    if (text.length < 20) {
      console.warn("Extracted text is too short, possibly invalid HTML");
      return ""; 
    }
    
    return text;
  } catch (error) {
    console.error("Error extracting text from HTML:", error);
    return "";
  }
}

// Helper function to chunk text for embedding
function chunkText(text: string, chunkSize = CHUNK_SIZE): string[] {
  if (!text || text.length === 0) return [];
  
  console.log(`Chunking text of length: ${text.length}`);
  
  // Split text into sentences then recombine into chunks of approximately chunkSize
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: string[] = [];
  let currentChunk = '';
  
  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > chunkSize) {
      chunks.push(currentChunk);
      currentChunk = sentence;
    } else {
      currentChunk += ' ' + sentence;
    }
  }
  
  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }
  
  console.log(`Created ${chunks.length} chunks`);
  return chunks;
}

/**
 * API endpoint for indexing loan documents - compatibility version
 * This forwards requests to the newer /api/loan-documents/index-docs endpoint
 * POST /api/loan-documents/index
 */
export async function POST(req: NextRequest) {
  try {
    const { loanId } = await req.json();
    
    if (!loanId) {
      return NextResponse.json({ error: 'No loan ID provided' }, { status: 400 });
    }
    
    // Storage mode for logging and debugging
    const storageMode = STORAGE_CONFIG.USE_FALLBACK ? 'localStorage' : (isRedisConfigured() ? 'redis' : 'localStorage');
    console.log(`[Compatibility Route] Indexing documents for loan ${loanId} using storage mode: ${storageMode}`);
    
    // Get all documents for this loan
    const documents = await storageService.getDocumentsForLoan(loanId);
    console.log(`[Compatibility Route] Found ${documents.length} documents for loan ${loanId} to index`);
    
    if (!documents || documents.length === 0) {
      console.log(`[Compatibility Route] No documents found for loan ${loanId} using storage mode: ${storageMode}`);
      
      // Check for unassociated documents
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
    console.log(`[Compatibility Route] Beginning indexing process for ${documents.length} documents for loan ${loanId}`);
    const result = await indexDocumentsForLoan(loanId, documents);
    console.log(`[Compatibility Route] Indexing complete. Indexed ${result.indexedCount} out of ${documents.length} documents.`);

    return NextResponse.json({
      message: 'Documents indexed successfully',
      loanId,
      indexedDocuments: result.indexedCount,
      totalDocuments: documents.length,
      storageMode
    });
  } catch (error) {
    console.error('[Compatibility Route] Error indexing documents:', error);
    return NextResponse.json({ 
      error: `Failed to index documents: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
}

/**
 * API endpoint for checking document indexing status
 * GET /api/loan-documents/index?loanId=...
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
    console.log(`[Compatibility Route] Checking document status for loan ${loanId} using storage mode: ${storageMode}`);
    
    // Get all documents for this loan
    const documents = await storageService.getDocumentsForLoan(loanId);
    
    if (!documents || documents.length === 0) {
      // Check for unassociated documents
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
    console.error('[Compatibility Route] Error checking document status:', error);
    return NextResponse.json({ 
      error: `Failed to check document status: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
}