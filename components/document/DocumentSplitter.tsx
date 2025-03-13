import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { SimpleDocument } from '@/utilities/simplifiedDocumentService';
import { Loader2, SplitSquareVertical, Check, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

interface DocumentSplitterProps {
  document: SimpleDocument;
  onSplitComplete?: (result: {
    success: boolean;
    message: string;
    splitDocuments?: Array<{
      id: string;
      filename: string;
      docType: string;
      category: string;
    }>;
  }) => void;
}

const DocumentSplitter: React.FC<DocumentSplitterProps> = ({ document, onSplitComplete }) => {
  const [isSplitting, setIsSplitting] = useState(false);
  const [splitResult, setSplitResult] = useState<{
    success?: boolean;
    message?: string;
    splitDocuments?: Array<{
      id: string;
      filename: string;
      docType: string;
      category: string;
    }>;
  }>({});
  const { toast } = useToast();

  const handleSplitDocument = async () => {
    setIsSplitting(true);
    setSplitResult({});
    
    try {
      const response = await fetch('/api/split-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: document.id,
          loanId: document.loanId,
        }),
      });
      
      const result = await response.json();
      
      setSplitResult(result);
      
      if (result.success) {
        toast({
          title: 'Document Split Successfully',
          description: `Split into ${result.splitDocuments.length} documents`,
          variant: 'default',
        });
      } else {
        toast({
          title: 'Failed to Split Document',
          description: result.message,
          variant: 'destructive',
        });
      }
      
      if (onSplitComplete) {
        onSplitComplete(result);
      }
    } catch (error) {
      console.error('Error splitting document:', error);
      setSplitResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      });
      
      toast({
        title: 'Error',
        description: 'Failed to split document. Please try again.',
        variant: 'destructive',
      });
      
      if (onSplitComplete) {
        onSplitComplete({
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error occurred',
        });
      }
    } finally {
      setIsSplitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SplitSquareVertical className="h-5 w-5" />
          Document Splitter
        </CardTitle>
        <CardDescription>
          Split a loan document package into individual documents
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 border rounded-md bg-gray-50">
            <h3 className="font-medium mb-1">Selected Document</h3>
            <p className="text-sm text-gray-600">{document.filename}</p>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline">{document.docType}</Badge>
              <Badge variant="outline">{document.category}</Badge>
            </div>
          </div>
          
          {splitResult.success && splitResult.splitDocuments && (
            <div className="p-4 border rounded-md bg-green-50">
              <div className="flex items-center gap-2 mb-2">
                <Check className="h-5 w-5 text-green-600" />
                <h3 className="font-medium text-green-700">Split Complete</h3>
              </div>
              <p className="text-sm text-green-700 mb-2">{splitResult.message}</p>
              
              <h4 className="text-sm font-medium mt-3 mb-2">Split Documents:</h4>
              <ul className="space-y-2">
                {splitResult.splitDocuments.map((doc) => (
                  <li key={doc.id} className="text-sm p-2 bg-white rounded border">
                    <div className="font-medium">{doc.filename}</div>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">{doc.docType}</Badge>
                      <Badge variant="outline" className="text-xs">{doc.category}</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {splitResult.success === false && (
            <div className="p-4 border rounded-md bg-red-50">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <h3 className="font-medium text-red-700">Split Failed</h3>
              </div>
              <p className="text-sm text-red-700 mt-1">{splitResult.message}</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSplitDocument} 
          disabled={isSplitting}
          className="w-full"
        >
          {isSplitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Splitting Document...
            </>
          ) : (
            <>
              <SplitSquareVertical className="mr-2 h-4 w-4" />
              Split Document
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DocumentSplitter; 