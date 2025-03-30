// components/document/SimpleDocumentAnalytics.tsx
import React, { useEffect, useState } from 'react';
import { BarChart2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { simpleDocumentService, SimpleDocument } from '@/utilities/simplifiedDocumentService';

interface SimpleDocumentAnalyticsProps {
  loanId: string;
  refreshTrigger?: number;
}

export default function SimpleDocumentAnalytics({ 
  loanId, 
  refreshTrigger = 0 
}: SimpleDocumentAnalyticsProps) {
  const [documentStats, setDocumentStats] = useState({
    total: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
    categories: {} as Record<string, number>
  });
  
  useEffect(() => {
    // Fetch documents and calculate stats
    const calculateStats = () => {
      const documents = simpleDocumentService.getDocumentsForLoan(loanId);
      
      if (!documents || documents.length === 0) {
        return;
      }
      
      // Calculate statistics
      const totalDocuments = documents.length;
      const approvedCount = documents.filter(doc => doc.status === 'approved').length;
      const rejectedCount = documents.filter(doc => doc.status === 'rejected').length;
      const pendingCount = totalDocuments - approvedCount - rejectedCount;
      
      // Calculate category distribution
      const categoryCount: Record<string, number> = {};
      documents.forEach(doc => {
        const category = doc.category;
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });
      
      setDocumentStats({
        total: totalDocuments,
        approved: approvedCount,
        rejected: rejectedCount,
        pending: pendingCount,
        categories: categoryCount
      });
    };
    
    calculateStats();
  }, [loanId, refreshTrigger]);
  
  // If there are no documents, don't show anything
  if (documentStats.total === 0) {
    return null;
  }
  
  return (
    <div className="p-4 border rounded-lg bg-white">
      <h3 className="text-lg font-medium mb-4 flex items-center">
        <BarChart2 size={18} className="mr-2 text-blue-500" />
        Document Analytics
      </h3>
      
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="p-3 bg-blue-50 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-700">{documentStats.total}</div>
          <div className="text-xs text-blue-600">Total Documents</div>
        </div>
        <div className="p-3 bg-green-50 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-700">{documentStats.approved}</div>
          <div className="text-xs text-green-600">Approved</div>
        </div>
        <div className="p-3 bg-orange-50 rounded-lg text-center">
          <div className="text-2xl font-bold text-orange-700">{documentStats.pending}</div>
          <div className="text-xs text-orange-600">Pending Review</div>
        </div>
      </div>
      
      <h4 className="text-sm font-medium mb-2">Document Categories</h4>
      
      <div className="space-y-2">
        {Object.entries(documentStats.categories).map(([category, count]) => (
          <div key={category} className="flex items-center">
            <div className="w-24 capitalize text-xs">{category}</div>
            <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={getCategoryColor(category)}
                style={{ width: `${(count / documentStats.total) * 100}%` }}
              ></div>
            </div>
            <div className="w-8 text-xs text-right font-medium">{count}</div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        Last updated: {new Date().toLocaleString()}
      </div>
    </div>
  );
}

function getCategoryColor(category: string): string {
  switch (category) {
    case 'loan': return 'bg-blue-500';
    case 'legal': return 'bg-purple-500';
    case 'financial': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
}