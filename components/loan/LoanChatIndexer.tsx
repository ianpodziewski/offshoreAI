import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Database, RefreshCw, CheckCircle, XCircle, AlertTriangle, Wrench, Trash2, Link, HardDrive } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { simpleDocumentService } from '@/utilities/simplifiedDocumentService';
import storageService from '@/services/storageService';
import { KV_CONFIG, isVercelKVConfigured } from '@/configuration/storageConfig';

interface LoanChatIndexerProps {
  loanId: string;
}

export default function LoanChatIndexer({ loanId }: LoanChatIndexerProps) {
  const [indexingStatus, setIndexingStatus] = useState<'idle' | 'indexing' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [indexedDocs, setIndexedDocs] = useState(0);
  const [totalDocs, setTotalDocs] = useState(0);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [diagnosticData, setDiagnosticData] = useState<any>(null);
  const [isDiagnosticLoading, setIsDiagnosticLoading] = useState(false);
  const [showStorageWarning, setShowStorageWarning] = useState(false);
  const [fixingAssociations, setFixingAssociations] = useState(false);
  const [fixedCount, setFixedCount] = useState(0);
  const [showMigrationDialog, setShowMigrationDialog] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationStats, setMigrationStats] = useState<{migrated: number, errors: number} | null>(null);
  
  // Storage configuration status
  const [storageMode, setStorageMode] = useState<'localStorage' | 'vercelKV' | 'unknown'>('unknown');
  
  // Check which storage mode we're using
  useEffect(() => {
    // Check Vercel KV configuration
    if (isVercelKVConfigured() && !KV_CONFIG.USE_FALLBACK) {
      setStorageMode('vercelKV');
    } else {
      setStorageMode('localStorage');
    }
  }, []);

  const startIndexing = async () => {
    try {
      setIndexingStatus('indexing');
      setProgress(10);
      setMessage('Starting document indexing...');
      
      // Call the indexing API
      const response = await fetch('/api/loan-documents/index', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loanId,
        }),
      });
      
      setProgress(50);
      
      if (!response.ok) {
        throw new Error(`Failed to index documents: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      setProgress(100);
      
      if (data.error) {
        setIndexingStatus('error');
        setMessage(data.error);
      } else {
        setIndexingStatus('success');
        setMessage(data.message);
        setIndexedDocs(data.indexedDocuments);
        setTotalDocs(data.totalDocuments);
      }
    } catch (error) {
      setIndexingStatus('error');
      setMessage(`Error indexing documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setProgress(100);
    }
  };

  const checkIndexStatus = async () => {
    try {
      setIndexingStatus('indexing');
      setProgress(50);
      setMessage('Checking indexing status...');
      
      // Call the GET endpoint to check status
      const response = await fetch(`/api/loan-documents/index?loanId=${loanId}`, {
        method: 'GET',
      });
      
      setProgress(100);
      
      if (!response.ok) {
        throw new Error(`Failed to check indexing status: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        setIndexingStatus('error');
        setMessage(data.error);
      } else {
        setIndexingStatus('success');
        setMessage(data.message || 'Documents have been indexed successfully');
      }
    } catch (error) {
      setIndexingStatus('error');
      setMessage(`Error checking indexing status: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setProgress(100);
    }
  };
  
  // Function to run diagnostics
  const runDiagnostics = async () => {
    try {
      setIsDiagnosticLoading(true);
      
      const response = await fetch('/api/diagnostics', {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get diagnostics: ${response.statusText}`);
      }
      
      const data = await response.json();
      setDiagnosticData(data.diagnostics);
      setShowDiagnostics(true);
    } catch (error) {
      console.error('Error running diagnostics:', error);
      setDiagnosticData({ error: error instanceof Error ? error.message : 'Unknown error' });
      setShowDiagnostics(true);
    } finally {
      setIsDiagnosticLoading(false);
    }
  };
  
  // Function to clear localStorage and IndexedDB
  const clearDocumentStorage = async () => {
    try {
      setIndexingStatus('indexing');
      setProgress(20);
      setMessage('Clearing document storage...');
      
      // Use the storageService directly to clear all documents
      await storageService.clearAllDocuments();
      
      // Set a short timeout to let browser finish operations
      setTimeout(() => {
        setProgress(100);
        setIndexingStatus('success');
        setMessage('Document storage cleared successfully. You can now try indexing again.');
        setShowStorageWarning(false);
      }, 1000);
      
    } catch (error) {
      setIndexingStatus('error');
      setMessage(`Error clearing storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setProgress(100);
    }
  };

  // Function to fix document associations
  const fixDocumentAssociations = async () => {
    try {
      setFixingAssociations(true);
      setIndexingStatus('indexing');
      setProgress(30);
      setMessage('Fixing document associations...');
      
      // Call the storage service method to fix unassociated documents
      const fixedDocs = await storageService.fixUnassociatedDocuments(loanId);
      
      setFixedCount(fixedDocs.length);
      setProgress(100);
      
      if (fixedDocs.length > 0) {
        setIndexingStatus('success');
        setMessage(`Fixed ${fixedDocs.length} document associations. Try indexing again.`);
      } else {
        setIndexingStatus('success');
        setMessage('No document associations needed fixing. The issue may be elsewhere.');
      }
    } catch (error) {
      setIndexingStatus('error');
      setMessage(`Error fixing document associations: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setProgress(100);
    } finally {
      setFixingAssociations(false);
    }
  };
  
  // Function to migrate data from localStorage to Vercel KV
  const migrateToVercelKV = async () => {
    if (storageMode !== 'vercelKV') {
      setMessage('Cannot migrate to Vercel KV. Not configured.');
      return;
    }
    
    try {
      setIsMigrating(true);
      setIndexingStatus('indexing');
      setProgress(10);
      setMessage('Starting migration of documents from localStorage to Vercel KV...');
      
      // Call migration function
      const stats = await storageService.migrateFromLocalStorage();
      setMigrationStats(stats);
      
      setProgress(100);
      
      if (stats.errors === 0) {
        setIndexingStatus('success');
        setMessage(`Successfully migrated ${stats.migrated} documents to Vercel KV.`);
      } else {
        setIndexingStatus('error');
        setMessage(`Migration completed with ${stats.errors} errors. ${stats.migrated} documents migrated successfully.`);
      }
    } catch (error) {
      setIndexingStatus('error');
      setMessage(`Error during migration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsMigrating(false);
    }
  };

  // Check if the error is related to storage quota
  useEffect(() => {
    if (indexingStatus === 'error' && 
        message && 
        (message.includes('quota') || message.includes('exceeded') || message.includes('storage'))) {
      setShowStorageWarning(true);
    } else {
      setShowStorageWarning(false);
    }
  }, [indexingStatus, message]);

  // Render status icon based on indexing status
  const renderStatusIcon = () => {
    switch (indexingStatus) {
      case 'indexing':
        return <RefreshCw size={18} className="animate-spin text-blue-400" />;
      case 'success':
        return <CheckCircle size={18} className="text-green-400" />;
      case 'error':
        return <XCircle size={18} className="text-red-400" />;
      default:
        return <Database size={18} className="text-gray-400" />;
    }
  };

  return (
    <div className="border border-gray-800 rounded-lg p-4 bg-gray-900 mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-white flex items-center gap-2">
          {renderStatusIcon()}
          Document Indexing
          <span className="ml-2 text-xs px-2 py-1 rounded bg-gray-800 text-gray-400">
            {storageMode === 'vercelKV' ? 'Vercel KV' : 'localStorage'}
          </span>
        </h3>
        
        <div className="flex gap-2">
          <Button 
            size="sm"
            variant="outline"
            onClick={runDiagnostics}
            disabled={isDiagnosticLoading}
            className="flex items-center gap-1"
          >
            {isDiagnosticLoading ? <RefreshCw size={14} className="animate-spin mr-1" /> : <Wrench size={14} />}
            Diagnostics
          </Button>
          
          <Button 
            size="sm"
            variant="outline"
            onClick={fixDocumentAssociations}
            disabled={fixingAssociations || indexingStatus === 'indexing'}
            className="flex items-center gap-1"
          >
            <Link size={14} />
            Fix Associations
          </Button>
          
          {/* Add Migration Button when in Vercel KV mode */}
          {storageMode === 'vercelKV' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowMigrationDialog(true)}
              disabled={isMigrating || indexingStatus === 'indexing'}
              className="flex items-center gap-1"
            >
              <HardDrive size={14} />
              Migrate Data
            </Button>
          )}
          
          <Button 
            size="sm"
            variant="outline"
            onClick={checkIndexStatus}
            disabled={indexingStatus === 'indexing'}
          >
            Check Status
          </Button>
          
          <Button 
            size="sm"
            variant={indexingStatus === 'success' ? "outline" : "default"}
            onClick={startIndexing}
            disabled={indexingStatus === 'indexing'}
          >
            {indexingStatus === 'success' ? 'Reindex Documents' : 'Index Documents'}
          </Button>
        </div>
      </div>
      
      {indexingStatus !== 'idle' && (
        <div className="mt-4 space-y-2">
          {/* Progress indicator */}
          <Progress value={progress} className="h-2" />
          
          {/* Status message */}
          <div className="text-sm">
            {indexingStatus === 'indexing' && (
              <p className="text-blue-400">
                <RefreshCw size={14} className="inline mr-2 animate-spin" />
                {message}
              </p>
            )}
            
            {indexingStatus === 'success' && (
              <div>
                <p className="text-green-400 flex items-center">
                  <CheckCircle size={14} className="inline mr-2" />
                  {message}
                </p>
                {indexedDocs > 0 && (
                  <p className="text-gray-400 mt-1 text-xs">
                    Indexed {indexedDocs} of {totalDocs} documents
                  </p>
                )}
              </div>
            )}
            
            {indexingStatus === 'error' && (
              <p className="text-red-400 flex items-start">
                <AlertTriangle size={14} className="inline mr-2 mt-1 flex-shrink-0" />
                <span>{message}</span>
              </p>
            )}
          </div>
          
          {/* Storage quota warning */}
          {showStorageWarning && (
            <div className="bg-amber-900/30 border border-amber-800 rounded p-3 mt-2">
              <h4 className="text-amber-200 font-medium flex items-center">
                <AlertTriangle size={14} className="mr-2" />
                Storage Quota Exceeded
              </h4>
              <p className="text-amber-100 text-sm mt-1">
                Your browser's storage limit has been reached. This can happen when you have many or large documents.
              </p>
              <div className="mt-3">
                <Button 
                  size="sm"
                  variant="destructive"
                  onClick={clearDocumentStorage}
                  className="flex items-center gap-1"
                >
                  <Trash2 size={14} />
                  Clear Document Storage
                </Button>
              </div>
              <p className="text-amber-200/70 text-xs mt-2">
                Note: This will remove all cached documents, but won't affect your actual loan data.
              </p>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-4">
        <p className="text-gray-500 text-xs">
          Indexing makes loan documents searchable and allows the chatbot to provide specific answers based on document contents.
        </p>
      </div>

      {/* Diagnostics Dialog */}
      <Dialog open={showDiagnostics} onOpenChange={setShowDiagnostics}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-gray-900 text-white border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">API Diagnostics</DialogTitle>
          </DialogHeader>
          
          {diagnosticData ? (
            <div className="space-y-4">
              <div className="border border-gray-800 rounded p-3">
                <h3 className="font-medium mb-2">Environment</h3>
                <p>Node Environment: {diagnosticData.environment}</p>
                <p>Timestamp: {diagnosticData.timestamp}</p>
                <p>Storage Mode: {storageMode}</p>
              </div>
              
              <div className="border border-gray-800 rounded p-3">
                <h3 className="font-medium mb-2">API Keys</h3>
                
                <div className="mb-3">
                  <div className="flex items-center mb-1">
                    <div className={`w-3 h-3 rounded-full mr-2 ${diagnosticData.api_keys?.openai?.valid ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <h4>OpenAI API Key</h4>
                  </div>
                  <p className="text-sm ml-5">{diagnosticData.api_keys?.openai?.message}</p>
                </div>
                
                <div>
                  <div className="flex items-center mb-1">
                    <div className={`w-3 h-3 rounded-full mr-2 ${diagnosticData.api_keys?.pinecone?.valid ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <h4>Pinecone API Key</h4>
                  </div>
                  <p className="text-sm ml-5">{diagnosticData.api_keys?.pinecone?.message}</p>
                </div>
                
                <div className="mt-3">
                  <div className="flex items-center mb-1">
                    <div className={`w-3 h-3 rounded-full mr-2 ${storageMode === 'vercelKV' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    <h4>Vercel KV</h4>
                  </div>
                  <p className="text-sm ml-5">{storageMode === 'vercelKV' ? 'Connected to Vercel KV' : 'Using localStorage fallback'}</p>
                </div>
              </div>
              
              <div className="border border-gray-800 rounded p-3">
                <h3 className="font-medium mb-2">Pinecone</h3>
                <p>Index Name: {diagnosticData.pinecone?.index_name}</p>
                {diagnosticData.pinecone?.connection === "success" ? (
                  <>
                    <div className="flex items-center my-1">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <p>Connection: Success</p>
                    </div>
                    <p>Vector Count: {diagnosticData.pinecone?.vector_count}</p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center my-1">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      <p>Connection: Failed</p>
                    </div>
                    {diagnosticData.pinecone?.error_message && (
                      <p className="text-red-400 text-sm">Error: {diagnosticData.pinecone.error_message}</p>
                    )}
                  </>
                )}
              </div>
              
              <div className="border border-gray-800 rounded p-3">
                <h3 className="font-medium mb-2">OpenAI</h3>
                {diagnosticData.openai?.connection === "success" ? (
                  <>
                    <div className="flex items-center my-1">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <p>Connection: Success</p>
                    </div>
                    <p>Available Models: {diagnosticData.openai?.available_models}</p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center my-1">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      <p>Connection: Failed</p>
                    </div>
                    {diagnosticData.openai?.error_message && (
                      <p className="text-red-400 text-sm">Error: {diagnosticData.openai.error_message}</p>
                    )}
                  </>
                )}
              </div>
              
              <div className="text-sm text-gray-400 mt-4">
                <p>If you're seeing API key errors, ensure your .env file has the correct keys:</p>
                <pre className="bg-gray-800 p-2 mt-1 rounded overflow-x-auto">
                  OPENAI_API_KEY=sk-...your-key-here<br/>
                  PINECONE_API_KEY=your-key-here<br/>
                  {storageMode !== 'vercelKV' && (
                    <>
                    <span className="text-yellow-400"># For Vercel KV storage:</span><br/>
                    VERCEL_KV_URL=your-kv-url-here<br/>
                    VERCEL_KV_REST_API_TOKEN=your-token-here<br/>
                    VERCEL_KV_REST_API_URL=your-api-url-here
                    </>
                  )}
                </pre>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-40">
              <RefreshCw size={24} className="animate-spin text-blue-400" />
              <span className="ml-2">Loading diagnostics...</span>
            </div>
          )}
          
          <div className="flex justify-end mt-4">
            <Button onClick={() => setShowDiagnostics(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Migration Dialog */}
      <Dialog open={showMigrationDialog} onOpenChange={setShowMigrationDialog}>
        <DialogContent className="max-w-md bg-gray-900 text-white border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Migrate Document Storage</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-gray-300 mb-4">
              This will migrate all documents from localStorage to Vercel KV storage, creating a more robust and scalable solution.
            </p>
            
            {migrationStats && (
              <div className={`p-3 rounded mb-4 ${
                migrationStats.errors > 0 ? 'bg-red-900/30 border border-red-800' : 'bg-green-900/30 border border-green-800'
              }`}>
                <h4 className="font-medium">Migration Results</h4>
                <p>Documents migrated: {migrationStats.migrated}</p>
                <p>Errors: {migrationStats.errors}</p>
              </div>
            )}
            
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowMigrationDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={migrateToVercelKV} 
                disabled={isMigrating || storageMode !== 'vercelKV'}
                className="flex items-center gap-1"
              >
                {isMigrating ? (
                  <RefreshCw size={14} className="animate-spin mr-1" />
                ) : (
                  <HardDrive size={14} className="mr-1" />
                )}
                {isMigrating ? 'Migrating...' : 'Start Migration'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 