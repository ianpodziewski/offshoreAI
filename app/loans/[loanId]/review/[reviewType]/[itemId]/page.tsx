'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Save,
  Download,
  ChevronLeft,
  FileText
} from 'lucide-react';
import { loanDatabase } from '@/utilities/loanDatabase';
import { simpleDocumentService, SimpleDocument } from '@/utilities/simplifiedDocumentService';
import DocumentSockets from '@/components/document/DocumentSockets';
import LayoutWrapper from '@/app/layout-wrapper';

// Import types but don't directly use loanDocumentService to prevent TypeScript errors
import type { DocumentCategory, LoanDocument } from '@/utilities/loanDocumentStructure';

// Define review types
type ReviewType = 'initial_inquiry' | 'application' | 'property_evaluation' | 'underwriting' | 'closing_prep' | 'closing' | 'post_closing' | 'servicing';

// Define types for review items and checklist items
type ChecklistItem = {
  id: string;
  text: string;
  checked: boolean;
};

type ReviewItem = {
  id: number;
  name: string;
  status: string;
  checklist?: ChecklistItem[];
  description?: string;
};

type ReviewSection = {
  status: string;
  items: ReviewItem[];
};

type ReviewData = {
  [key in ReviewType]: ReviewSection;
};

// Type for loan document as stored in the database (might differ from LoanDocument)
interface LoanDBDocument {
  id: string;
  loanId: string;
  filename: string;
  fileType?: string;
  docType?: string;
  content?: string;
  dateUploaded: string;
  status: string;
  category: string;
  notes?: string;
  url?: string;
}

// Type to match the actual structure of documents in the loan database
interface LoanCategoryDocuments {
  category: string;
  files: {
    filename: string;
    uploadDate: string;
    status: string;
    url?: string;
  }[];
}

// Map review items to document types from loan document structure
const reviewToDocumentTypeMap: Record<string, string[]> = {
  'initial_inquiry-1': [
    'credit_report', 
    'photo_id', 
    'background_check', 
    'ofac_check', 
    'investment_history'
  ],
  'initial_inquiry-2': ['property_photos', 'preliminary_title', 'purchase_contract'],
  'initial_inquiry-3': ['loan_application', 'financial_statement'],
  'application-1': ['financial_statement', 'bank_statements', 'personal_tax_returns'],
};

// Descriptions for each document type to help users understand what to upload
const documentDescriptions: Record<string, string> = {
  'credit_report': 'Credit report showing borrower\'s credit score and history',
  'photo_id': 'Government-issued ID or passport',
  'background_check': 'Background check report showing no foreclosures or bankruptcies',
  'ofac_check': 'OFAC verification results showing borrower is not on the list',
  'investment_history': 'Documentation of borrower\'s real estate investment experience',
  'property_photos': 'Recent photos of the property (interior and exterior)',
  'preliminary_title': 'Preliminary title report',
  'purchase_contract': 'Executed purchase agreement',
  'loan_application': 'Completed loan application form',
  'financial_statement': 'Personal financial statement',
  'bank_statements': 'Last 3 months of bank statements',
  'personal_tax_returns': 'Last 2 years of tax returns'
};

