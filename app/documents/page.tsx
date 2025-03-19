"use client";

import React, { useState, useEffect } from 'react';
import { clientDocumentService } from '@/services/clientDocumentService';
import { SimpleDocument } from '@/utilities/simplifiedDocumentService';
import LayoutWrapper from '@/app/layout-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Eye, SplitSquareVertical, Search, FileText, Filter } from 'lucide-react';
import Link from 'next/link';
import { ToastProvider } from '@/components/ui/toast';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<SimpleDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<SimpleDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Load all documents using the client service
    const fetchDocuments = async () => {
      try {
        const result = await clientDocumentService.getAllDocuments();
        setDocuments(result.documents || []);
        setFilteredDocuments(result.documents || []);
      } catch (error) {
        console.error('Error loading documents:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocuments();
  }, [refreshKey]);

  // Filter documents based on search term and category
  useEffect(() => {
    let filtered = documents;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.filename.toLowerCase().includes(term) || 
        doc.docType.toLowerCase().includes(term)
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(doc => doc.category === selectedCategory);
    }
    
    setFilteredDocuments(filtered);
  }, [searchTerm, selectedCategory, documents]);

  // Get unique categories for filtering
  const categories = Array.from(new Set(documents.map(doc => doc.category)));

  if (loading) {
    return (
      <LayoutWrapper>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin w-6 h-6 border-2 border-t-transparent rounded-full"></div>
          <span className="ml-2">Loading documents...</span>
        </div>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper>
      <ToastProvider>
        <div className="container mx-auto py-6 px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Document Management</h1>
              <p className="text-gray-500">
                View, manage, and split your loan documents
              </p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search documents..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                onClick={() => setSelectedCategory(null)}
                className="whitespace-nowrap"
              >
                All
              </Button>
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap"
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Document List */}
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium">No documents found</h3>
              <p className="text-gray-500 mt-2">
                {searchTerm || selectedCategory
                  ? "Try adjusting your search or filters"
                  : "Upload some documents to get started"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocuments.map((doc) => (
                <Card key={doc.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg truncate" title={doc.filename}>
                      {doc.filename}
                    </CardTitle>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline">{doc.docType}</Badge>
                      <Badge variant="outline">{doc.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-500 mb-4">
                      <p>Uploaded: {new Date(doc.dateUploaded).toLocaleDateString()}</p>
                      <p>Status: {doc.status}</p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/document/${doc.id}`} passHref>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </Link>
                      <Link href={`/document/${doc.id}?tab=split`} passHref>
                        <Button variant="outline" size="sm" className="flex-1">
                          <SplitSquareVertical className="h-4 w-4 mr-2" />
                          Split
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </ToastProvider>
    </LayoutWrapper>
  );
} 