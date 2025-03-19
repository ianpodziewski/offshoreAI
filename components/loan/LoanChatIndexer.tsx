import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Database, RefreshCw, CheckCircle, XCircle, AlertTriangle, Wrench, Trash2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
      
      // Call a special endpoint to clear the storage
      const response = await fetch('/api/loan-documents/clear-storage', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to clear storage: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Handle client-side storage clearing based on response
      if (data.clientAction === "clearStorage") {
        setProgress(50);
        setMessage('Clearing browser storage...');
        
        // Clear localStorage items
        if (data.clearInstructions?.storageKeys) {
          data.clearInstructions.storageKeys.forEach((key: string) => {
            try {
              localStorage.removeItem(key);
              console.log(`Cleared localStorage item: ${key}`);
            } catch (err) {
              console.error(`Error clearing localStorage key ${key}:`, err);
            }
          });
        }
        
        // Clear IndexedDB if specified
        if (data.clearInstructions?.dbName) {
          try {
            const dbName = data.clearInstructions.dbName;
            const request = indexedDB.deleteDatabase(dbName);
            
            request.onsuccess = () => {
              console.log(`Successfully deleted IndexedDB database: ${dbName}`);
              setProgress(90);
              setMessage('Storage cleared successfully, finalizing...');
            };
            
            request.onerror = () => {
              console.error(`Error deleting IndexedDB database: ${dbName}`);
              // Continue anyway
              setProgress(90);
              setMessage('Partial storage clear completed, finalizing...');
            };
            
            // Wait for the operation to complete
            request.onblocked = () => {
              console.warn(`IndexedDB deletion was blocked. Close any other open tabs of this site and try again.`);
              setProgress(90);
              setMessage('Storage partially cleared, please close other tabs and try again.');
            };
          } catch (dbError) {
            console.error('Error accessing IndexedDB:', dbError);
            // Continue anyway
          }
        }
      }
      
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
                  PINECONE_API_KEY=your-key-here
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
    </div>
  );
} 