// Mock review data - in a real app, this would come from an API or database
const mockReviewData: ReviewData = {
  initial_inquiry: {
    status: 'incomplete',
    items: [
      { 
        id: 1, 
        name: 'Borrower Eligibility', 
        status: 'complete',
        description: 'Verify borrower meets eligibility requirements for the loan program',
        checklist: [
          { id: 'be1', text: 'Credit score meets minimum program threshold (650+ for Fix-and-Flip, 680+ for other programs)', checked: true },
          { id: 'be2', text: 'No foreclosures or bankruptcies within past 3 years', checked: true },
          { id: 'be3', text: 'No outstanding judgments exceeding $10,000', checked: true },
          { id: 'be4', text: 'Borrower is not on OFAC list', checked: true },
          { id: 'be5', text: 'Borrower\'s experience level appropriately classified (Tier 1, 2, or 3)', checked: true }
        ]
      },
      { 
        id: 2, 
        name: 'Property Preliminary Assessment', 
        status: 'incomplete',
        description: 'Evaluate property type, location, and basic characteristics',
        checklist: [
          { id: 'ppa1', text: 'Property type is on approved list', checked: true },
          { id: 'ppa2', text: 'Property is not owner-occupied', checked: true },
          { id: 'ppa3', text: 'Property location is within lending territory', checked: true },
          { id: 'ppa4', text: 'Property size exceeds 500 square feet', checked: false },
          { id: 'ppa5', text: 'Property is not a mobile/manufactured home', checked: true },
          { id: 'ppa6', text: 'No known environmental issues', checked: false }
        ]
      },
      { 
        id: 3, 
        name: 'Loan Parameters', 
        status: 'incomplete',
        description: 'Verify loan request meets program parameters and guidelines',
        checklist: [
          { id: 'lp1', text: 'Requested loan amount within program limits', checked: true },
          { id: 'lp2', text: 'Preliminary LTV within program guidelines', checked: false },
          { id: 'lp3', text: 'Loan purpose aligns with program objectives', checked: true },
          { id: 'lp4', text: 'Loan term request is within guidelines', checked: true },
          { id: 'lp5', text: 'Preliminary exit strategy is viable', checked: false }
        ]
      }
    ]
  },
  application: {
    status: 'not_started',
    items: [
      { 
        id: 1, 
        name: 'Borrower Financial Verification', 
        status: 'not_started',
        description: 'Verify borrower financial information and capacity',
        checklist: [
          { id: 'bfv1', text: 'Financial statement shows positive net worth', checked: false },
          { id: 'bfv2', text: 'Bank statements verify declared liquidity', checked: false },
          { id: 'bfv3', text: 'Minimum cash reserves confirmed (6+ months of payments)', checked: false },
          { id: 'bfv4', text: 'Income sources verified and documented', checked: false },
          { id: 'bfv5', text: 'Debt-to-income ratio below 50%', checked: false }
        ]
      }
    ]
  },
  property_evaluation: { status: 'not_started', items: [] },
  underwriting: { status: 'not_started', items: [] },
  closing_prep: { status: 'not_started', items: [] },
  closing: { status: 'not_started', items: [] },
  post_closing: { status: 'not_started', items: [] },
  servicing: { status: 'not_started', items: [] }
};

