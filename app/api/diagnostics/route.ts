import { NextRequest, NextResponse } from 'next/server';
import { STORAGE_CONFIG, isRedisConfigured } from '@/configuration/storageConfig';
import storageService from '@/services/storageService';
import Redis from 'ioredis';
import OpenAI from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';

// Initialize Redis client (if available)
let redis: typeof Redis | null = null;
if (typeof process !== 'undefined' && process.env.REDIS_URL) {
  try {
    redis = new Redis(process.env.REDIS_URL);
  } catch (error) {
    console.error('Failed to initialize Redis client:', error);
    redis = null;
  }
}

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
    redis: {
      exists: isRedisConfigured() && !!process.env.REDIS_URL,
      using_fallback: !redis || STORAGE_CONFIG.USE_FALLBACK,
      status: 'pending',
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
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
        
        // A simple call to check if the API key is valid
        await openai.models.list();
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
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    const response = await openai.models.list();
    
    if (response) {
      diagnostics.openai.connection = 'success';
      // Extract just the model IDs we're interested in
      const allModels = response.data.map((model) => model.id);
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
      diagnostics.openai.error_message = `OpenAI API returned an invalid response`;
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
        const pinecone = new Pinecone({
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
        const pinecone = new Pinecone({
          apiKey: process.env.PINECONE_API_KEY as string,
        });
        
        const indexName = process.env.PINECONE_INDEX_NAME || 'offshoreai';
        const index = pinecone.index(indexName);
        const statsResponse = await index.describeIndexStats();
        diagnostics.pinecone.vector_count = statsResponse.totalRecordCount || 0;
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
  
  // Redis check (previously Vercel KV)
  diagnostics.redis = {
    configured: isRedisConfigured() && !!process.env.REDIS_URL,
    using_fallback: !redis || STORAGE_CONFIG.USE_FALLBACK,
    connection: 'pending',
    document_count: 0,
    error_message: null
  };
  
  if (isRedisConfigured() && process.env.REDIS_URL) {
    if (STORAGE_CONFIG.USE_FALLBACK) {
      diagnostics.redis.connection = 'fallback';
      diagnostics.redis.message = 'Using localStorage fallback (manual override)';
      diagnostics.api_keys.redis = { status: 'warning', message: 'Fallback mode enabled' };
      
      // Get count from localStorage
      try {
        const result = await storageService.getAllDocuments(0, 10000);
        diagnostics.redis.document_count = result.documents.length;
      } catch (error) {
        diagnostics.redis.document_count = 'Error getting count';
      }
    } else {
      try {
        // Test Redis connection
        let redisClient = redis;
        
        // If redis wasn't initialized globally, create a temporary client
        if (!redisClient) {
          redisClient = new Redis(process.env.REDIS_URL);
        }
        
        // Test connection with ping
        await redisClient.ping();
        diagnostics.redis.connection = 'success';
        diagnostics.api_keys.redis = { status: 'success', message: 'Connected to Redis' };
        
        // Get document count
        const docKeys = await redisClient.keys(`${STORAGE_CONFIG.DOCUMENT_PREFIX}:*`);
        diagnostics.redis.document_count = docKeys.length;
        
        // Close the temporary connection if we created one
        if (redisClient !== redis) {
          await redisClient.quit();
        }
      } catch (error) {
        diagnostics.redis.connection = 'failed';
        diagnostics.redis.error_message = error instanceof Error ? error.message : 'Unknown error connecting to Redis';
        diagnostics.api_keys.redis = { status: 'error', message: 'Configuration found but connection failed' };
        
        // Since Redis failed, we're using fallback
        diagnostics.redis.using_fallback = true;
      }
    }
  } else {
    // Not configured
    diagnostics.redis.connection = 'not_configured';
    diagnostics.api_keys.redis = { status: 'warning', message: 'Redis URL not configured' };
  }
  
  // Storage Statistics
  diagnostics.storage = {
    document_count: diagnostics.redis.document_count,
    storage_mode: STORAGE_CONFIG.USE_FALLBACK ? 'localStorage' : (isRedisConfigured() ? 'redis' : 'localStorage')
  };
  
  return NextResponse.json({ 
    diagnostics
  });
} 