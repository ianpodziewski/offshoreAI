import { useState, useEffect } from 'react';
import { LoanData } from '@/utilities/loanGenerator';
import { loanDatabase } from '@/utilities/loanDatabase';

export function useLoanData(loanId: string | null) {
  const [loan, setLoan] = useState<LoanData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLoanData() {
      if (!loanId) {
        setError('No loan ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const loanData = loanDatabase.getLoanById(loanId);
        
        if (!loanData) {
          setError(`Loan with ID ${loanId} not found`);
          setLoan(null);
        } else {
          setLoan(loanData);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching loan data:', err);
        setError('Failed to load loan data');
        setLoan(null);
      } finally {
        setLoading(false);
      }
    }

    fetchLoanData();
  }, [loanId]);

  return { loan, loading, error };
} 