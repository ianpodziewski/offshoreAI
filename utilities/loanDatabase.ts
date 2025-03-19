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
  reset: async (count = DEFAULT_LOAN_COUNT) => {
    console.log('Resetting database and clearing all documents...');
    
    // Clear all existing documents first
    if (typeof localStorage !== 'undefined') {
      const clearPromises = [];
      
      // Clear document database using the documentService
      try {
        documentService.clearAllDocuments();
        console.log('Cleared document service storage');
      } catch (error) {
        console.warn('Error clearing document service:', error);
      }
      
      // Clear simplified document service
      try {
        const simplifiedDocService = require('./simplifiedDocumentService').simpleDocumentService;
        if (simplifiedDocService && typeof simplifiedDocService.clearAllDocuments === 'function') {
          const clearPromise = simplifiedDocService.clearAllDocuments()
            .then(() => {
              console.log('Successfully cleared simplified document service including IndexedDB');
              // Remove the migration flag to force a clean migration on next load
              localStorage.removeItem('indexeddb_migration_done');
            })
            .catch(error => {
              console.warn('Error during simplified document service clearing:', error);
            });
          
          clearPromises.push(clearPromise);
        }
      } catch (error) {
        console.warn('Could not clear simplified document service:', error);
      }
      
      // Clear document database
      try {
        const docDatabase = require('./documentDatabase').default;
        if (docDatabase && typeof docDatabase.clearAllData === 'function') {
          docDatabase.clearAllData();
          console.log('Cleared document database');
        }
      } catch (error) {
        console.warn('Could not clear document database:', error);
      }
      
      // Ensure all document-related localStorage keys are removed
      try {
        localStorage.removeItem('loan_documents');
        localStorage.removeItem('simple_documents');
        localStorage.removeItem('extracted_document_data');
        localStorage.removeItem('indexeddb_migration_done');
        console.log('Removed all document-related localStorage keys');
      } catch (error) {
        console.warn('Error clearing localStorage keys:', error);
      }
      
      // Wait for all clearance operations to complete
      if (clearPromises.length > 0) {
        try {
          await Promise.all(clearPromises);
          console.log('All document clearing operations completed');
        } catch (error) {
          console.warn('Error waiting for document clearing operations:', error);
        }
      }
    }
    
    // Generate fresh loans
    const initialLoans = generateLoans(count);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialLoans));
    console.log(`Generated ${count} new loans`);
    
    // Generate documents for each loan
    initialLoans.forEach(loan => {
      documentService.generateDocumentsForLoan(loan);
    });
    
    console.log('Database reset complete');
    return initialLoans;
  }
};