'use client';

import { SimpleDocument } from '@/utilities/simplifiedDocumentService';

// Constants for localStorage keys
const DOCUMENT_STORAGE_KEY = 'simple_documents';
const USER_STORAGE_KEY = 'user_data';
const LOAN_STORAGE_KEY = 'loan_data';

// Helper function to safely get items from localStorage
const safeGetItem = (key: string): any => {
  try {
    if (typeof window === 'undefined') return null;
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error getting item from localStorage (${key}):`, error);
    return null;
  }
};

// Helper function to safely set items in localStorage
const safeSetItem = (key: string, value: any): boolean => {
  try {
    if (typeof window === 'undefined') return false;
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error setting item in localStorage (${key}):`, error);
    return false;
  }
};

// Client-side storage service that uses localStorage
const clientStorageService = {
  // Document operations
  saveDocument: (document: SimpleDocument): boolean => {
    try {
      const allDocs = clientStorageService.getAllDocuments().documents;
      const index = allDocs.findIndex(doc => doc.id === document.id);
      
      if (index !== -1) {
        allDocs[index] = document;
      } else {
        allDocs.push(document);
      }
      
      return safeSetItem(DOCUMENT_STORAGE_KEY, allDocs);
    } catch (error) {
      console.error(`Error saving document to localStorage:`, error);
      return false;
    }
  },
  
  getDocument: (id: string): SimpleDocument | null => {
    try {
      const allDocs = clientStorageService.getAllDocuments().documents;
      return allDocs.find(doc => doc.id === id) || null;
    } catch (error) {
      console.error(`Error getting document from localStorage:`, error);
      return null;
    }
  },
  
  deleteDocument: (id: string): boolean => {
    try {
      const allDocs = clientStorageService.getAllDocuments().documents;
      const filteredDocs = allDocs.filter(doc => doc.id !== id);
      
      if (filteredDocs.length === allDocs.length) {
        // Document wasn't found
        return false;
      }
      
      return safeSetItem(DOCUMENT_STORAGE_KEY, filteredDocs);
    } catch (error) {
      console.error(`Error deleting document from localStorage:`, error);
      return false;
    }
  },
  
  getDocumentsForLoan: (loanId: string): SimpleDocument[] => {
    try {
      const allDocs = clientStorageService.getAllDocuments().documents;
      return allDocs.filter(doc => doc.loanId === loanId);
    } catch (error) {
      console.error(`Error getting loan documents from localStorage:`, error);
      return [];
    }
  },
  
  getAllDocuments: (page = 0, pageSize = 50): { documents: SimpleDocument[], totalCount: number } => {
    try {
      const docsJson = typeof window !== 'undefined' ? localStorage.getItem(DOCUMENT_STORAGE_KEY) : null;
      const allDocs = docsJson ? JSON.parse(docsJson) : [];
      
      if (!Array.isArray(allDocs)) {
        console.warn('Invalid document data structure in localStorage');
        return { documents: [], totalCount: 0 };
      }
      
      const totalCount = allDocs.length;
      
      // Apply pagination
      const start = page * pageSize;
      const end = Math.min(start + pageSize, totalCount);
      const pagedDocs = allDocs.slice(start, end);
      
      return { documents: pagedDocs, totalCount };
    } catch (error) {
      console.error(`Error getting all documents from localStorage:`, error);
      return { documents: [], totalCount: 0 };
    }
  },
  
  // User data operations
  saveUserData: (userId: string, data: any): boolean => {
    try {
      const userData = safeGetItem(USER_STORAGE_KEY) || {};
      userData[userId] = data;
      return safeSetItem(USER_STORAGE_KEY, userData);
    } catch (error) {
      console.error(`Error saving user data to localStorage:`, error);
      return false;
    }
  },
  
  getUserData: (userId: string): any => {
    try {
      const userData = safeGetItem(USER_STORAGE_KEY) || {};
      return userData[userId] || null;
    } catch (error) {
      console.error(`Error getting user data from localStorage:`, error);
      return null;
    }
  },
  
  // Loan data operations
  saveLoanData: (loanId: string, data: any): boolean => {
    try {
      const loanData = safeGetItem(LOAN_STORAGE_KEY) || {};
      loanData[loanId] = data;
      return safeSetItem(LOAN_STORAGE_KEY, loanData);
    } catch (error) {
      console.error(`Error saving loan data to localStorage:`, error);
      return false;
    }
  },
  
  getLoanData: (loanId: string): any => {
    try {
      const loanData = safeGetItem(LOAN_STORAGE_KEY) || {};
      return loanData[loanId] || null;
    } catch (error) {
      console.error(`Error getting loan data from localStorage:`, error);
      return null;
    }
  }
};

export default clientStorageService; 