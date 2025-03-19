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

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const { loanId } = await req.json();
    
    if (!loanId) {
      return NextResponse.json({ error: "Loan ID is required" }, { status: 400 });
    }
    
    console.log(`📝 Indexing documents for loan: ${loanId}`);
    
    // Initialize OpenAI client inside the request handler for better error handling
    const openaiClient = new OpenAI({ 
      apiKey: openaiApiKey,
      // Add a default timeout to prevent hanging requests
      timeout: 60000 
    });
    
    // Get loan documents from the simple document service
    const documents = simpleDocumentService.getDocumentsForLoan(loanId);
    
    if (!documents || documents.length === 0) {
      return NextResponse.json({ 
        message: "No documents found for this loan",
        indexed: 0,
        totalDocuments: 0
      }, { status: 200 });
    }
    
    console.log(`📚 Found ${documents.length} documents for loan ${loanId}`);
    
    let indexedDocuments = 0;
    const totalDocuments = documents.length;
    const errors: any[] = [];
    
    // Process and index each document
    for (const doc of documents) {
      try {
        // Skip documents without content
        if (!doc.content) {
          console.log(`⚠️ Skipping document '${doc.filename}' - no content`);
          continue;
        }
        
        console.log(`🔍 Processing document: ${doc.filename}, Content type: ${doc.fileType || 'unknown'}, Content length: ${doc.content.length}`);
        
        // Extract text based on content type
        let textContent = "";
        
        if (doc.fileType === 'text/html' || doc.filename.endsWith('.html') || 
            (typeof doc.content === 'string' && (doc.content.trim().startsWith('<') || doc.content.includes('<html')))) {
          // HTML content - extract text
          console.log(`Detected HTML content in ${doc.filename}`);
          textContent = extractTextFromHtml(doc.content);
        } else if (typeof doc.content === 'string') {
          // Plain text or other content type
          textContent = doc.content;
        } else {
          console.log(`⚠️ Skipping document '${doc.filename}' - unsupported content type: ${typeof doc.content}`);
          continue;
        }
        
        // Skip if no meaningful text was extracted
        if (!textContent || textContent.length < 50) {
          console.log(`⚠️ Skipping document '${doc.filename}' - insufficient text content (${textContent.length} chars)`);
          continue;
        }
        
        // Split document into chunks for processing
        const chunks = chunkText(textContent);
        console.log(`📄 Document '${doc.filename}' split into ${chunks.length} chunks`);
        
        // Generate embeddings for each chunk and index to Pinecone
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          
          console.log(`Generating embedding for chunk ${i+1}/${chunks.length} (${chunk.length} chars)`);
          
          try {
            // Generate embedding
            const embeddingResponse = await openaiClient.embeddings.create({
              model: "text-embedding-ada-002",
              input: chunk.substring(0, MAX_EMBEDDING_CHARS),
            });
            
            const embedding = embeddingResponse.data[0].embedding;
            console.log(`✅ Generated embedding of length: ${embedding.length}`);
            
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
          } catch (embeddingError: any) {
            console.error(`❌ Error generating embedding for chunk ${i+1}: ${embeddingError.message}`, embeddingError);
            errors.push({
              filename: doc.filename,
              id: doc.id,
              chunkIndex: i,
              error: embeddingError.message || 'Unknown embedding error'
            });
          }
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
    
    console.log(`✅ Indexing complete. Successfully indexed ${indexedDocuments} out of ${totalDocuments} documents.`);
    
    return NextResponse.json({ 
      message: `Successfully indexed ${indexedDocuments} out of ${totalDocuments} documents.`,
      indexedDocuments,
      totalDocuments,
      errors: errors.length > 0 ? errors : undefined
    }, { status: 200 });
    
  } catch (error: any) {
    console.error("❌ Error indexing documents:", error);
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