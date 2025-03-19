"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, RefreshCw, Info, Wrench } from 'lucide-react';

interface LoanDocumentDebugToolsProps {
  loanId: string;
}

export default function LoanDocumentDebugTools({ loanId }: LoanDocumentDebugToolsProps) {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error' | 'info'} | null>(null);
  
  // Debug actions
  const runDiagnostics = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/loan-documents/debug?loanId=${loanId}`);
      const data = await response.json();
      setDiagnostics(data.diagnostics);
      setMessage({
        text: 'Diagnostics completed successfully',
        type: 'info'
      });
    } catch (error) {
      setMessage({
        text: `Error running diagnostics: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fixStorage = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/loan-documents/debug?loanId=${loanId}&action=fix-storage`);
      const data = await response.json();
      setDiagnostics(data.diagnostics);
      setMessage({
        text: data.message || `Fixed document storage issues`,
        type: 'success'
      });
    } catch (error) {
      setMessage({
        text: `Error fixing storage: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const clearAndRegenerate = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/loan-documents/debug?loanId=${loanId}&action=clear-and-regenerate`);
      const data = await response.json();
      setDiagnostics(data.diagnostics);
      setMessage({
        text: data.message || `Cleared and regenerated test document`,
        type: 'success'
      });
    } catch (error) {
      setMessage({
        text: `Error clearing documents: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const checkPinecone = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/loan-documents/debug?loanId=${loanId}&action=check-pinecone`);
      const data = await response.json();
      setDiagnostics(data.diagnostics);
      setMessage({
        text: data.message || `Checked Pinecone connection`,
        type: data.error ? 'error' : 'success'
      });
    } catch (error) {
      setMessage({
        text: `Error checking Pinecone: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Run diagnostics on mount
  useEffect(() => {
    if (loanId) {
      runDiagnostics();
    }
  }, [loanId]);
  
  return (
    <div className="space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Loan Document Diagnostic Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          {message && (
            <Alert className={`mb-4 ${message.type === 'error' ? 'bg-red-50' : message.type === 'success' ? 'bg-green-50' : 'bg-blue-50'}`}>
              <AlertTitle className="flex items-center gap-2">
                {message.type === 'error' ? <XCircle className="h-4 w-4 text-red-600" /> : 
                 message.type === 'success' ? <CheckCircle className="h-4 w-4 text-green-600" /> : 
                 <Info className="h-4 w-4 text-blue-600" />}
                {message.type === 'error' ? 'Error' : message.type === 'success' ? 'Success' : 'Information'}
              </AlertTitle>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Button onClick={runDiagnostics} disabled={loading} variant="outline">
              {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Info className="h-4 w-4 mr-2" />}
              Run Diagnostics
            </Button>
            <Button onClick={fixStorage} disabled={loading} variant="outline">
              {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Wrench className="h-4 w-4 mr-2" />}
              Fix Document Storage
            </Button>
            <Button onClick={clearAndRegenerate} disabled={loading} variant="outline">
              {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Clear & Create Test Doc
            </Button>
            <Button onClick={checkPinecone} disabled={loading} variant="outline">
              {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
              Check Pinecone
            </Button>
          </div>
          
          {diagnostics && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Storage Mode</h3>
                  <Badge variant={diagnostics.storage.mode.includes('Fallback') ? 'destructive' : 'default'}>
                    {diagnostics.storage.mode}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Environment</h3>
                  <Badge>{diagnostics.environment}</Badge>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Vercel KV</h3>
                  <Badge variant={
                    diagnostics.vercelKV.url === 'configured' && 
                    diagnostics.vercelKV.restUrl === 'configured' && 
                    diagnostics.vercelKV.restToken === 'configured' ? 'default' : 'destructive'
                  }>
                    {diagnostics.vercelKV.url === 'configured' && 
                     diagnostics.vercelKV.restUrl === 'configured' && 
                     diagnostics.vercelKV.restToken === 'configured' ? 'Configured' : 'Missing Config'}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Document Count</h3>
                  <Badge variant={diagnostics.documents.count > 0 ? 'default' : 'destructive'}>
                    {diagnostics.documents.count} documents
                  </Badge>
                </div>
              </div>
              
              {diagnostics.pinecone && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Pinecone</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs">Connection</h4>
                      <Badge variant={diagnostics.pinecone.connection === 'success' ? 'default' : 'destructive'}>
                        {diagnostics.pinecone.connection}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="text-xs">Total Records</h4>
                      <Badge>{diagnostics.pinecone.recordCount || 0}</Badge>
                    </div>
                    {diagnostics.pinecone.loanRecordCount !== undefined && (
                      <div>
                        <h4 className="text-xs">Loan Records</h4>
                        <Badge variant={diagnostics.pinecone.loanRecordCount > 0 ? 'default' : 'destructive'}>
                          {diagnostics.pinecone.loanRecordCount}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {diagnostics.documents.unassociatedCount > 0 && (
                <Alert className="bg-yellow-50">
                  <AlertTitle className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-yellow-600" />
                    Unassociated Documents
                  </AlertTitle>
                  <AlertDescription>
                    Found {diagnostics.documents.unassociatedCount} documents without a loan ID. 
                    Use the "Fix Document Storage" button to assign them to this loan.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          These tools help diagnose and fix issues with document storage and indexing
        </CardFooter>
      </Card>
    </div>
  );
} 