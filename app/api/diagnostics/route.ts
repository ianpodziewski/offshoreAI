import { NextRequest, NextResponse } from 'next/server';
import { KV_CONFIG, isVercelKVConfigured } from '@/configuration/storageConfig';
import storageService from '@/services/storageService';
import { kv } from '@vercel/kv';

// Temporary types until we create proper utility files
interface OpenAIVerificationResult {
  valid: boolean;
  error?: string;
}

interface PineconeConnectionResult {
  success: boolean;
  error?: string;
}

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  // General environment info
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
  };
  
  // API keys check
  diagnostics.api_keys = {
    openai: {
      exists: !!process.env.OPENAI_API_KEY,
      valid: false,
      message: ''
    },
    pinecone: {
      exists: !!process.env.PINECONE_API_KEY,
      valid: false,
      message: ''
    },
    vercel_kv: {
      exists: isVercelKVConfigured(),
      using_fallback: KV_CONFIG.USE_FALLBACK,
      message: ''
    }
  };
  
  // Check OpenAI API key
  try {
    // Simple OpenAI API key verification
    const verifyOpenAIApiKey = async (): Promise<OpenAIVerificationResult> => {
      if (!process.env.OPENAI_API_KEY) {
        return { valid: false, error: 'OpenAI API key is not set' };
      }
      
      try {
        const { Configuration, OpenAIApi } = require('openai');
        const configuration = new Configuration({
          apiKey: process.env.OPENAI_API_KEY,
        });
        const openai = new OpenAIApi(configuration);
        
        // A simple call to check if the API key is valid
        await openai.listModels();
        return { valid: true };
      } catch (error: any) {
        return { 
          valid: false, 
          error: error.message || 'Failed to validate OpenAI API key' 
        };
      }
    };
    
    const openaiResult = await verifyOpenAIApiKey();
    diagnostics.api_keys.openai.valid = openaiResult.valid;
    diagnostics.api_keys.openai.message = openaiResult.valid ? 
      'API key is valid' : 
      openaiResult.error || 'API key validation failed';
  } catch (error) {
    diagnostics.api_keys.openai.message = `Error checking OpenAI API key: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
  
  // OpenAI Services check
  diagnostics.openai = {
    connection: 'pending',
    available_models: [],
    error_message: null
  };
  
  try {
    const { Configuration, OpenAIApi } = require('openai');
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);
    
    const response = await openai.listModels();
    
    if (response.status === 200) {
      diagnostics.openai.connection = 'success';
      // Extract just the model IDs we're interested in
      const allModels = response.data.data.map((model: any) => model.id);
      // Filter for newer models
      const relevantModels = allModels.filter((model: string) => 
        model.includes('gpt-4') || 
        model.includes('gpt-3.5-turbo') || 
        model.includes('text-embedding')
      );
      
      diagnostics.openai.available_models = relevantModels.length > 10 ? 
        `${relevantModels.slice(0, 10).join(', ')}, and ${relevantModels.length - 10} more` : 
        relevantModels.join(', ');
    } else {
      diagnostics.openai.connection = 'failed';
      diagnostics.openai.error_message = `OpenAI API returned status ${response.status}`;
    }
  } catch (error: any) {
    diagnostics.openai.connection = 'failed';
    diagnostics.openai.error_message = error.message || 'Unknown error connecting to OpenAI';
  }
  
  // Pinecone check
  diagnostics.pinecone = {
    index_name: process.env.PINECONE_INDEX_NAME || 'offshoreai',
    connection: 'pending',
    vector_count: 0,
    error_message: null
  };
  
  // Check Pinecone connection
  try {
    // Simple Pinecone connection check
    const checkPineconeConnection = async (): Promise<PineconeConnectionResult> => {
      if (!process.env.PINECONE_API_KEY) {
        return { success: false, error: 'Pinecone API key is not set' };
      }
      
      try {
        const { PineconeClient } = require('@pinecone-database/pinecone');
        const pinecone = new PineconeClient();
        await pinecone.init({
          environment: process.env.PINECONE_ENVIRONMENT || 'us-east1-gcp',
          apiKey: process.env.PINECONE_API_KEY,
        });
        
        // Just list indexes to check connectivity
        await pinecone.listIndexes();
        return { success: true };
      } catch (error: any) {
        return { 
          success: false, 
          error: error.message || 'Failed to connect to Pinecone' 
        };
      }
    };
    
    const pineconeResult = await checkPineconeConnection();
    
    if (pineconeResult.success) {
      diagnostics.api_keys.pinecone.valid = true;
      diagnostics.api_keys.pinecone.message = 'API key is valid';
      diagnostics.pinecone.connection = 'success';
      
      try {
        // Try to get vector count
        const { PineconeClient } = require('@pinecone-database/pinecone');
        const pinecone = new PineconeClient();
        await pinecone.init({
          environment: process.env.PINECONE_ENVIRONMENT || 'us-east1-gcp',
          apiKey: process.env.PINECONE_API_KEY as string,
        });
        
        const indexName = process.env.PINECONE_INDEX_NAME || 'offshoreai';
        const index = pinecone.Index(indexName);
        const statsResponse = await index.describeIndexStats();
        diagnostics.pinecone.vector_count = statsResponse.totalVectorCount || 0;
      } catch (statsError) {
        diagnostics.pinecone.vector_count = 'Error getting count';
      }
    } else {
      diagnostics.api_keys.pinecone.valid = false;
      diagnostics.api_keys.pinecone.message = pineconeResult.error || 'Connection failed';
      diagnostics.pinecone.connection = 'failed';
      diagnostics.pinecone.error_message = pineconeResult.error;
    }
  } catch (error) {
    diagnostics.pinecone.connection = 'failed';
    diagnostics.pinecone.error_message = error instanceof Error ? error.message : 'Unknown error connecting to Pinecone';
  }
  
  // Vercel KV check
  diagnostics.vercel_kv = {
    configured: isVercelKVConfigured(),
    using_fallback: KV_CONFIG.USE_FALLBACK,
    connection: 'pending',
    document_count: 0,
    error_message: null
  };
  
  if (isVercelKVConfigured()) {
    if (KV_CONFIG.USE_FALLBACK) {
      diagnostics.vercel_kv.connection = 'fallback';
      diagnostics.vercel_kv.message = 'Using localStorage fallback (manual override)';
      diagnostics.api_keys.vercel_kv.message = 'Fallback mode enabled';
      
      // Get count from localStorage
      try {
        const result = await storageService.getAllDocuments(0, 10000);
        diagnostics.vercel_kv.document_count = result.documents.length;
      } catch (error) {
        diagnostics.vercel_kv.document_count = 'Error getting count';
      }
    } else {
      try {
        // Test KV connection
        await kv.ping();
        diagnostics.vercel_kv.connection = 'success';
        diagnostics.api_keys.vercel_kv.message = 'Connected to Vercel KV';
        
        // Get document count
        const docKeys = await kv.keys(`${KV_CONFIG.DOCUMENT_PREFIX}:*`);
        diagnostics.vercel_kv.document_count = docKeys.length;
      } catch (error) {
        diagnostics.vercel_kv.connection = 'failed';
        diagnostics.vercel_kv.error_message = error instanceof Error ? error.message : 'Unknown error connecting to Vercel KV';
        diagnostics.api_keys.vercel_kv.message = 'Configuration found but connection failed';
        
        // Since KV failed, we're using fallback
        diagnostics.vercel_kv.using_fallback = true;
      }
    }
  } else {
    diagnostics.vercel_kv.connection = 'not_configured';
    diagnostics.vercel_kv.message = 'Vercel KV not configured, using localStorage fallback';
    diagnostics.api_keys.vercel_kv.message = 'Not configured, using localStorage fallback';
    
    // Get count from localStorage
    try {
      const result = await storageService.getAllDocuments(0, 10000);
      diagnostics.vercel_kv.document_count = result.documents.length;
    } catch (error) {
      diagnostics.vercel_kv.document_count = 'Error getting count';
    }
  }
  
  // Storage Statistics
  diagnostics.storage = {
    document_count: diagnostics.vercel_kv.document_count,
    storage_mode: KV_CONFIG.USE_FALLBACK ? 'localStorage' : (isVercelKVConfigured() ? 'vercelKV' : 'localStorage')
  };
  
  return NextResponse.json({ 
    diagnostics
  });
} 