import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { PINECONE_INDEX_NAME } from "@/configuration/pinecone";
import { validateOpenAIKey, validatePineconeKey, getRedactedKey } from "@/configuration/apiKeys";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    // Collect diagnostics information
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      api_keys: {
        openai: validateOpenAIKey(),
        pinecone: validatePineconeKey(),
      },
      openai_key_redacted: getRedactedKey(process.env.OPENAI_API_KEY),
      pinecone_key_redacted: getRedactedKey(process.env.PINECONE_API_KEY),
      pinecone: {
        index_name: PINECONE_INDEX_NAME
      }
    };
    
    // Test connections if keys are valid
    if (diagnostics.api_keys.openai.valid) {
      try {
        const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const modelResponse = await openaiClient.models.list();
        diagnostics.openai.connection = "success";
        diagnostics.openai.available_models = modelResponse.data.length;
      } catch (openaiError: any) {
        diagnostics.openai = {
          connection: "error",
          error_message: openaiError.message
        };
      }
    }
    
    if (diagnostics.api_keys.pinecone.valid) {
      try {
        const pineconeClient = new Pinecone({ apiKey: process.env.PINECONE_API_KEY || "" });
        const index = pineconeClient.Index(PINECONE_INDEX_NAME);
        const stats = await index.describeIndexStats();
        diagnostics.pinecone.connection = "success";
        diagnostics.pinecone.vector_count = stats.totalRecordCount;
        diagnostics.pinecone.namespaces = stats.namespaces;
      } catch (pineconeError: any) {
        diagnostics.pinecone.connection = "error";
        diagnostics.pinecone.error_message = pineconeError.message;
      }
    }
    
    return NextResponse.json({
      status: "success",
      diagnostics
    });
  } catch (error: any) {
    return NextResponse.json({
      status: "error",
      error: error.message
    }, { status: 500 });
  }
} 