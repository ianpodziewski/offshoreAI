"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import StatusBadge from '@/components/document/status-badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileText, Upload, Eye, RefreshCw } from 'lucide-react';
import LayoutWrapper from '../layout-wrapper';

// Define document categories based on your split_pdf.py FILE_SOCKETS
const DOCUMENT_CATEGORIES = {
  "legal": "Legal Documents",
  "financial": "Financial Documents",
  "loan": "Loan Documentation",
  "misc": "Miscellaneous Documents"
};

export default function DocumentDashboard() {
  const [documentSockets, setDocumentSockets] = useState<Record<string, string[]>>({});
  const [statuses, setStatuses] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch document sockets
      const socketsResponse = await fetch('/api/get-file-sockets');
      const socketsData = await socketsResponse.json();
      
      // Fetch document statuses
      const statusesResponse = await fetch('/api/document-status');
      const statusesData = await statusesResponse.json();
      
      setDocumentSockets(socketsData.files || {});
      setStatuses(statusesData.statuses || {});
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const refreshData = () => {
    setRefreshing(true);
    fetchData();
  };
  
  const getDocumentStatus = (docUrl: string) => {
    return statuses[docUrl]?.status || 'unassigned';
  };
  

  return (
    <LayoutWrapper>
      <div className="container mx-auto py-16 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Document Management</h1>
          <div className="flex gap-3">
            <Button 
              onClick={refreshData} 
              variant="outline"
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </Button>
            <Link 
              href="/upload" 
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              <Upload size={18} />
              Upload Document Package
            </Link>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading document sockets...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(DOCUMENT_CATEGORIES).map(([category, title]) => (
              <Card key={category} className="shadow-md">
                <CardHeader className="bg-gray-50 border-b">
                  <CardTitle className="text-lg">{title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {documentSockets[category]?.length > 0 ? (
                    <ul className="space-y-3">
                      {documentSockets[category].map((docUrl, idx) => {
                        const docName = docUrl.split('/').pop()?.replace('.pdf', '') || `Document ${idx+1}`;
                        const status = getDocumentStatus(docUrl);
                        return (
                          <li key={idx} className="flex justify-between items-center p-2 border rounded hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                              <FileText size={18} className="text-gray-500" />
                              <span className="font-medium">{docName}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <StatusBadge status={status} size="sm" />
                              <Link 
                                href={`/document?path=${encodeURIComponent(docUrl.replace('/api/download?file=', ''))}`}
                                className="p-1 rounded hover:bg-gray-200"
                                title="View Document"
                              >
                                <Eye size={16} />
                              </Link>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No {title.toLowerCase()} uploaded yet
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </LayoutWrapper>
  );
}