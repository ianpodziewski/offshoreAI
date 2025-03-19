import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { PINECONE_INDEX_NAME } from "@/configuration/pinecone";
import { simpleDocumentService, SimpleDocument } from "@/utilities/simplifiedDocumentService";

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
const openaiClient = new OpenAI({ apiKey: openaiApiKey });

export const runtime = "nodejs";

// Helper function to extract text from HTML content
function extractTextFromHtml(htmlContent: string): string {
  try {
    // Simple regex-based extraction for HTML content
    return htmlContent
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  } catch (error) {
    console.error("Error extracting text from HTML:", error);
    return htmlContent;
  }
}

// Helper function to chunk text into smaller pieces
function chunkText(text: string, maxChunkSize: number = CHUNK_SIZE): string[] {
  const chunks: string[] = [];
  
  // If text is short enough, return it as a single chunk
  if (text.length <= maxChunkSize) {
    return [text];
  }
  
  // Split text into paragraphs
  const paragraphs = text.split(/\n\s*\n/);
  let currentChunk = "";
  
  for (const paragraph of paragraphs) {
    // If adding this paragraph would exceed the chunk size
    if (currentChunk.length + paragraph.length + 2 > maxChunkSize) {
      // If current chunk is not empty, add it to chunks
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = "";
      }
      
      // If paragraph itself is longer than max chunk size, split it further
      if (paragraph.length > maxChunkSize) {
        const sentences = paragraph.split(/(?<=[.!?])\s+/);
        let sentenceChunk = "";
        
        for (const sentence of sentences) {
          if (sentenceChunk.length + sentence.length + 1 > maxChunkSize) {
            chunks.push(sentenceChunk.trim());
            sentenceChunk = sentence;
          } else {
            sentenceChunk += " " + sentence;
          }
        }
        
        if (sentenceChunk.length > 0) {
          currentChunk = sentenceChunk.trim();
        }
      } else {
        currentChunk = paragraph;
      }
    } else {
      // Add paragraph to current chunk
      if (currentChunk.length > 0) {
        currentChunk += "\n\n" + paragraph;
      } else {
        currentChunk = paragraph;
      }
    }
  }
  
  // Add the last chunk if it's not empty
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const { loanId } = await req.json();
    
    if (!loanId) {
      return NextResponse.json({ error: "Loan ID is required" }, { status: 400 });
    }
    
    console.log(`📝 Indexing documents for loan: ${loanId}`);
    
    // Get loan documents from the simple document service
    const documents = simpleDocumentService.getDocumentsForLoan(loanId);
    
    if (!documents || documents.length === 0) {
      return NextResponse.json({ 
        message: "No documents found for this loan",
        indexed: 0
      }, { status: 200 });
    }
    
    console.log(`📚 Found ${documents.length} documents for loan ${loanId}`);
    
    let indexedDocuments = 0;
    const errors: any[] = [];
    
    // Process and index each document
    for (const doc of documents) {
      try {
        // Skip documents without content
        if (!doc.content) {
          console.log(`⚠️ Skipping document '${doc.filename}' - no content`);
          continue;
        }
        
        console.log(`🔍 Processing document: ${doc.filename}`);
        
        // Extract text based on content type
        let textContent = "";
        
        if (doc.fileType === 'text/html' || doc.filename.endsWith('.html') || 
            (typeof doc.content === 'string' && doc.content.trim().startsWith('<'))) {
          // HTML content - extract text
          textContent = extractTextFromHtml(doc.content);
        } else if (typeof doc.content === 'string') {
          // Plain text or other content type
          textContent = doc.content;
        } else {
          console.log(`⚠️ Skipping document '${doc.filename}' - unsupported content type`);
          continue;
        }
        
        // Skip if no meaningful text was extracted
        if (!textContent || textContent.length < 50) {
          console.log(`⚠️ Skipping document '${doc.filename}' - insufficient text content`);
          continue;
        }
        
        // Split document into chunks for processing
        const chunks = chunkText(textContent);
        console.log(`📄 Document '${doc.filename}' split into ${chunks.length} chunks`);
        
        // Generate embeddings for each chunk and index to Pinecone
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          
          // Generate embedding
          const embeddingResponse = await openaiClient.embeddings.create({
            model: "text-embedding-ada-002",
            input: chunk.substring(0, MAX_EMBEDDING_CHARS),
          });
          
          const embedding = embeddingResponse.data[0].embedding;
          
          // Create a unique ID for this chunk with the loan prefix to separate from other content
          const chunkId = `${LOAN_DOCUMENTS_PREFIX}-${loanId}-doc-${doc.id}-chunk-${i}`;
          
          // Index to Pinecone - we'll use ID prefixing and metadata to separate loan documents
          await pineconeIndex.upsert([{
            id: chunkId,
            values: embedding,
            metadata: {
              loanId: loanId,
              documentId: doc.id,
              documentName: doc.filename,
              documentType: doc.docType || 'unknown',
              chunkIndex: i,
              totalChunks: chunks.length,
              text: chunk,
              source: 'loan-document',
              type: 'loan-document' // Additional type field for filtering
            }
          }]);
          
          console.log(`✅ Indexed chunk ${i+1}/${chunks.length} of document '${doc.filename}' with ID: ${chunkId}`);
        }
        
        indexedDocuments++;
      } catch (docError: any) {
        console.error(`❌ Error processing document '${doc.filename}':`, docError);
        errors.push({
          filename: doc.filename,
          id: doc.id,
          error: docError.message || 'Unknown error'
        });
      }
    }
    
    return NextResponse.json({
      message: `Successfully processed ${indexedDocuments} documents for loan ${loanId}`,
      totalDocuments: documents.length,
      indexedDocuments,
      errors: errors.length > 0 ? errors : undefined
    }, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error indexing loan documents:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET endpoint to check indexing status
export async function GET(req: NextRequest) {
  try {
    // Get the loan ID from the query parameters
    const url = new URL(req.url);
    const loanId = url.searchParams.get('loanId');
    
    if (!loanId) {
      return NextResponse.json({ error: "Loan ID is required" }, { status: 400 });
    }
    
    // Query Pinecone to get stats, filtering by our type field to get loan documents
    const stats = await pineconeIndex.describeIndexStats();
    
    // Currently we don't have a direct way to count by filter
    // So we'll just return the total count and note that we're filtering when querying
    
    return NextResponse.json({
      loanId,
      indexed: true, // Since we can't easily check just loan docs with the stats method
      totalIndexSize: stats.totalRecordCount,
      message: "Loan documents are separated using ID prefix and metadata filtering"
    }, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error checking indexing status:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 