export default function ReviewItemPage() {
  const params = useParams();
  const router = useRouter();
  const loanId = params.loanId as string;
  const reviewType = params.reviewType as ReviewType;
  const itemId = parseInt(params.itemId as string);
  
  const [loan, setLoan] = useState<any>(null);
  const [reviewItem, setReviewItem] = useState<ReviewItem | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [currentDocument, setCurrentDocument] = useState<LoanDBDocument | SimpleDocument | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<Record<string, LoanDBDocument | SimpleDocument>>({});
  const [loanDocuments, setLoanDocuments] = useState<LoanDBDocument[]>([]);
  
  // Helper functions moved up to avoid reference errors
  // Get relevant documents for this review item
  const getRelevantDocuments = () => {
    const key = `${reviewType}-${itemId}`;
    return reviewToDocumentTypeMap[key] || [];
  };
  
  // Convert a loan document to the expected format for display
  const convertToDisplayDoc = (doc: any): LoanDBDocument => {
    // If it's already in the correct format, return as is
    if (doc.id && doc.loanId && doc.filename && doc.dateUploaded) {
      return doc as LoanDBDocument;
    }
    
    // Otherwise, try to convert the document to the expected format
    return {
      id: doc.id || `doc-${Math.random().toString(36).substring(2, 9)}`,
      loanId: loanId,
      filename: doc.filename || 'Unknown document',
      docType: doc.docType || '',
      fileType: doc.fileType || 'text/plain',
      content: doc.content || '',
      dateUploaded: doc.dateUploaded || new Date().toISOString(),
      status: doc.status || 'pending',
      category: doc.category || 'borrower',
      notes: doc.notes || '',
      url: doc.url
    };
  };
  
  // Load loan data and existing documents
  useEffect(() => {
    if (loanId && reviewType && !isNaN(itemId)) {
      const loanData = loanDatabase.getLoanById(loanId);
      if (loanData) {
        setLoan(loanData);
        
        // Find the specific review item
        const section = mockReviewData[reviewType];
        if (section) {
          const item = section.items.find(i => i.id === itemId);
          if (item) {
            setReviewItem(item);
          }
        }
        
        // Load existing documents for this loan
        const existingDocuments = simpleDocumentService.getDocumentsForLoan(loanId);
        
        // Get documents from the loan object
        // The loan documents are organized by category, with each category containing an array of files
        const loanDocsCategories = loanData.documents || [];
        
        // Extract document files and flatten into individual documents
        const extractedDocs: LoanDBDocument[] = [];
        loanDocsCategories.forEach((category: LoanCategoryDocuments) => {
          if (category.files && Array.isArray(category.files)) {
            category.files.forEach(file => {
              // Create a LoanDBDocument for each file
              const doc: LoanDBDocument = {
                id: `file-${Math.random().toString(36).substring(2, 9)}`,
                loanId: loanId,
                filename: file.filename || 'Unknown document',
                docType: getDocTypeFromFilename(file.filename || ''),
                fileType: getFileTypeFromFilename(file.filename || ''),
                content: '',
                dateUploaded: file.uploadDate || new Date().toISOString(),
                status: file.status || 'pending',
                category: category.category,
                notes: '',
                url: file.url
              };
              extractedDocs.push(doc);
            });
          }
        });
        
        // Store the extracted documents
        setLoanDocuments(extractedDocs);
        
        // Organize documents by docType for easy access
        const docMap: Record<string, LoanDBDocument | SimpleDocument> = {};
        
        // First populate with documents from simpleDocumentService
        existingDocuments.forEach(doc => {
          if (doc.docType) {
            docMap[doc.docType] = doc;
          }
        });
        
        // Then add documents from the extracted loan documents (these take precedence)
        extractedDocs.forEach(doc => {
          if (doc.docType) {
            docMap[doc.docType] = doc;
          }
        });
        
        // If we have documents, select the first one to display automatically
        const relevantDocTypes = getRelevantDocuments();
        for (const docType of relevantDocTypes) {
          if (docMap[docType]) {
            setCurrentDocument(docMap[docType]);
            break;
          }
        }
        
        setUploadedDocuments(docMap);
      }
    }
  }, [loanId, reviewType, itemId]);
  
  // Helper function to derive docType from filename
  const getDocTypeFromFilename = (filename: string): string => {
    // Convert to lowercase and remove extension
    const name = filename.toLowerCase().split('.')[0];
    
    // Try to match with known document types
    if (name.includes('credit') && name.includes('report')) return 'credit_report';
    if (name.includes('id') || name.includes('identification') || name.includes('passport')) return 'photo_id';
    if (name.includes('background') && name.includes('check')) return 'background_check';
    if (name.includes('ofac')) return 'ofac_check';
    if (name.includes('experience') || name.includes('investment') && name.includes('history')) return 'investment_history';
    if (name.includes('property') && (name.includes('photo') || name.includes('picture') || name.includes('image'))) return 'property_photos';
    if (name.includes('title') && name.includes('report')) return 'preliminary_title';
    if (name.includes('purchase') && name.includes('contract')) return 'purchase_contract';
    if (name.includes('loan') && name.includes('application')) return 'loan_application';
    if (name.includes('financial') && name.includes('statement')) return 'financial_statement';
    if (name.includes('bank') && name.includes('statement')) return 'bank_statements';
    if (name.includes('tax') && name.includes('return')) return 'personal_tax_returns';
    
    // Default fallback
    return '';
  };
  
  // Helper function to get file type based on filename extension
  const getFileTypeFromFilename = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    
    switch (ext) {
      case 'pdf': return 'application/pdf';
      case 'doc':
      case 'docx': return 'application/msword';
      case 'xls':
      case 'xlsx': return 'application/vnd.ms-excel';
      case 'jpg':
      case 'jpeg': return 'image/jpeg';
      case 'png': return 'image/png';
      case 'txt': return 'text/plain';
      default: return 'application/octet-stream';
    }
  };
  
  // Render loading state
  if (!loan || !reviewItem) {
    return (
      <LayoutWrapper>
        <div className="flex items-center justify-center h-96">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </LayoutWrapper>
    );
  }
  
  // Handle checkbox change
  const handleCheckboxChange = (checklistId: string) => {
    setReviewItem((prevItem) => {
      if (!prevItem || !prevItem.checklist) return prevItem;
      
      const updatedChecklist = prevItem.checklist.map((item) => {
        if (item.id === checklistId) {
          return { ...item, checked: !item.checked };
        }
        return item;
      });
      
      // Determine new status based on checklist completion
      const allChecked = updatedChecklist.every((item) => item.checked);
      const anyChecked = updatedChecklist.some((item) => item.checked);
      
      const newStatus = allChecked ? 'complete' : anyChecked ? 'incomplete' : 'not_started';
      
      return {
        ...prevItem,
        checklist: updatedChecklist,
        status: newStatus
      };
    });
  };
  
  // Save review changes
  const saveReviewChanges = () => {
    // Here you would implement the logic to save the review changes to your API or database
    alert('Review changes saved!');
  };
  
  // View a document
  const handleViewDocument = (document: LoanDBDocument | SimpleDocument) => {
    setCurrentDocument(document);
  };
  
  // Get status icon based on status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'incomplete':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'not_started':
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };
  
  // Get status text based on status
  const getStatusText = (status: string) => {
    switch (status) {
      case 'complete':
        return 'Complete';
      case 'incomplete':
        return 'In Progress';
      case 'not_started':
      default:
        return 'Not Started';
    }
  };
  
  // Format reviewType for display
  const formatReviewType = (type: string): string => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };
  
  // Get document label from type
  const getDocumentLabel = (docType: string): string => {
    // First try to get label from loan document structure
    const docTypeInfo = loanDocuments.find(doc => doc.docType === docType);
    if (docTypeInfo) {
      return docTypeInfo.filename.split('.')[0]; // Remove extension
    }
    
    // Fall back to formatting the docType
    return docType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Get document description
  const getDocumentDescription = (docType: string): string => {
    return documentDescriptions[docType] || '';
  };
  
  return (
    <LayoutWrapper>
      <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to {formatReviewType(reviewType)} Review
          </button>
          <h1 className="text-3xl font-bold mt-4 text-white">
            {reviewItem.name}
          </h1>
          <p className="text-lg mt-1 text-gray-400">
            {reviewItem.description || 'Complete the following checklist items'}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* File Sockets - Left Side */}
          <div className="w-full lg:w-1/3 space-y-4">
            <Card className="bg-[#1A2234] border-gray-800">
              <CardHeader>
                <CardTitle className="text-xl text-white">Required Documents</CardTitle>
                <CardDescription className="text-gray-400">
                  Upload or review required documents for this review
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Show custom relevant documents for this specific review item */}
                <div className="space-y-4">
                  {getRelevantDocuments().map((docType) => (
                    <div key={docType} 
                      className={`border rounded-md p-4 bg-[#141b2d] transition-colors ${
                        uploadedDocuments[docType] ? 'border-blue-600' : 'border-gray-700 hover:border-gray-600'
                      }`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium text-white">{getDocumentLabel(docType)}</h3>
                          <p className="text-xs text-gray-400">{getDocumentDescription(docType)}</p>
                        </div>
                      </div>
                      
                      {uploadedDocuments[docType] ? (
                        <div className="mt-3 border border-blue-700 rounded-md p-3 bg-blue-900/20">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <FileText className="h-5 w-5 text-blue-400 mr-2" />
                              <div>
                                <p className="text-sm font-medium text-blue-300">{uploadedDocuments[docType].filename}</p>
                                <p className="text-xs text-gray-400">
                                  Uploaded {new Date(uploadedDocuments[docType].dateUploaded).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => setCurrentDocument(uploadedDocuments[docType])}
                            >
                              View
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 border border-dashed border-gray-700 rounded-md p-4 text-center">
                          <FileText className="h-8 w-8 mx-auto text-gray-500 mb-2" />
                          <p className="text-sm text-gray-400 mb-2">Drag & drop a PDF file here</p>
                          <Button size="sm" variant="secondary" className="mx-auto">
                            Upload File
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {currentDocument && (
              <Card className="bg-[#1A2234] border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg text-white">{currentDocument.filename}</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setCurrentDocument(null)}
                  >
                    <ChevronLeft size={16} className="mr-1" />
                    Hide
                  </Button>
                </CardHeader>
                <CardContent className="p-1">
                  <div className="bg-white rounded h-[500px] overflow-auto">
                    {currentDocument.content && (
                      typeof currentDocument.content === 'string' && 
                      (currentDocument.content.startsWith('<html') || currentDocument.content.includes('<!DOCTYPE html'))
                    ) ? (
                      <div 
                        className="h-full" 
                        dangerouslySetInnerHTML={{ __html: currentDocument.content }}
                      />
                    ) : (
                      <div className="p-4">
                        <pre className="whitespace-pre-wrap break-words text-black">{currentDocument.content}</pre>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between p-4">
                  <Button variant="outline" size="sm">
                    <Download size={16} className="mr-1" />
                    Download
                  </Button>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Approve document logic
                        if (currentDocument && currentDocument.docType) {
                          const updatedDoc = {
                            ...currentDocument,
                            status: 'approved'
                          };
                          setUploadedDocuments(prev => ({
                            ...prev,
                            [currentDocument.docType as string]: updatedDoc
                          }));
                          setCurrentDocument(updatedDoc);
                          alert('Document approved!');
                        }
                      }}
                    >
                      <CheckCircle2 size={16} className="mr-1 text-green-500" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Reject document logic
                        if (currentDocument && currentDocument.docType) {
                          const updatedDoc = {
                            ...currentDocument,
                            status: 'rejected'
                          };
                          setUploadedDocuments(prev => ({
                            ...prev,
                            [currentDocument.docType as string]: updatedDoc
                          }));
                          setCurrentDocument(updatedDoc);
                          alert('Document rejected!');
                        }
                      }}
                    >
                      <AlertCircle size={16} className="mr-1 text-red-500" />
                      Reject
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            )}
          </div>
          
          {/* Right Side - Data Points and Checklist */}
          <div className="w-full lg:w-2/3 space-y-4">
            {/* Data Points - Top Right */}
            <Card className="bg-[#1A2234] border-gray-800">
              <CardHeader>
                <CardTitle className="text-xl text-white">
                  Loan Data Points
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Key metrics and information for this loan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-[#141b2d] border-gray-800">
                    <CardContent className="p-4">
                      <div className="text-sm text-gray-400">Loan Amount</div>
                      <div className="text-2xl font-bold text-white">${loan.loanAmount.toLocaleString()}</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#141b2d] border-gray-800">
                    <CardContent className="p-4">
                      <div className="text-sm text-gray-400">LTV</div>
                      <div className="text-2xl font-bold text-white">{loan.ltv}%</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#141b2d] border-gray-800">
                    <CardContent className="p-4">
                      <div className="text-sm text-gray-400">Loan Term</div>
                      <div className="text-2xl font-bold text-white">{loan.term} Months</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#141b2d] border-gray-800">
                    <CardContent className="p-4">
                      <div className="text-sm text-gray-400">Interest Rate</div>
                      <div className="text-2xl font-bold text-white">{loan.interestRate}%</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#141b2d] border-gray-800">
                    <CardContent className="p-4">
                      <div className="text-sm text-gray-400">Property Type</div>
                      <div className="text-2xl font-bold text-white">{loan.propertyType}</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#141b2d] border-gray-800">
                    <CardContent className="p-4">
                      <div className="text-sm text-gray-400">Borrower</div>
                      <div className="text-2xl font-bold text-white">{loan.borrowerName}</div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
            
            {/* Review Checklist - Bottom Right */}
            <Card className="bg-[#1A2234] border-gray-800">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl text-white">
                      Review Checklist
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Complete all checklist items for this review
                    </CardDescription>
                  </div>
                  <div className="flex items-center">
                    {getStatusIcon(reviewItem.status)}
                    <span className="ml-2 text-sm" style={{ color: reviewItem.status === 'complete' ? '#10B981' : reviewItem.status === 'incomplete' ? '#FBBF24' : '#6B7280' }}>
                      {getStatusText(reviewItem.status)}
                    </span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {reviewItem.checklist ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {reviewItem.checklist.map((checkItem) => (
                        <div key={checkItem.id} className="flex items-start py-3 border-b border-gray-800">
                          <div className="flex h-5 items-center">
                            <input
                              type="checkbox"
                              checked={checkItem.checked}
                              onChange={() => handleCheckboxChange(checkItem.id)}
                              className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-600"
                            />
                          </div>
                          <label className="ml-2 text-sm text-gray-300">
                            {checkItem.text}
                          </label>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-gray-800">
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Review Notes
                      </label>
                      <Textarea 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add any notes or observations related to this review item..."
                        className="min-h-[150px] bg-[#141b2d] border-gray-800 text-gray-300"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-400">
                    No checklist items defined for this review
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button 
                  variant="default" 
                  onClick={saveReviewChanges}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save size={16} className="mr-2" />
                  Save Review
                </Button>
                
                <Button 
                  variant="default"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    if (reviewItem.checklist?.every(item => item.checked)) {
                      alert('Review item completed successfully!');
                    } else {
                      alert('Please complete all checklist items before marking as complete.');
                    }
                  }}
                >
                  <CheckCircle2 size={16} className="mr-2" />
                  Mark as Complete
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
} 