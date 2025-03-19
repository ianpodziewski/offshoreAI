import { NextRequest, NextResponse } from "next/server";
import { simpleDocumentService, SimpleDocument } from "@/utilities/simplifiedDocumentService";
import storageService from '@/services/storageService';
import { KV_CONFIG, isVercelKVConfigured } from '@/configuration/storageConfig';
import { OpenAI } from "openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { PINECONE_INDEX_NAME } from "@/configuration/pinecone";

export const runtime = "nodejs";

// Define diagnostic interface to avoid type errors
interface DiagnosticInfo {
  environment: string;
  timestamp: string;
  storage: {
    mode: string;
    kvConfigured: boolean;
    fallbackEnabled: boolean;
  };
  api: {
    openai: string;
    pinecone: string;
    pineconeIndex: string;
  };
  vercelKV: {
    url: string;
    restUrl: string;
    restToken: string;
  };
  documents: {
    count: number;
    countByLoan: Record<string, number>;
    unassociatedCount?: number;
    simpleDocs?: {
      total: number;
      loanCount?: number;
    };
    error?: string;
    syncStatus?: {
      localCount: number;
      serverCount: number;
      inSyncPercentage: number;
      syncNeeded: boolean;
      missingOnServer?: number;
      extraOnServer?: number; 
    };
  };
  pinecone?: {
    connection: string;
    vectorCount?: number;
    recordCount?: number;
    namespaces?: any;
    loanVectorCount?: number;
    loanRecordCount?: number;
    error?: string;
  };
  action: string;
  loanId: string;
}

