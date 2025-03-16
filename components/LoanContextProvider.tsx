import React, { createContext, useContext, useState, useEffect } from 'react';
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
  const refreshLoanDocuments = () => {
    if (activeLoan) {
      console.log(`Refreshing documents for loan: ${activeLoan.id}`);
      // Fetch documents related to this loan
      const docs = simpleDocumentService.getDocumentsForLoan(activeLoan.id);
      console.log(`Found ${docs.length} documents for loan ${activeLoan.id}`);
      setLoanDocuments(docs || []);
    }
  };

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

  return (
    <LoanContext.Provider value={{ activeLoan, setActiveLoan, loanDocuments, refreshLoanDocuments }}>
      {children}
    </LoanContext.Provider>
  );
};

export default LoanContextProvider; 