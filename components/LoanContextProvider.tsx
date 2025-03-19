import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loanDatabase } from '@/utilities/loanDatabase';
import { LoanData } from '@/utilities/loanGenerator';
import { simpleDocumentService } from '@/utilities/simplifiedDocumentService';

interface LoanContextType {
  activeLoan: LoanData | null;
  setActiveLoan: (loan: LoanData | null) => void;
  loanDocuments: any[];
  refreshLoanDocuments: () => void;
}

const LoanContext = createContext<LoanContextType>({
  activeLoan: null,
  setActiveLoan: () => {},
  loanDocuments: [],
  refreshLoanDocuments: () => {}
});

export const useLoanContext = () => useContext(LoanContext);

export const LoanContextProvider: React.FC<{
  children: React.ReactNode;
  initialLoanId?: string;
}> = ({ children, initialLoanId }) => {
  const [activeLoan, setActiveLoan] = useState<LoanData | null>(null);
  const [loanDocuments, setLoanDocuments] = useState<any[]>([]);

  // Function to refresh loan documents
  const refreshLoanDocuments = useCallback(() => {
    if (activeLoan) {
      console.log(`Refreshing documents for loan: ${activeLoan.id}`);
      // First get from localStorage with metadata only
      const docs = simpleDocumentService.getDocumentsForLoan(activeLoan.id);
      console.log(`Found ${docs.length} documents for loan ${activeLoan.id}`);
      setLoanDocuments(docs || []);
      
      // Then ensure IndexedDB is properly initialized
      // This adds a safety check to ensure that IndexedDB and localStorage are in sync
      setTimeout(async () => {
        try {
          // This will ensure the IndexedDB migration is done if needed
          if (!localStorage.getItem('indexeddb_migration_done')) {
            await simpleDocumentService.migrateToIndexedDB();
            localStorage.setItem('indexeddb_migration_done', 'true');
          }
          
          // Refresh documents again after migration
          const updatedDocs = simpleDocumentService.getDocumentsForLoan(activeLoan.id);
          if (updatedDocs.length !== docs.length) {
            setLoanDocuments(updatedDocs || []);
          }
        } catch (error) {
          console.error('Error during refreshLoanDocuments IndexedDB check:', error);
        }
      }, 500); // Short delay to let any ongoing operations complete
    }
  }, [activeLoan]);
  
  // Initial load of documents
  useEffect(() => {
    if (initialLoanId) {
      console.log(`Initializing loan context with loan ID: ${initialLoanId}`);
      const loan = loanDatabase.getLoanById(initialLoanId);
      if (loan) {
        setActiveLoan(loan);
        // Fetch documents related to this loan
        const docs = simpleDocumentService.getDocumentsForLoan(initialLoanId);
        console.log(`Found ${docs.length} documents for loan ${initialLoanId}`);
        setLoanDocuments(docs || []);
      }
    }
  }, [initialLoanId]);
  
  // Set up a periodic refresh to ensure documents stay up to date
  useEffect(() => {
    // Only set up interval if we have an active loan
    if (!activeLoan) return;
    
    const intervalId = setInterval(() => {
      const updatedDocs = simpleDocumentService.getDocumentsForLoan(activeLoan.id);
      if (updatedDocs.length !== loanDocuments.length) {
        console.log(`Document count changed from ${loanDocuments.length} to ${updatedDocs.length}`);
        setLoanDocuments(updatedDocs);
      }
    }, 10000); // Check every 10 seconds
    
    return () => clearInterval(intervalId);
  }, [activeLoan, loanDocuments.length]);

  return (
    <LoanContext.Provider value={{ activeLoan, setActiveLoan, loanDocuments, refreshLoanDocuments }}>
      {children}
    </LoanContext.Provider>
  );
};

export default LoanContextProvider; 