/**
 * GET endpoint for debugging document storage and indexing
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const loanId = url.searchParams.get('loanId');
  const action = url.searchParams.get('action') || 'diagnose';
  
  try {
    // Basic system diagnostics
    const diagnostics: DiagnosticInfo = {
      environment: process.env.NODE_ENV || 'unknown',
      timestamp: new Date().toISOString(),
      storage: {
        mode: KV_CONFIG.USE_FALLBACK ? 'localStorage Fallback' : (isVercelKVConfigured() ? 'vercelKV' : 'localStorage Fallback'),
        kvConfigured: isVercelKVConfigured(),
        fallbackEnabled: KV_CONFIG.USE_FALLBACK
      },
      api: {
        openai: !!process.env.OPENAI_API_KEY ? 'configured' : 'missing',
        pinecone: !!process.env.PINECONE_API_KEY ? 'configured' : 'missing',
        pineconeIndex: process.env.PINECONE_INDEX_NAME || PINECONE_INDEX_NAME
      },
      vercelKV: {
        url: !!process.env.VERCEL_KV_URL ? 'configured' : 'missing',
        restUrl: !!process.env.VERCEL_KV_REST_API_URL ? 'configured' : 'missing',
        restToken: !!process.env.VERCEL_KV_REST_API_TOKEN ? 'configured' : 'missing'
      },
      documents: {
        count: 0,
        countByLoan: {}
      },
      action: action,
      loanId: loanId || 'not specified'
    };
    
    // Check if we need to perform any actions
    if (action === 'fix-storage' && loanId) {
      // Try to fix unassociated documents by assigning them to the specified loan
      const fixedDocs = await storageService.fixUnassociatedDocuments(loanId);
      
      return NextResponse.json({
        message: `Fixed ${fixedDocs.length} unassociated documents for loan ${loanId}`,
        fixedCount: fixedDocs.length,
        diagnostics
      });
    }
    
    if (action === 'clear-and-regenerate' && loanId) {
      // Clear existing documents for this loan
      const loanDocuments = await storageService.getDocumentsForLoan(loanId);
      for (const doc of loanDocuments) {
        await storageService.deleteDocument(doc.id);
      }
      
      // Create a sample document to test storage
      const testDoc: SimpleDocument = {
        id: `test-${Date.now()}`,
        loanId: loanId,
        filename: 'test-document.html',
        docType: 'test',
        content: '<html><body><h1>Test Document</h1><p>This is a test document for loan ' + loanId + '</p></body></html>',
        dateUploaded: new Date().toISOString(),
        fileSize: 200,
        fileType: 'text/html',
        status: 'pending',
        category: 'borrower'
      };
      
      await storageService.saveDocument(testDoc);
      
      // Check if it was saved successfully
      const loanDocsAfter = await storageService.getDocumentsForLoan(loanId);
      
      return NextResponse.json({
        message: `Cleared ${loanDocuments.length} documents and created a test document for loan ${loanId}`,
        testDocumentCreated: loanDocsAfter.length > 0,
        clearCount: loanDocuments.length,
        newDocCount: loanDocsAfter.length,
        diagnostics
      });
    }
    
    if (action === 'check-pinecone') {
      // Check Pinecone connectivity and count documents
      try {
        const pineconeApiKey = process.env.PINECONE_API_KEY;
        const indexName = process.env.PINECONE_INDEX_NAME || PINECONE_INDEX_NAME;
        
        if (!pineconeApiKey) {
          return NextResponse.json({
            error: "Pinecone API key not configured",
            diagnostics
          }, { status: 500 });
        }
        
        const pinecone = new Pinecone({ apiKey: pineconeApiKey });
        const index = pinecone.Index(indexName);
        
        // Check if index exists and get stats
        const stats = await index.describeIndexStats();
        
        diagnostics.pinecone = {
          connection: 'success',
          recordCount: stats.totalRecordCount,
          namespaces: stats.namespaces
        };
        
        // If a loan ID is provided, count vectors for that loan
        if (loanId) {
          try {
            // Get global stats without filter
            const stats = await index.describeIndexStats();
            
            if (diagnostics.pinecone) {
              diagnostics.pinecone.recordCount = stats.totalRecordCount;
            }
            
            // Instead of using filter with describeIndexStats, use query to count loan records
            const queryResponse = await index.query({
              vector: Array(384).fill(0), // Empty vector
              topK: 0,
              filter: { loanId: loanId }
            });
            
            if (diagnostics.pinecone) {
              diagnostics.pinecone.loanRecordCount = queryResponse.matches?.length || 0;
            }
          } catch (error) {
            console.error("Error getting loan stats from Pinecone:", error);
            if (diagnostics.pinecone) {
              diagnostics.pinecone.error = `Error querying by loanId: ${error instanceof Error ? error.message : 'Unknown error'}`;
            }
          }
        }
        
        return NextResponse.json({
          message: "Pinecone connection successful",
          diagnostics
        });
      } catch (error) {
        console.error("Error connecting to Pinecone:", error);
        diagnostics.pinecone = {
          connection: 'failed',
          error: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
        
        return NextResponse.json({
          error: `Pinecone connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          diagnostics
        }, { status: 500 });
      }
    }
    
    // Add a new action for syncing documents to server storage
    if (action === 'sync-documents' && loanId) {
      const syncResult = await simpleDocumentService.syncDocumentsToServer(loanId);
      
      return NextResponse.json({
        message: `Synced ${syncResult.syncedCount} documents for loan ${loanId} to server storage`,
        syncResult,
        diagnostics
      });
    }
    
    // For diagnose action or any other action, just collect diagnostic information
    
    // Get document counts
    try {
      const allDocuments = await storageService.getAllDocuments(0, 10000);
      diagnostics.documents.count = allDocuments.documents.length;
      
      // Count by loan ID
      const countByLoan: Record<string, number> = {};
      for (const doc of allDocuments.documents) {
        const docLoanId = doc.loanId || 'unassigned';
        countByLoan[docLoanId] = (countByLoan[docLoanId] || 0) + 1;
      }
      diagnostics.documents.countByLoan = countByLoan;
      
      // Get unassociated documents count
      const unassociatedDocs = allDocuments.documents.filter(doc => !doc.loanId || doc.loanId === 'undefined' || doc.loanId === 'null');
      diagnostics.documents.unassociatedCount = unassociatedDocs.length;
      
      // Get simple document service counts for comparison
      diagnostics.documents.simpleDocs = {
        total: simpleDocumentService.getAllDocuments().length
      };
      
      if (loanId) {
        diagnostics.documents.simpleDocs.loanCount = simpleDocumentService.getDocumentsForLoan(loanId).length;
        
        // Add document sync status between localStorage and server storage
        try {
          // Get documents from both sources
          const localDocs = simpleDocumentService.getDocumentsForLoan(loanId);
          const serverDocs = await storageService.getDocumentsForLoan(loanId);
          
          // Create sets of document IDs for comparison
          const localIds = new Set(localDocs.map(doc => doc.id));
          const serverIds = new Set(serverDocs.map(doc => doc.id));
          
          // Count documents missing from server
          let missingOnServer = 0;
          Array.from(localIds).forEach(id => {
            if (!serverIds.has(id)) {
              missingOnServer++;
            }
          });
          
          // Count extra documents on server
          let extraOnServer = 0;
          Array.from(serverIds).forEach(id => {
            if (!localIds.has(id)) {
              extraOnServer++;
            }
          });
          
          // Calculate sync percentage
          const totalUniqueIds = new Set([...Array.from(localIds), ...Array.from(serverIds)]);
          const inSyncCount = totalUniqueIds.size - missingOnServer - extraOnServer;
          const inSyncPercentage = totalUniqueIds.size > 0 
            ? Math.round((inSyncCount / totalUniqueIds.size) * 100) 
            : 100; // If no documents at all, consider it 100% in sync
          
          // Add sync status to diagnostics
          diagnostics.documents.syncStatus = {
            localCount: localIds.size,
            serverCount: serverIds.size,
            inSyncPercentage,
            syncNeeded: inSyncPercentage < 100,
            missingOnServer,
            extraOnServer
          };
        } catch (syncStatusError) {
          console.error("Error getting document sync status:", syncStatusError);
        }
      }
    } catch (error) {
      diagnostics.documents.error = `Error getting document counts: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
    
    return NextResponse.json({
      message: "Document storage diagnostics",
      diagnostics
    });
  } catch (error) {
    console.error("Error in debug endpoint:", error);
    return NextResponse.json({
      error: `Debug endpoint error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, { status: 500 });
  }
} 