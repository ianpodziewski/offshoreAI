'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Check, AlertCircle, Database, Loader2, Bug } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export const StorageMigration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDebugLoading, setIsDebugLoading] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    message?: string;
    migrated?: number;
    errors?: number;
  } | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const handleMigrate = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/migrate-storage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error migrating storage:', error);
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDebugRedis = async () => {
    setIsDebugLoading(true);
    setDebugInfo(null);
    
    try {
      const response = await fetch('/api/debug-redis');
      const data = await response.json();
      setDebugInfo(data);
    } catch (error) {
      console.error('Error debugging Redis:', error);
      setDebugInfo({
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    } finally {
      setIsDebugLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-4">
        <h3 className="text-lg font-medium">Storage Migration Utility</h3>
        <p className="text-sm text-muted-foreground">
          This utility will migrate your documents from localStorage to Redis.
          Use this if you have recently switched from localStorage to Redis storage and
          need to transfer your existing documents.
        </p>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={handleMigrate} 
            disabled={isLoading}
            className="w-fit"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Migrating...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Migrate Documents to Redis
              </>
            )}
          </Button>
          
          <Button 
            onClick={handleDebugRedis} 
            disabled={isDebugLoading}
            variant="outline"
            className="w-fit"
          >
            {isDebugLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Bug className="mr-2 h-4 w-4" />
                Debug Redis Contents
              </>
            )}
          </Button>
        </div>
      </div>

      {result && (
        <Alert variant={result.success ? "default" : "destructive"}>
          <div className="flex items-start">
            {result.success ? (
              <Check className="h-4 w-4 mr-2 mt-0.5" />
            ) : (
              <AlertCircle className="h-4 w-4 mr-2 mt-0.5" />
            )}
            <div>
              <AlertTitle>
                {result.success ? "Migration Successful" : "Migration Failed"}
              </AlertTitle>
              <AlertDescription>
                {result.message}
                {result.migrated !== undefined && (
                  <div className="mt-2">
                    <p>Documents migrated: {result.migrated}</p>
                    <p>Errors: {result.errors}</p>
                  </div>
                )}
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}

      {debugInfo && (
        <div className="mt-4 border rounded-md p-4">
          <h4 className="font-medium mb-2">Redis Debug Information</h4>
          
          {debugInfo.error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{debugInfo.message || (debugInfo.error as string)}</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-muted p-2 rounded-md">
                  <p className="text-sm font-medium">Total Documents</p>
                  <p className="text-xl">{debugInfo.total_documents}</p>
                </div>
                <div className="bg-muted p-2 rounded-md">
                  <p className="text-sm font-medium">Loan Collections</p>
                  <p className="text-xl">{debugInfo.loan_keys_count}</p>
                </div>
              </div>
              
              {debugInfo.loan_document_counts && Object.keys(debugInfo.loan_document_counts).length > 0 && (
                <div>
                  <h5 className="text-sm font-medium mb-1">Documents per Loan</h5>
                  <div className="bg-muted p-2 rounded-md">
                    {Object.entries(debugInfo.loan_document_counts).map(([loanId, count]) => (
                      <div key={loanId} className="flex justify-between text-sm">
                        <span className="font-mono">{loanId}</span>
                        <span>{String(count)} documents</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {debugInfo.sample_documents && debugInfo.sample_documents.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium mb-1">Sample Documents</h5>
                  <ScrollArea className="h-48 rounded-md border p-2">
                    <pre className="text-xs">{JSON.stringify(debugInfo.sample_documents, null, 2)}</pre>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 