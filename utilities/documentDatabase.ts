// utilities/documentDatabase.ts

// Define the structure for document data
export interface DocumentData {
  documentId: string;
  loanId: string;
  extractedData: Record<string, string | number>;
  extractionDate: string;
  confidence: Record<string, number>;
}

// Simple database using localStorage
export const documentDatabase = {
  // Storage key
  STORAGE_KEY: 'extracted_document_data',
  
  // Initialize the database
  initialize: () => {
    if (!localStorage.getItem(documentDatabase.STORAGE_KEY)) {
      localStorage.setItem(documentDatabase.STORAGE_KEY, JSON.stringify([]));
    }
  },
  
  // Get all document data
  getAllDocumentData: (): DocumentData[] => {
    const dataJson = localStorage.getItem(documentDatabase.STORAGE_KEY);
    return dataJson ? JSON.parse(dataJson) : [];
  },
  
  // Get data for a specific document
  getDocumentData: (documentId: string): DocumentData | null => {
    const allData = documentDatabase.getAllDocumentData();
    return allData.find(data => data.documentId === documentId) || null;
  },
  
  // Get all data for a specific loan
  getDataForLoan: (loanId: string): DocumentData[] => {
    const allData = documentDatabase.getAllDocumentData();
    return allData.filter(data => data.loanId === loanId);
  },
  
  // Save new document data
  saveDocumentData: (data: DocumentData): void => {
    const allData = documentDatabase.getAllDocumentData();
    const existingIndex = allData.findIndex(item => item.documentId === data.documentId);
    
    if (existingIndex >= 0) {
      // Update existing record
      allData[existingIndex] = data;
    } else {
      // Add new record
      allData.push(data);
    }
    
    localStorage.setItem(documentDatabase.STORAGE_KEY, JSON.stringify(allData));
  },
  
  // Delete document data
  deleteDocumentData: (documentId: string): boolean => {
    const allData = documentDatabase.getAllDocumentData();
    const filteredData = allData.filter(data => data.documentId !== documentId);
    
    if (filteredData.length === allData.length) return false;
    
    localStorage.setItem(documentDatabase.STORAGE_KEY, JSON.stringify(filteredData));
    return true;
  },
  
  // Get aggregated data for a loan
  getAggregatedLoanData: (loanId: string): Record<string, string | number> => {
    const loanData = documentDatabase.getDataForLoan(loanId);
    const aggregatedData: Record<string, string | number> = {};
    
    // Combine all extracted data, prioritizing higher confidence values
    loanData.forEach(docData => {
      Object.entries(docData.extractedData).forEach(([key, value]) => {
        // If we don't have this field yet, add it
        if (!(key in aggregatedData)) {
          aggregatedData[key] = value;
        } 
        // If we have a confidence score for this field and it's higher than what we have, replace it
        else if (
          docData.confidence && 
          key in docData.confidence && 
          docData.confidence[key] > 0.7
        ) {
          aggregatedData[key] = value;
        }
      });
    });
    
    return aggregatedData;
  },
  
  // Clear all data (for testing)
  clearAllData: (): void => {
    localStorage.removeItem(documentDatabase.STORAGE_KEY);
    documentDatabase.initialize();
  }
};

// Export a default object to make this a proper module
export default documentDatabase; 