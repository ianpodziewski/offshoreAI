import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { Pinecone } from "@pinecone-database/pinecone";
import { PINECONE_INDEX_NAME } from "@/configuration/pinecone";

// Maximum tokens that can be safely sent to the model
const MAX_TOKENS_LIMIT = 7000;
const ESTIMATED_CHARS_PER_TOKEN = 4;
const MAX_CHARS = MAX_TOKENS_LIMIT * ESTIMATED_CHARS_PER_TOKEN;
const LOAN_DOCUMENTS_PREFIX = "loan-docs"; // Same prefix as in the indexing API

// Initialize the OpenAI and Pinecone clients
const pineconeApiKey = process.env.PINECONE_API_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!pineconeApiKey) throw new Error("PINECONE_API_KEY is not set");
if (!openaiApiKey) throw new Error("OPENAI_API_KEY is not set");

const pineconeClient = new Pinecone({ apiKey: pineconeApiKey });
const pineconeIndex = pineconeClient.Index(PINECONE_INDEX_NAME);
const openaiClient = new OpenAI({ apiKey: openaiApiKey });

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    console.log("📩 Received loan chat request");
    
    // Parse the request body
    const { loanId, userMessage, loanInfo } = await req.json();
    
    if (!loanId || !userMessage) {
      return NextResponse.json({ error: "Loan ID and user message are required" }, { status: 400 });
    }
    
    console.log(`🔍 Processing loan chat query for loan ${loanId}`);
    
    // Step 1: Get relevant document context by querying Pinecone
    try {
      // Generate an embedding for the user message
      console.log("Generating embedding for user message");
      const queryEmbeddingResponse = await openaiClient.embeddings.create({
        model: "text-embedding-ada-002",
        input: userMessage.trim(),
      });
      
      const queryEmbedding = queryEmbeddingResponse.data[0].embedding;
      
      // Query Pinecone with the embedding, filtering by loanId and type
      console.log("Querying Pinecone for relevant document chunks");
      const queryResponse = await pineconeIndex.query({
        vector: queryEmbedding,
        topK: 5,
        filter: { 
          loanId: loanId,
          type: "loan-document"
        },
        includeMetadata: true,
      });
      
      console.log(`Pinecone query returned ${queryResponse.matches?.length || 0} matches`);
      
      // Extract and format the relevant information
      const contexts = queryResponse.matches?.map(match => ({
        text: match.metadata?.text || "",
        score: match.score,
        documentName: match.metadata?.documentName || "Unknown document",
        documentType: match.metadata?.documentType || "Unknown type"
      })) || [];
      
      // Build a context string for GPT
      let contextString = "";
      let matchCount = 0;
      
      if (contexts.length > 0) {
        matchCount = contexts.length;
        contextString = "DOCUMENT CONTEXT:\n\n";
        
        for (let i = 0; i < contexts.length; i++) {
          const context = contexts[i];
          const contextEntry = `[Document ${i+1}: ${context.documentName} (${context.documentType})]\n${context.text}\n\n`;
          
          // Check if adding this context would exceed the token limit
          if (contextString.length + contextEntry.length > MAX_CHARS) {
            console.log(`Reached token limit after ${i} contexts`);
            break;
          }
          
          contextString += contextEntry;
        }
      } else {
        contextString = "No relevant document context found for this query.";
      }
      
      // Step 2: Generate a response using OpenAI
      console.log("Generating response with OpenAI");
      
      // Build the full prompt
      const systemPrompt = `You are a helpful assistant for a loan provider. 
You have access to specific documents related to the loan being discussed.
Respond to the user's question using ONLY the provided loan information and document context.
DO NOT make up information or include details not found in the documents.
If the document context doesn't contain relevant information to answer the query, clearly state that you don't have that information.
Current loan information:
${loanInfo || "No loan information provided."}`;

      const response = await openaiClient.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `DOCUMENT CONTEXT:\n${contextString}\n\nUSER QUERY: ${userMessage}` }
        ],
        temperature: 0.2,
        max_tokens: 1000
      });
      
      const assistantResponse = response.choices[0].message.content;
      
      return NextResponse.json({
        response: assistantResponse,
        documentMatches: matchCount,
        hasDocumentContext: matchCount > 0
      });
      
    } catch (error: any) {
      console.error("Error querying Pinecone or generating response:", error);
      return NextResponse.json({ 
        error: `Error: ${error.message}`,
        suggestion: "Check that your OpenAI API key and Pinecone configuration are correct."
      }, { status: 500 });
    }
    
  } catch (error: any) {
    console.error("Error processing loan chat request:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 