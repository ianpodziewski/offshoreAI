'use client';

import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, X, AlertCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { DocumentStatus } from '@/utilities/loanDocumentStructure';

// Define the document checklist item interface
interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

// Define the document verification checklist for different document types
const DOCUMENT_CHECKLISTS: Record<string, ChecklistItem[]> = {
  // Default checklist for all documents
  default: [
    { id: 'legible', text: 'Document is legible and clear', checked: false },
    { id: 'complete', text: 'All pages are present and complete', checked: false },
    { id: 'signatures', text: 'Required signatures are present', checked: false },
    { id: 'dates', text: 'Dates are accurate and within required timeframes', checked: false }
  ],
  // Specific checklists for document types
  loan_application: [
    { id: 'legible', text: 'Document is legible and clear', checked: false },
    { id: 'complete', text: 'All sections of the application are completed', checked: false },
    { id: 'signatures', text: 'Borrower signatures are present', checked: false },
    { id: 'dates', text: 'Application date is within 90 days', checked: false },
    { id: 'loan_details', text: 'Loan amount and terms match approval', checked: false },
    { id: 'property_details', text: 'Property details are complete and accurate', checked: false }
  ],
  photo_id: [
    { id: 'legible', text: 'ID is legible and clear', checked: false },
    { id: 'not_expired', text: 'ID is not expired', checked: false },
    { id: 'matches', text: 'Name matches application', checked: false },
    { id: 'govt_issued', text: 'Government-issued ID (passport, driver\'s license)', checked: false }
  ],
  credit_authorization: [
    { id: 'legible', text: 'Document is legible and clear', checked: false },
    { id: 'signatures', text: 'Borrower signatures are present', checked: false },
    { id: 'dates', text: 'Authorization date is within 120 days', checked: false },
    { id: 'correct_form', text: 'Using the correct and current authorization form', checked: false }
  ],
  financial_statement: [
    { id: 'legible', text: 'Document is legible and clear', checked: false },
    { id: 'complete', text: 'All sections are completed', checked: false },
    { id: 'signatures', text: 'Borrower signatures are present', checked: false },
    { id: 'dates', text: 'Statement date is within 90 days', checked: false },
    { id: 'assets', text: 'Assets section is complete and accurate', checked: false },
    { id: 'liabilities', text: 'Liabilities section is complete and accurate', checked: false }
  ],
  bank_statements: [
    { id: 'legible', text: 'Statements are legible and clear', checked: false },
    { id: 'complete', text: 'All pages are present including account summary', checked: false },
    { id: 'dates', text: 'Statements are for the last 3 months', checked: false },
    { id: 'account_info', text: 'Account holder name matches borrower', checked: false },
    { id: 'no_alterations', text: 'No signs of alterations or suspicious activity', checked: false }
  ],
  promissory_note: [
    { id: 'legible', text: 'Document is legible and clear', checked: false },
    { id: 'complete', text: 'All pages are present and complete', checked: false },
    { id: 'signatures', text: 'Borrower signatures are present on all required pages', checked: false },
    { id: 'loan_terms', text: 'Loan terms match approval', checked: false },
    { id: 'dates', text: 'Dates are accurate', checked: false },
    { id: 'notarized', text: 'Document is properly notarized if required', checked: false }
  ]
  // Additional document types can be added as needed
};

interface StoplightChecklistProps {
  docType: string;
  status: DocumentStatus;
  onStatusChange?: (status: DocumentStatus) => void;
}

export function StoplightChecklist({ docType, status, onStatusChange }: StoplightChecklistProps) {
  // State for the dialog
  const [isOpen, setIsOpen] = useState(false);
  
  // Load the appropriate checklist based on document type
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => {
    return DOCUMENT_CHECKLISTS[docType] || DOCUMENT_CHECKLISTS.default;
  });
  
  // Get overall verification status for the stoplight
  const getVerificationStatus = (): 'verified' | 'issues' | 'unverified' => {
    if (checklist.length === 0) return 'unverified';
    
    const allChecked = checklist.every(item => item.checked);
    const someChecked = checklist.some(item => item.checked);
    
    if (allChecked) return 'verified';
    if (someChecked) return 'issues';
    return 'unverified';
  };
  
  // Update checklist item
  const toggleChecklistItem = (id: string) => {
    setChecklist(prevChecklist => 
      prevChecklist.map(item => 
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };
  
  // Get color for stoplight based on verification status
  const getStoplightColor = () => {
    const verificationStatus = getVerificationStatus();
    
    switch(verificationStatus) {
      case 'verified':
        return 'bg-green-500';
      case 'issues':
        return 'bg-yellow-500';
      case 'unverified':
      default:
        return 'bg-red-500';
    }
  };
  
  // Update document status based on verification
  const updateDocumentStatus = () => {
    const verificationStatus = getVerificationStatus();
    
    let newStatus: DocumentStatus = status;
    if (verificationStatus === 'verified') {
      newStatus = 'approved';
    } else if (verificationStatus === 'issues') {
      newStatus = 'reviewed';
    }
    
    if (onStatusChange && newStatus !== status) {
      onStatusChange(newStatus);
    }
    
    setIsOpen(false);
  };
  
  // Handle button click with propagation stopping
  const handleStoplightClick = (e: React.MouseEvent) => {
    // Stop the event from bubbling up to parent elements
    e.preventDefault();
    e.stopPropagation();
    
    // Open the dialog
    setIsOpen(true);
  };
  
  return (
    <>
      {/* Stoplight indicator with updated click handler */}
      <button
        onClick={handleStoplightClick}
        className="w-16 h-6 rounded-full flex items-center p-1 bg-gray-800 relative"
        title="Document verification checklist"
      >
        <div className={`w-4 h-4 rounded-full absolute left-1 ${getVerificationStatus() === 'unverified' ? 'bg-red-500' : 'bg-gray-600'}`}></div>
        <div className={`w-4 h-4 rounded-full absolute left-6 ${getVerificationStatus() === 'issues' ? 'bg-yellow-500' : 'bg-gray-600'}`}></div>
        <div className={`w-4 h-4 rounded-full absolute left-11 ${getVerificationStatus() === 'verified' ? 'bg-green-500' : 'bg-gray-600'}`}></div>
      </button>
      
      {/* Checklist dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Document Verification Checklist</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-4">
              {checklist.map((item) => (
                <div key={item.id} className="flex items-start space-x-2">
                  <Checkbox 
                    id={item.id} 
                    checked={item.checked} 
                    onCheckedChange={() => toggleChecklistItem(item.id)}
                    className="mt-1"
                  />
                  <label htmlFor={item.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {item.text}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateDocumentStatus}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 