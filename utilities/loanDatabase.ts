// utilities/loanDatabase.ts
import { LoanData, generateLoan, generateLoans } from './loanGenerator';
import { documentService } from './documentService';

const STORAGE_KEY = 'simulated_loans_db';
const DEFAULT_LOAN_COUNT = 9;

export const loanDatabase = {
  generateLoan,
  // Initialize the database with some sample loans
  initialize: () => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      const initialLoans = generateLoans(DEFAULT_LOAN_COUNT);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialLoans));
      
      // Generate documents for each loan
      initialLoans.forEach(loan => {
        documentService.generateDocumentsForLoan(loan);
      });
      
      console.log(`Initialized loan database with ${DEFAULT_LOAN_COUNT} loans and their documents`);
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
  addLoan: (loanData: Partial<LoanData>): LoanData => {
    const newLoan = generateLoan(loanData);
    const loans = loanDatabase.getLoans();
    loans.push(newLoan);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loans));

    // Generate documents for the new loan
    documentService.generateDocumentsForLoan(newLoan);

    return newLoan;
  },
  
  // Update an existing loan
  updateLoan: (id: string, updates: Partial<LoanData>): LoanData | null => {
    const loans = loanDatabase.getLoans();
    const index = loans.findIndex(loan => loan.id === id);
    
    if (index === -1) return null;
    
    loans[index] = { 
      ...loans[index], 
      ...updates, 
      dateModified: new Date().toISOString() 
    };
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
    // Clear all existing documents first
    if (typeof localStorage !== 'undefined') {
      // Clear document database using the documentService
      documentService.clearAllDocuments();
      
      // Also clear simplified document service if it exists in the global scope
      try {
        const simplifiedDocService = require('./simplifiedDocumentService').simpleDocumentService;
        if (simplifiedDocService && typeof simplifiedDocService.clearAllDocuments === 'function') {
          simplifiedDocService.clearAllDocuments();
        }
      } catch (error) {
        console.warn('Could not clear simplified document service:', error);
      }
      
      // Clear document database
      try {
        const docDatabase = require('./documentDatabase').default;
        if (docDatabase && typeof docDatabase.clearAllData === 'function') {
          docDatabase.clearAllData();
        }
      } catch (error) {
        console.warn('Could not clear document database:', error);
      }
    }
    
    const initialLoans = generateLoans(count);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialLoans));
    
    // Generate documents for each loan
    initialLoans.forEach(loan => {
      documentService.generateDocumentsForLoan(loan);
    });
    
    return initialLoans;
  }
};