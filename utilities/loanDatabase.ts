// utilities/loanDatabase.ts
import { LoanData, generateLoans } from './loanGenerator';

const STORAGE_KEY = 'simulated_loans_db';
const DEFAULT_LOAN_COUNT = 10;

export const loanDatabase = {
  // Initialize the database with some sample loans
  initialize: () => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      const initialLoans = generateLoans(DEFAULT_LOAN_COUNT);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialLoans));
      console.log(`Initialized loan database with ${DEFAULT_LOAN_COUNT} loans`);
    }
  },
  
  // Get all loans
  getLoans: (): LoanData[] => {
    const loansJson = localStorage.getItem(STORAGE_KEY);
    return loansJson ? JSON.parse(loansJson) : [];
  },
  
  // Get a specific loan by ID
  getLoanById: (id: string): LoanData | null => {
    const loans = loanDatabase.getLoans();
    return loans.find(loan => loan.id === id) || null;
  },
  
  // Add a new loan
  addLoan: (loan: LoanData): LoanData => {
    const loans = loanDatabase.getLoans();
    loans.push(loan);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loans));
    return loan;
  },
  
  // Update an existing loan
  updateLoan: (id: string, updates: Partial<LoanData>): LoanData | null => {
    const loans = loanDatabase.getLoans();
    const index = loans.findIndex(loan => loan.id === id);
    
    if (index === -1) return null;
    
    loans[index] = { ...loans[index], ...updates, dateModified: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loans));
    return loans[index];
  },
  
  // Delete a loan
  deleteLoan: (id: string): boolean => {
    const loans = loanDatabase.getLoans();
    const filteredLoans = loans.filter(loan => loan.id !== id);
    
    if (filteredLoans.length === loans.length) return false;
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredLoans));
    return true;
  },
  
  // Reset the database (useful for testing)
  reset: (count = DEFAULT_LOAN_COUNT) => {
    const initialLoans = generateLoans(count);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialLoans));
    return initialLoans;
  }
};