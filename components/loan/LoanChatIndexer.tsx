import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Database, RefreshCw, CheckCircle, XCircle, AlertTriangle, Wrench, Trash2, Link, HardDrive, AlertCircle, ArrowRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { simpleDocumentService } from '@/utilities/simplifiedDocumentService';
import storageService from '@/services/storageService';
import { KV_CONFIG, isVercelKVConfigured } from '@/configuration/storageConfig';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import LoanDocumentDebugTools from './LoanDocumentDebugTools';

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

  useEffect(() => {
    // Check if documents are already indexed
    const checkIndexStatus = async () => {
      try {
        const response = await fetch(`/api/loan-documents/index?loanId=${loanId}`, {
          method: 'GET',
        });
        
        const data = await response.json();
        
        if (data.documentCount && data.documentCount > 0) {
          setTotalDocs(data.documentCount);
          setMessage(`Found ${data.documentCount} documents for loan ${loanId}`);
        } else if (data.error) {
          setMessage(data.error);
        }
      } catch (error) {
        console.error('Error checking index status:', error);
      }
    };
    
    if (loanId) {
      checkIndexStatus();
    }
  }, [loanId]);

  const startIndexing = async () => {
    try {
      setIndexingStatus('indexing');
      setProgress(10);
      setMessage('Starting document indexing...');
      setErrorDetails(null);
      
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
      
      const data = await response.json();
      
      setProgress(100);
      
      if (data.error) {
        setIndexingStatus('error');
        setMessage(data.error);
        setErrorDetails(JSON.stringify(data, null, 2));
      } else {
        setIndexingStatus('success');
        setMessage(data.message);
        setIndexedDocs(data.indexedDocuments);
        setTotalDocs(data.totalDocuments);
      }
    } catch (error) {
      setIndexingStatus('error');
      setMessage(`Error indexing documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setErrorDetails(error instanceof Error ? error.stack || error.message : 'Unknown error');
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

  const [showDebugTools, setShowDebugTools] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  const toggleDebugTools = () => {
    setShowDebugTools(!showDebugTools);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 p-4 bg-gray-50 border rounded-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">Loan Document Indexing</h3>
            <p className="text-sm text-gray-600">
              {indexingStatus === 'idle' 
                ? `Index your loan documents to enable AI search and chat features` 
                : message}
            </p>
            {indexingStatus === 'success' && (
              <p className="text-sm text-green-600 font-medium mt-1">
                Successfully indexed {indexedDocs} of {totalDocs} documents
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={startIndexing} 
              disabled={indexingStatus === 'indexing'}
              variant={indexingStatus === 'success' ? 'outline' : 'default'}
            >
              {indexingStatus === 'indexing' ? 'Indexing...' : 
               indexingStatus === 'success' ? 'Reindex Documents' : 'Index Documents'}
              {indexingStatus !== 'indexing' && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
            <Button 
              onClick={toggleDebugTools} 
              variant="ghost"
              size="sm"
            >
              {showDebugTools ? 'Hide Debug Tools' : 'Debug Tools'}
            </Button>
          </div>
        </div>
        
        {indexingStatus === 'indexing' && (
          <Progress value={progress} className="w-full h-2" />
        )}
        
        {indexingStatus === 'error' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {message}
              {errorDetails && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm">Show details</summary>
                  <pre className="mt-2 text-xs bg-gray-900 text-white p-4 rounded-md overflow-auto max-h-[200px]">
                    {errorDetails}
                  </pre>
                </details>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        {indexingStatus === 'success' && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Success</AlertTitle>
            <AlertDescription className="text-green-700">
              {message}
            </AlertDescription>
          </Alert>
        )}
      </div>
      
      {showDebugTools && <LoanDocumentDebugTools loanId={loanId} />}
    </div>
  );
} 