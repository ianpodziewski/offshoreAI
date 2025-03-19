import { NextResponse } from 'next/server';
import { serverRedisUtil } from '@/lib/redis-server';
import { STORAGE_CONFIG } from '@/configuration/storageConfig';

/**
 * Debug API endpoint to check Redis contents
 * GET /api/debug-redis
 */
export async function GET(request: Request) {
  try {
    const documentPrefix = STORAGE_CONFIG.DOCUMENT_PREFIX;
    const loanPrefix = STORAGE_CONFIG.DOCUMENT_BY_LOAN_PREFIX;
    const documentListKey = STORAGE_CONFIG.DOCUMENT_LIST_KEY;
    
    // Get all document IDs in the main list
    const allDocumentIds = await serverRedisUtil.smembers(documentListKey);
    
    // Get all document keys
    const allDocumentKeys = await serverRedisUtil.keys(`${documentPrefix}*`);
    
    // Get all loan document list keys
    const allLoanKeys = await serverRedisUtil.keys(`${loanPrefix}*`);
    
    // Get document count for each loan
    const loanDocumentCounts: Record<string, number> = {};
    for (const loanKey of allLoanKeys) {
      const loanId = loanKey.replace(loanPrefix, '');
      const docIds = await serverRedisUtil.smembers(loanKey);
      loanDocumentCounts[loanId] = docIds.length;
    }
    
    // Get some sample documents (up to 5)
    const sampleDocuments = [];
    const sampleIds = allDocumentIds.slice(0, 5);
    for (const docId of sampleIds) {
      const docKey = `${documentPrefix}${docId}`;
      const docStr = await serverRedisUtil.get(docKey);
      if (docStr) {
        try {
          const doc = JSON.parse(docStr);
          // Truncate content to avoid huge response
          if (doc.content && doc.content.length > 200) {
            doc.content = doc.content.substring(0, 200) + '... [truncated]';
          }
          sampleDocuments.push(doc);
        } catch (e) {
          sampleDocuments.push({ error: 'Failed to parse document', id: docId });
        }
      }
    }
    
    return NextResponse.json({
      redis_status: 'connected',
      total_documents: allDocumentIds.length,
      document_keys_count: allDocumentKeys.length,
      loan_keys_count: allLoanKeys.length,
      loan_document_counts: loanDocumentCounts,
      sample_documents: sampleDocuments,
      all_document_ids: allDocumentIds
    });
  } catch (error) {
    console.error('Error debugging Redis:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to debug Redis',
        message: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    );
  }
} 