import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { PINECONE_INDEX_NAME } from "@/configuration/pinecone";

// Maximum tokens that can be safely sent to the model
const MAX_TOKENS_LIMIT = 7000;
const ESTIMATED_CHARS_PER_TOKEN = 4;
const MAX_CHARS = MAX_TOKENS_LIMIT * ESTIMATED_CHARS_PER_TOKEN;
const LOAN_DOCUMENTS_PREFIX = "loan-docs"; // Same prefix as in the indexing API

const pineconeApiKey = process.env.PINECONE_API_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!pineconeApiKey) throw new Error("PINECONE_API_KEY is not set");
if (!openaiApiKey) throw new Error("OPENAI_API_KEY is not set");

const pineconeClient = new Pinecone({ apiKey: pineconeApiKey });
const pineconeIndex = pineconeClient.Index(PINECONE_INDEX_NAME);
const openaiClient = new OpenAI({ apiKey: openaiApiKey });

export const runtime = "nodejs";

// Helper function to calculate cosine similarity between two vectors
function cosineSimilarity(vec1: number[], vec2: number[]) {
  let dotProduct = 0;
  let vec1Mag = 0;
  let vec2Mag = 0;
  
  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    vec1Mag += vec1[i] * vec1[i];
    vec2Mag += vec2[i] * vec2[i];
  }
  
  vec1Mag = Math.sqrt(vec1Mag);
  vec2Mag = Math.sqrt(vec2Mag);
  
  return dotProduct / (vec1Mag * vec2Mag);
}

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const { loanId, query, topK = 5 } = await req.json();
    
    if (!loanId) {
      return NextResponse.json({ error: "Loan ID is required" }, { status: 400 });
    }
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: "Query string is required" }, { status: 400 });
    }
    
    console.log(`🔍 Querying loan documents for loan ${loanId} with: "${query}"`);
    
    // Generate an embedding for the query
    const queryEmbeddingResponse = await openaiClient.embeddings.create({
      model: "text-embedding-ada-002",
      input: query.trim(),
    });
    
    const queryEmbedding = queryEmbeddingResponse.data[0].embedding;
    
    // Query Pinecone with the embedding, filtering by loanId and type
    // This ensures we only get loan documents for this specific loan
    const queryResponse = await pineconeIndex.query({
      vector: queryEmbedding,
      topK: topK,
      filter: { 
        loanId: loanId,
        type: "loan-document"
      },
      includeMetadata: true,
    });
    
    console.log(`✅ Pinecone query returned ${queryResponse.matches?.length || 0} matches`);
    
    // Extract and format the relevant information
    const contexts = queryResponse.matches?.map(match => ({
      text: match.metadata?.text || "",
      score: match.score,
      documentName: match.metadata?.documentName || "Unknown document",
      documentType: match.metadata?.documentType || "Unknown type",
      chunkIndex: match.metadata?.chunkIndex,
      documentId: match.metadata?.documentId
    })) || [];
    
    // Build a context string for GPT
    let contextString = "";
    
    if (contexts.length === 0) {
      contextString = "No relevant loan documents found for this query.";
    } else {
      contextString = contexts.map((context, index) => 
        `[${index + 1}] From document "${context.documentName}" (${context.documentType}):\n${context.text}`
      ).join("\n\n");
      
      // If context is too large, truncate it
      if (contextString.length > MAX_CHARS) {
        contextString = contextString.substring(0, MAX_CHARS);
        contextString += "\n\n[Note: The context has been truncated due to its size. If important information seems missing, please ask more specific questions.]";
      }
    }
    
    return NextResponse.json({
      contexts,
      contextString,
      loanId,
      query,
      matchCount: contexts.length
    }, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error querying loan documents:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 