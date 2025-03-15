import React, { createContext, useContext, useState, useEffect } from 'react';
import { loanDatabase } from '@/utilities/loanDatabase';
import { LoanData } from '@/utilities/loanGenerator';
import { simpleDocumentService } from '@/utilities/simplifiedDocumentService';

interface LoanContextType {
  activeLoan: LoanData | null;
  setActiveLoan: (loan: LoanData | null) => void;
  loanDocuments: any[];
}

const LoanContext = createContext<LoanContextType>({
  activeLoan: null,
  setActiveLoan: () => {},
  loanDocuments: []
});

export const useLoanContext = () => useContext(LoanContext);

export const LoanContextProvider: React.FC<{
  children: React.ReactNode;
  initialLoanId?: string;
}> = ({ children, initialLoanId }) => {
  const [activeLoan, setActiveLoan] = useState<LoanData | null>(null);
  const [loanDocuments, setLoanDocuments] = useState<any[]>([]);

  useEffect(() => {
    if (initialLoanId) {
      const loan = loanDatabase.getLoanById(initialLoanId);
      if (loan) {
        setActiveLoan(loan);
        // Fetch documents related to this loan
        const docs = simpleDocumentService.getDocumentsForLoan(initialLoanId);
        setLoanDocuments(docs || []);
      }
    }
  }, [initialLoanId]);

  return (
    <LoanContext.Provider value={{ activeLoan, setActiveLoan, loanDocuments }}>
      {children}
    </LoanContext.Provider>
  );
};

export default LoanContextProvider; 