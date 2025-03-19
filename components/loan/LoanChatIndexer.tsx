import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Database, RefreshCw, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface LoanChatIndexerProps {
  loanId: string;
}

export default function LoanChatIndexer({ loanId }: LoanChatIndexerProps) {
  const [indexingStatus, setIndexingStatus] = useState<'idle' | 'indexing' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [indexedDocs, setIndexedDocs] = useState(0);
  const [totalDocs, setTotalDocs] = useState(0);

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
        </div>
      )}
      
      <div className="mt-4">
        <p className="text-gray-500 text-xs">
          Indexing makes loan documents searchable and allows the chatbot to provide specific answers based on document contents.
        </p>
      </div>
    </div>
  );
} 