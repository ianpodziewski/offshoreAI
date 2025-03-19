import { NextRequest, NextResponse } from "next/server";
import { serverRedisUtil } from '@/lib/redis-server';
import { STORAGE_CONFIG, isRedisConfigured } from '@/configuration/storageConfig';

export const runtime = "nodejs";

/**
 * API endpoint for debugging Redis storage
 * GET /api/redis-debug?loanId=...
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const loanId = url.searchParams.get('loanId');
    const keyPattern = url.searchParams.get('pattern') || '*';
    
    // Check if Redis is configured
    const redisConfigured = isRedisConfigured();
    if (!redisConfigured) {
      return NextResponse.json({ 
        error: 'Redis is not configured',
        redis_configured: false 
      }, { status: 400 });
    }
    
    // Results to return
    const results: any = {
      redis_configured: true,
      server_timestamp: new Date().toISOString()
    };
    
    // Test key patterns
    const keyPatterns = [
      'docs_by_loan:*',         // Document IDs by loan
      'doc:*',                  // All documents
      'document_list',          // Global document list
      keyPattern                // User supplied pattern
    ];
    
    // If loan ID is provided, add loan-specific checks
    if (loanId) {
      keyPatterns.push(`docs_by_loan:${loanId}`);
      results.loan_id = loanId;
    }
    
    // Check keys for each pattern
    results.patterns = {};
    
    for (const pattern of keyPatterns) {
      // Get all keys matching the pattern
      const keys = await serverRedisUtil.keys(pattern);
      results.patterns[pattern] = {
        count: keys.length,
        keys: keys.slice(0, 50) // Limit to 50 keys for readability
      };
      
      // For document lists, get more details
      if (pattern.startsWith('docs_by_loan:')) {
        const docIds = await serverRedisUtil.smembers(pattern);
        results.patterns[pattern].document_ids = docIds;
        
        // For each document ID, get its details
        if (docIds.length > 0) {
          const documents = [];
          
          for (const docId of docIds.slice(0, 10)) { // Limit to first 10 to prevent huge responses
            const docKey = `doc:${docId}`;
            const docJson = await serverRedisUtil.get(docKey);
            
            if (docJson) {
              try {
                const doc = JSON.parse(docJson);
                documents.push({
                  id: doc.id,
                  loanId: doc.loanId,
                  filename: doc.filename,
                  docType: doc.docType,
                  hasContent: !!doc.content,
                  contentLength: doc.content ? doc.content.length : 0
                });
              } catch (err) {
                documents.push({
                  id: docId,
                  error: 'Failed to parse document JSON'
                });
              }
            } else {
              documents.push({
                id: docId,
                error: 'Document not found'
              });
            }
          }
          
          results.patterns[pattern].sample_documents = documents;
        }
      }
    }
    
    // Get a sample document (first one found)
    if (loanId) {
      const docIds = await serverRedisUtil.smembers(`docs_by_loan:${loanId}`);
      
      if (docIds.length > 0) {
        const docId = docIds[0];
        const docJson = await serverRedisUtil.get(`doc:${docId}`);
        
        if (docJson) {
          try {
            const doc = JSON.parse(docJson);
            // Remove content to keep response size manageable
            const { content, ...docWithoutContent } = doc;
            results.sample_document = {
              ...docWithoutContent,
              content_length: content ? content.length : 0,
              has_content: !!content
            };
          } catch (err) {
            results.sample_document_error = 'Failed to parse document JSON';
          }
        } else {
          results.sample_document_error = 'Document not found';
        }
      }
    }
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error in Redis debug API:', error);
    return NextResponse.json({ 
      error: `Redis debug failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
} 