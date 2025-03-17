import { v4 as uuidv4 } from 'uuid';
import { 
  LoanDocument, 
  DocumentStatus, 
  DocumentCategory,
  createDocument,
  getRequiredDocuments,
  getAllDocumentTypes,
  DOCUMENT_STRUCTURE
} from './loanDocumentStructure';
import { loanDatabase } from './loanDatabase';

// Constants for storage keys
const LOAN_DOCUMENTS_STORAGE_KEY = 'loan_documents';

// Document statuses for fake documents (excluding 'required' since we want to show uploaded docs)
const FAKE_DOCUMENT_STATUSES: DocumentStatus[] = ['pending', 'approved', 'received', 'reviewed'];

// Document file types
const FILE_TYPES = ['.pdf', '.docx', '.jpg', '.png'];

// Function to generate a random file size between 100KB and 10MB
const getRandomFileSize = (): number => {
  return Math.floor(Math.random() * 9900000) + 100000; // 100KB to 10MB
};

// Function to format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' bytes';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / 1048576).toFixed(1) + ' MB';
};

// Document service for managing loan documents
export const loanDocumentService = {
  // Get all documents
  getAllDocuments: (): LoanDocument[] => {
    try {
      const docsJson = localStorage.getItem(LOAN_DOCUMENTS_STORAGE_KEY);
      const docs = docsJson ? JSON.parse(docsJson) : [];
      
      // Validate data structure
      if (!Array.isArray(docs)) {
        console.warn("Invalid document data structure detected");
        return [];
      }
      
      return docs;
    } catch (error) {
      console.error('Error getting documents:', error);
      return [];
    }
  },
  
  // Get documents for a specific loan
  getDocumentsForLoan: (loanId: string): LoanDocument[] => {
    try {
      const allDocs = loanDocumentService.getAllDocuments();
      return allDocs.filter(doc => doc.loanId === loanId);
    } catch (error) {
      console.error('Error getting loan documents:', error);
      return [];
    }
  },
  
  // Get documents for a specific loan by category
  getDocumentsByCategory: (loanId: string, category: DocumentCategory): LoanDocument[] => {
    try {
      const loanDocs = loanDocumentService.getDocumentsForLoan(loanId);
      return loanDocs.filter(doc => doc.category === category);
    } catch (error) {
      console.error('Error getting documents by category:', error);
      return [];
    }
  },
  
  // Get documents for a specific loan by section
  getDocumentsBySection: (loanId: string, section: string): LoanDocument[] => {
    try {
      const loanDocs = loanDocumentService.getDocumentsForLoan(loanId);
      return loanDocs.filter(doc => doc.section === section);
    } catch (error) {
      console.error('Error getting documents by section:', error);
      return [];
    }
  },
  
  // Get document by ID
  getDocumentById: (docId: string): LoanDocument | null => {
    try {
      const allDocs = loanDocumentService.getAllDocuments();
      return allDocs.find(doc => doc.id === docId) || null;
    } catch (error) {
      console.error('Error getting document by ID:', error);
      return null;
    }
  },
  
  // Add a document
  addDocument: (document: Omit<LoanDocument, 'id'>): LoanDocument => {
    try {
      // Get existing documents from storage
      const existingDocs = loanDocumentService.getAllDocuments();
      
      // Create new document with ID
      const newDocument: LoanDocument = {
        ...document,
        id: uuidv4()
      };
      
      // Save the updated documents
      localStorage.setItem(LOAN_DOCUMENTS_STORAGE_KEY, JSON.stringify([...existingDocs, newDocument]));
      
      return newDocument;
    } catch (error) {
      console.error('Error adding document:', error);
      throw error;
    }
  },
  
  // Update a document
  updateDocument: (docId: string, updates: Partial<LoanDocument>): LoanDocument | null => {
    try {
      // Get existing documents from storage
      const existingDocs = loanDocumentService.getAllDocuments();
      
      // Find the document to update
      const docIndex = existingDocs.findIndex(doc => doc.id === docId);
      
      if (docIndex === -1) {
        console.warn(`Document with ID ${docId} not found`);
        return null;
      }
      
      // Create updated document
      const updatedDocument: LoanDocument = {
        ...existingDocs[docIndex],
        ...updates,
        // Increment version if it exists
        version: existingDocs[docIndex].version ? existingDocs[docIndex].version! + 1 : 1
      };
      
      // Update the document in the array
      existingDocs[docIndex] = updatedDocument;
      
      // Save the updated documents
      localStorage.setItem(LOAN_DOCUMENTS_STORAGE_KEY, JSON.stringify(existingDocs));
      
      return updatedDocument;
    } catch (error) {
      console.error('Error updating document:', error);
      return null;
    }
  },
  
  // Delete a document
  deleteDocument: (docId: string): boolean => {
    try {
      // Get existing documents from storage
      const existingDocs = loanDocumentService.getAllDocuments();
      
      // Filter out the document to delete
      const updatedDocs = existingDocs.filter(doc => doc.id !== docId);
      
      // Check if a document was removed
      if (updatedDocs.length === existingDocs.length) {
        console.warn(`Document with ID ${docId} not found`);
        return false;
      }
      
      // Save the updated documents
      localStorage.setItem(LOAN_DOCUMENTS_STORAGE_KEY, JSON.stringify(updatedDocs));
      
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      return false;
    }
  },
  
  // Update document status
  updateDocumentStatus: (docId: string, status: DocumentStatus): LoanDocument | null => {
    return loanDocumentService.updateDocument(docId, { status });
  },
  
  // Get missing required documents for a loan
  getMissingRequiredDocuments: (loanId: string, loanType: string): LoanDocument[] => {
    try {
      // Get all required document types for this loan type
      const requiredDocTypes = getRequiredDocuments(loanType);
      
      // Get existing documents for this loan
      const existingDocs = loanDocumentService.getDocumentsForLoan(loanId);
      
      // Get existing document types
      const existingDocTypes = existingDocs.map(doc => doc.docType);
      
      // Filter out document types that already exist
      const missingDocTypes = requiredDocTypes.filter(doc => !existingDocTypes.includes(doc.docType));
      
      // Create placeholder documents for each missing type
      return missingDocTypes.map(docType => ({
        id: uuidv4(),
        loanId,
        filename: `SAMPLE_${docType.label}.pdf`,
        dateUploaded: new Date().toISOString(),
        category: docType.category,
        section: docType.section,
        subsection: docType.subsection,
        docType: docType.docType,
        status: 'required' as DocumentStatus,
        isRequired: true,
        version: 1
      }));
    } catch (error) {
      console.error('Error getting missing required documents:', error);
      return [];
    }
  },
  
  // Initialize documents for a new loan
  initializeDocumentsForLoan: (loanId: string, loanType: string): LoanDocument[] => {
    try {
      // Get all required document types for this loan type
      const requiredDocTypes = getRequiredDocuments(loanType);
      
      // Create placeholder documents for each required type
      const placeholderDocs = requiredDocTypes.map(docType => ({
        id: uuidv4(),
        loanId,
        filename: `SAMPLE_${docType.label}.pdf`,
        dateUploaded: new Date().toISOString(),
        category: docType.category,
        section: docType.section,
        subsection: docType.subsection,
        docType: docType.docType,
        status: 'required' as DocumentStatus,
        isRequired: true,
        version: 1
      }));
      
      // Get existing documents from storage
      const existingDocs = loanDocumentService.getAllDocuments();
      
      // Save the combined documents
      localStorage.setItem(LOAN_DOCUMENTS_STORAGE_KEY, JSON.stringify([...existingDocs, ...placeholderDocs]));
      
      return placeholderDocs;
    } catch (error) {
      console.error('Error initializing documents for loan:', error);
      return [];
    }
  },
  
  // Get document completion status for a loan
  getDocumentCompletionStatus: (loanId: string, loanType: string): {
    total: number;
    completed: number;
    percentage: number;
    byCategory: Record<DocumentCategory, { total: number; completed: number; percentage: number }>;
  } => {
    try {
      // Get all required document types for this loan type
      const requiredDocTypes = getRequiredDocuments(loanType);
      
      // Get existing documents for this loan
      const existingDocs = loanDocumentService.getDocumentsForLoan(loanId);
      
      // Count total required documents
      const total = requiredDocTypes.length;
      
      // Count completed documents (status is not 'required')
      const completed = existingDocs.filter(doc => 
        requiredDocTypes.some(rt => rt.docType === doc.docType) && 
        doc.status !== 'required'
      ).length;
      
      // Calculate completion percentage
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      // Calculate completion by category
      const byCategory: Record<DocumentCategory, { total: number; completed: number; percentage: number }> = {} as any;
      
      // Initialize categories
      const categories: DocumentCategory[] = ['borrower', 'property', 'closing', 'servicing', 'misc'];
      categories.forEach(category => {
        const categoryRequiredDocs = requiredDocTypes.filter(doc => doc.category === category);
        const categoryTotal = categoryRequiredDocs.length;
        const categoryCompleted = existingDocs.filter(doc => 
          categoryRequiredDocs.some(rt => rt.docType === doc.docType) && 
          doc.status !== 'required'
        ).length;
        const categoryPercentage = categoryTotal > 0 ? Math.round((categoryCompleted / categoryTotal) * 100) : 0;
        
        byCategory[category] = {
          total: categoryTotal,
          completed: categoryCompleted,
          percentage: categoryPercentage
        };
      });
      
      return {
        total,
        completed,
        percentage,
        byCategory
      };
    } catch (error) {
      console.error('Error getting document completion status:', error);
      return {
        total: 0,
        completed: 0,
        percentage: 0,
        byCategory: {
          borrower: { total: 0, completed: 0, percentage: 0 },
          property: { total: 0, completed: 0, percentage: 0 },
          closing: { total: 0, completed: 0, percentage: 0 },
          servicing: { total: 0, completed: 0, percentage: 0 },
          misc: { total: 0, completed: 0, percentage: 0 }
        }
      };
    }
  },
  
  // Generate fake documents for a loan
  generateFakeDocuments: (loanId: string, loanType: string): LoanDocument[] => {
    try {
      // Get all required document types for this loan type
      const requiredDocTypes = getRequiredDocuments(loanType);
      
      // Get existing documents for this loan
      const existingDocs = loanDocumentService.getDocumentsForLoan(loanId);
      
      // Create fake documents for each required type
      const fakeDocuments: LoanDocument[] = [];
      
      // Fetch loan data
      const loanData = loanDatabase.getLoanById(loanId);
      if (!loanData) {
        console.error(`Loan data not found for loanId: ${loanId}`);
        return [];
      }
      
      // Generate a random date within the last 30 days
      const getRandomDate = (): string => {
        const now = new Date();
        const daysAgo = Math.floor(Math.random() * 30);
        const randomDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        return randomDate.toISOString();
      };
      
      // Generate a random status with bias towards 'approved' and 'received'
      const getRandomStatus = (): DocumentStatus => {
        const rand = Math.random();
        if (rand < 0.4) return 'approved';
        if (rand < 0.7) return 'received';
        if (rand < 0.85) return 'reviewed';
        return 'pending';
      };
      
      // Generate a random file type
      const getRandomFileType = (): string => {
        return FILE_TYPES[Math.floor(Math.random() * FILE_TYPES.length)];
      };
      
      // Function to generate content for different document types
      const generateDocumentContent = (docType: string): string => {
        const formattedDate = new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        
        const formatCurrency = (amount: number): string => {
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
          }).format(amount);
        };
        
        // Base document styling
        const baseStyle = `
          <style>
            .document {
              font-family: Arial, sans-serif;
              color: #333;
              line-height: 1.5;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .document-header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #eee;
              padding-bottom: 20px;
            }
            .document-title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
              color: #1a2234;
            }
            .document-subtitle {
              font-size: 16px;
              color: #666;
            }
            .document-section {
              margin-bottom: 20px;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 10px;
              color: #1a2234;
            }
            .info-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            .info-table th, .info-table td {
              padding: 8px 12px;
              text-align: left;
              border-bottom: 1px solid #eee;
            }
            .info-table th {
              background-color: #f8f9fa;
              font-weight: bold;
            }
            .signature-section {
              margin-top: 40px;
              border-top: 1px solid #eee;
              padding-top: 20px;
            }
            .signature-line {
              border-bottom: 1px solid #999;
              width: 250px;
              display: inline-block;
              margin-top: 30px;
            }
          </style>
        `;
        
        // Generate content based on document type
        switch(docType) {
          case 'loan_application':
            return `${baseStyle}
              <div class="document">
                <div class="document-header">
                  <div class="document-title">LOAN APPLICATION</div>
                  <div class="document-subtitle">Application Date: ${formattedDate}</div>
                </div>
                
                <div class="document-section">
                  <div class="section-title">Borrower Information</div>
                  <table class="info-table">
                    <tr>
                      <th>Borrower Name:</th>
                      <td>${loanData.borrowerName}</td>
                    </tr>
                    <tr>
                      <th>Email:</th>
                      <td>${loanData.borrowerName.replace(' ', '.').toLowerCase()}@example.com</td>
                    </tr>
                    <tr>
                      <th>Phone:</th>
                      <td>(555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}</td>
                    </tr>
                  </table>
                </div>
                
                <div class="document-section">
                  <div class="section-title">Loan Details</div>
                  <table class="info-table">
                    <tr>
                      <th>Loan Type:</th>
                      <td>${loanData.loanType.replace(/_/g, ' ').toUpperCase()}</td>
                    </tr>
                    <tr>
                      <th>Loan Amount:</th>
                      <td>${formatCurrency(loanData.loanAmount)}</td>
                    </tr>
                    <tr>
                      <th>Interest Rate:</th>
                      <td>${loanData.interestRate}%</td>
                    </tr>
                    <tr>
                      <th>Loan Term:</th>
                      <td>${loanData.loanTerm / 12} years</td>
                    </tr>
                  </table>
                </div>
                
                <div class="document-section">
                  <div class="section-title">Property Information</div>
                  <table class="info-table">
                    <tr>
                      <th>Property Address:</th>
                      <td>${loanData.propertyAddress}</td>
                    </tr>
                    <tr>
                      <th>Property Type:</th>
                      <td>${loanData.propertyType.replace(/_/g, ' ')}</td>
                    </tr>
                    <tr>
                      <th>Property Value:</th>
                      <td>${formatCurrency(loanData.purchasePrice)}</td>
                    </tr>
                  </table>
                </div>
                
                <div class="signature-section">
                  <p>By signing below, I/we certify that the information provided in this application is true and correct.</p>
                  <div class="signature-line"></div>
                  <div>${loanData.borrowerName}</div>
                </div>
              </div>
            `;
            
          case 'photo_id':
            return `${baseStyle}
              <div class="document">
                <div class="document-header">
                  <div class="document-title">GOVERNMENT-ISSUED PHOTO ID</div>
                  <div class="document-subtitle">Driver's License</div>
                </div>
                
                <div class="document-section" style="border: 2px solid #ccc; padding: 15px; border-radius: 8px; background-color: #f8f9fa;">
                  <div style="display: flex; justify-content: space-between;">
                    <div>
                      <div style="text-transform: uppercase; font-weight: bold; margin-bottom: 5px;">STATE OF CALIFORNIA</div>
                      <div style="font-size: 18px; font-weight: bold; margin-bottom: 15px;">DRIVER LICENSE</div>
                    </div>
                    <div>
                      <div style="font-weight: bold;">CLASS C</div>
                      <div>EXPIRES: 01/15/2027</div>
                    </div>
                  </div>
                  
                  <div style="display: flex; margin-top: 10px;">
                    <div style="width: 100px; height: 120px; background-color: #ddd; margin-right: 20px; display: flex; align-items: center; justify-content: center;">
                      <div style="font-size: 10px; text-align: center;">[PHOTO]</div>
                    </div>
                    <div>
                      <table style="border-collapse: collapse; width: 100%;">
                        <tr>
                          <td style="font-weight: bold; padding: 3px 0;">DL#:</td>
                          <td>X12345678</td>
                        </tr>
                        <tr>
                          <td style="font-weight: bold; padding: 3px 0;">NAME:</td>
                          <td>${loanData.borrowerName.toUpperCase()}</td>
                        </tr>
                        <tr>
                          <td style="font-weight: bold; padding: 3px 0;">ADDRESS:</td>
                          <td>123 MAIN ST</td>
                        </tr>
                        <tr>
                          <td></td>
                          <td>ANYTOWN, CA 12345</td>
                        </tr>
                        <tr>
                          <td style="font-weight: bold; padding: 3px 0;">DOB:</td>
                          <td>01/15/1980</td>
                        </tr>
                        <tr>
                          <td style="font-weight: bold; padding: 3px 0;">ISSUED:</td>
                          <td>01/15/2022</td>
                        </tr>
                      </table>
                    </div>
                  </div>
                  
                  <div style="margin-top: 20px; font-size: 11px; border-top: 1px solid #ccc; padding-top: 10px;">
                    <strong>RESTRICTIONS:</strong> NONE
                  </div>
                </div>
                
                <div class="document-section" style="margin-top: 20px;">
                  <p><strong>Note:</strong> This is a placeholder for a government-issued ID. In a real loan application, this would be a scanned copy or photo of the borrower's actual ID document. For privacy and security reasons, this is represented as a sample template.</p>
                </div>
              </div>
            `;
            
          case 'credit_authorization':
            return `${baseStyle}
              <div class="document">
                <div class="document-header">
                  <div class="document-title">CREDIT AUTHORIZATION FORM</div>
                  <div class="document-subtitle">Date: ${formattedDate}</div>
                </div>
                
                <div class="document-section">
                  <p>I/We hereby authorize <strong>ATLAS LENDING</strong> and its designated agents and representatives to verify my/our credit background through one or more credit reporting agencies for the purpose of extending, updating, reviewing, or collecting credit.</p>
                  
                  <div class="section-title">Borrower Information</div>
                  <table class="info-table">
                    <tr>
                      <th>Full Legal Name:</th>
                      <td>${loanData.borrowerName}</td>
                    </tr>
                    <tr>
                      <th>Social Security Number:</th>
                      <td>XXX-XX-XXXX</td>
                    </tr>
                    <tr>
                      <th>Date of Birth:</th>
                      <td>XX/XX/XXXX</td>
                    </tr>
                    <tr>
                      <th>Current Address:</th>
                      <td>123 Main Street, Anytown, USA 12345</td>
                    </tr>
                    <tr>
                      <th>Previous Address:</th>
                      <td>(If less than 2 years at current address)</td>
                    </tr>
                  </table>
                </div>
                
                <div class="document-section">
                  <div class="section-title">Loan Information</div>
                  <table class="info-table">
                    <tr>
                      <th>Loan Type:</th>
                      <td>${loanData.loanType.replace(/_/g, ' ').toUpperCase()}</td>
                    </tr>
                    <tr>
                      <th>Loan Amount:</th>
                      <td>${formatCurrency(loanData.loanAmount)}</td>
                    </tr>
                    <tr>
                      <th>Property Address:</th>
                      <td>${loanData.propertyAddress}</td>
                    </tr>
                  </table>
                </div>
                
                <div class="document-section">
                  <p>This authorization is valid for 120 days from the date below. A copy of this authorization may be accepted as an original.</p>
                  <p>I/We understand that I/we have a right to dispute the accuracy of information obtained from the credit reporting agency. I/We may contact the credit reporting agency to verify the accuracy of the information and/or obtain a copy of my/our credit report.</p>
                </div>
                
                <div class="signature-section">
                  <div class="signature-line"></div>
                  <div>${loanData.borrowerName}, Borrower</div>
                  <div style="margin-top: 10px;">Date: ${formattedDate}</div>
                </div>
              </div>
            `;
            
          case 'promissory_note':
            return `${baseStyle}
              <div class="document">
                <div class="document-header">
                  <div class="document-title">PROMISSORY NOTE</div>
                  <div class="document-subtitle">Date: ${formattedDate}</div>
                </div>
                
                <div class="document-section">
                  <p>
                    FOR VALUE RECEIVED, the undersigned, <strong>${loanData.borrowerName}</strong> ("Borrower"), 
                    hereby promises to pay to the order of LENDER FINANCIAL, the principal sum of 
                    <strong>${formatCurrency(loanData.loanAmount)}</strong> with interest on the unpaid principal balance 
                    from the date of this Note, until paid, at an interest rate of <strong>${loanData.interestRate}%</strong> per annum.
                  </p>
                  
                  <p>
                    Property Address: ${loanData.propertyAddress}<br>
                    Loan Type: ${loanData.loanType.toUpperCase()}<br>
                    Loan Term: ${loanData.loanTerm / 12} years
                  </p>
                  
                  <p>
                    1. <strong>PAYMENT.</strong> Borrower shall make monthly payments of principal and interest in the amount of 
                    ${formatCurrency((loanData.loanAmount * (loanData.interestRate/100/12)) / (1 - Math.pow(1 + (loanData.interestRate/100/12), -loanData.loanTerm)))} 
                    beginning on the 1st day of the month following disbursement and continuing on the 1st day of each month thereafter 
                    until the earlier of (i) the date on which the entire principal balance and all accrued interest has been paid in full, or 
                    (ii) the Maturity Date.
                  </p>
                </div>
                
                <div class="signature-section">
                  <p>IN WITNESS WHEREOF, the undersigned has executed this Note as of the date first written above.</p>
                  <div class="signature-line"></div>
                  <div>${loanData.borrowerName}, Borrower</div>
                </div>
              </div>
            `;
            
          case 'deed_of_trust':
            return `${baseStyle}
              <div class="document">
                <div class="document-header">
                  <div class="document-title">DEED OF TRUST</div>
                  <div class="document-subtitle">Date: ${formattedDate}</div>
                </div>
                
                <div class="document-section">
                  <p>
                    THIS DEED OF TRUST is made this ${new Date().getDate()} day of 
                    ${new Date().toLocaleString('en-us', { month: 'long' })}, 
                    ${new Date().getFullYear()}, between 
                    <strong>${loanData.borrowerName}</strong> ("Borrower"), and LENDER FINANCIAL ("Lender").
                  </p>
                  
                  <p>
                    THE PROPERTY. Borrower irrevocably grants and conveys to Trustee, in trust, with power of sale, 
                    the following described property located in the County of ${loanData.propertyAddress.split(',')[1]?.trim().split(' ')[0] || 'County'}, 
                    State of ${loanData.propertyAddress.split(',')[2]?.trim().split(' ')[0] || 'State'}:
                  </p>
                  
                  <div class="property-description">
                    ${loanData.propertyAddress}<br>
                    Property Type: ${loanData.propertyType.replace('_', ' ')}
                  </div>
                  
                  <p>
                    Borrower warrants that Borrower is the legal owner of the estate hereby conveyed and has the right to grant and 
                    convey the Property. Borrower warrants and will defend generally the title to the Property against all claims and demands.
                  </p>
                </div>
                
                <div class="signature-section">
                  <p>IN WITNESS WHEREOF, Borrower has executed this Deed of Trust on the day and year first above written.</p>
                  <div class="signature-line"></div>
                  <div>${loanData.borrowerName}, Borrower</div>
                </div>
              </div>
            `;
            
          case 'closing_disclosure':
            return `${baseStyle}
              <div class="document">
                <div class="document-header">
                  <div class="document-title">CLOSING DISCLOSURE</div>
                  <div class="document-subtitle">Date: ${formattedDate}</div>
                </div>
                
                <div class="document-section">
                  <div class="section-title">Loan Information</div>
                  <table class="info-table">
                    <tr>
                      <th>Loan Term:</th>
                      <td>${loanData.loanTerm / 12} years</td>
                    </tr>
                    <tr>
                      <th>Loan Purpose:</th>
                      <td>${loanData.loanType.replace(/_/g, ' ')}</td>
                    </tr>
                    <tr>
                      <th>Loan Product:</th>
                      <td>${loanData.loanType.toUpperCase()}</td>
                    </tr>
                    <tr>
                      <th>Loan Type:</th>
                      <td>Fixed Rate</td>
                    </tr>
                  </table>
                </div>
                
                <div class="document-section">
                  <div class="section-title">Loan Terms</div>
                  <table class="info-table">
                    <tr>
                      <th>Loan Amount:</th>
                      <td>${formatCurrency(loanData.loanAmount)}</td>
                    </tr>
                    <tr>
                      <th>Interest Rate:</th>
                      <td>${loanData.interestRate}%</td>
                    </tr>
                    <tr>
                      <th>Monthly Principal & Interest:</th>
                      <td>${formatCurrency((loanData.loanAmount * (loanData.interestRate/100/12)) / (1 - Math.pow(1 + (loanData.interestRate/100/12), -loanData.loanTerm)))}</td>
                    </tr>
                    <tr>
                      <th>Prepayment Penalty:</th>
                      <td>None</td>
                    </tr>
                    <tr>
                      <th>Balloon Payment:</th>
                      <td>None</td>
                    </tr>
                  </table>
                </div>
                
                <div class="document-section">
                  <div class="section-title">Property Information</div>
                  <table class="info-table">
                    <tr>
                      <th>Property Address:</th>
                      <td>${loanData.propertyAddress}</td>
                    </tr>
                    <tr>
                      <th>Property Value:</th>
                      <td>${formatCurrency(loanData.purchasePrice)}</td>
                    </tr>
                  </table>
                </div>
              </div>
            `;
            
          case 'property_appraisal':
            const appraisalValue = Math.round(loanData.purchasePrice * 1.1);
            return `${baseStyle}
              <div class="document">
                <div class="document-header">
                  <div class="document-title">PROPERTY APPRAISAL REPORT</div>
                  <div class="document-subtitle">Appraisal Date: ${formattedDate}</div>
                </div>
                
                <div class="document-section">
                  <div class="section-title">Subject Property Information</div>
                  <table class="info-table">
                    <tr>
                      <th>Property Address:</th>
                      <td>${loanData.propertyAddress}</td>
                    </tr>
                    <tr>
                      <th>Property Type:</th>
                      <td>${loanData.propertyType.replace(/_/g, ' ')}</td>
                    </tr>
                    <tr>
                      <th>Legal Description:</th>
                      <td>Lot 7, Block 3, Smithville Addition, City of ${loanData.propertyAddress.split(',')[0]?.trim().split(' ').pop() || 'Anytown'}</td>
                    </tr>
                    <tr>
                      <th>Year Built:</th>
                      <td>${1950 + Math.floor(Math.random() * 70)}</td>
                    </tr>
                    <tr>
                      <th>Square Footage:</th>
                      <td>${1200 + Math.floor(Math.random() * 3000)} sq. ft.</td>
                    </tr>
                    <tr>
                      <th>Lot Size:</th>
                      <td>${Math.floor(Math.random() * 0.5 * 100) / 100 + 0.1} acres</td>
                    </tr>
                  </table>
                </div>
                
                <div class="document-section">
                  <div class="section-title">Appraisal Summary</div>
                  <table class="info-table">
                    <tr>
                      <th>Market Value "As Is":</th>
                      <td>${formatCurrency(loanData.purchasePrice)}</td>
                    </tr>
                    <tr>
                      <th>Market Value "After Repairs":</th>
                      <td>${formatCurrency(appraisalValue)}</td>
                    </tr>
                    <tr>
                      <th>Purchase Price:</th>
                      <td>${formatCurrency(loanData.purchasePrice)}</td>
                    </tr>
                    <tr>
                      <th>Loan-to-Value Ratio:</th>
                      <td>${Math.round((loanData.loanAmount / loanData.purchasePrice) * 100)}%</td>
                    </tr>
                    <tr>
                      <th>Loan-to-ARV Ratio:</th>
                      <td>${Math.round((loanData.loanAmount / appraisalValue) * 100)}%</td>
                    </tr>
                  </table>
                </div>
                
                <div class="document-section">
                  <div class="section-title">Comparable Sales Analysis</div>
                  <table class="info-table">
                    <tr>
                      <th>Comp #</th>
                      <th>Address</th>
                      <th>Sale Date</th>
                      <th>Sale Price</th>
                      <th>Sq. Ft.</th>
                      <th>Price/Sq. Ft.</th>
                    </tr>
                    <tr>
                      <td>1</td>
                      <td>123 Nearby St</td>
                      <td>${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</td>
                      <td>${formatCurrency(Math.round(loanData.purchasePrice * 0.95))}</td>
                      <td>2,100</td>
                      <td>${formatCurrency(Math.round((loanData.purchasePrice * 0.95) / 2100))}</td>
                    </tr>
                    <tr>
                      <td>2</td>
                      <td>456 Similar Ave</td>
                      <td>${new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toLocaleDateString()}</td>
                      <td>${formatCurrency(Math.round(loanData.purchasePrice * 1.02))}</td>
                      <td>2,250</td>
                      <td>${formatCurrency(Math.round((loanData.purchasePrice * 1.02) / 2250))}</td>
                    </tr>
                    <tr>
                      <td>3</td>
                      <td>789 Comparable Ln</td>
                      <td>${new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toLocaleDateString()}</td>
                      <td>${formatCurrency(Math.round(loanData.purchasePrice * 1.05))}</td>
                      <td>1,950</td>
                      <td>${formatCurrency(Math.round((loanData.purchasePrice * 1.05) / 1950))}</td>
                    </tr>
                  </table>
                </div>
                
                <div class="document-section">
                  <div class="section-title">Property Condition</div>
                  <table class="info-table">
                    <tr>
                      <th>Overall Condition:</th>
                      <td>Average</td>
                    </tr>
                    <tr>
                      <th>Estimated Repair Cost:</th>
                      <td>${formatCurrency(Math.round(loanData.purchasePrice * 0.1))}</td>
                    </tr>
                    <tr>
                      <th>Major Repairs Needed:</th>
                      <td>Kitchen renovation, bathroom updates, roof repair, HVAC replacement</td>
                    </tr>
                  </table>
                </div>
                
                <div class="document-section">
                  <div class="section-title">Appraiser's Comments</div>
                  <p>The subject property is located in a stable neighborhood with good market demand. Based on the analysis of comparable sales and current market conditions, the appraised value accurately reflects the property's market value. The property requires some repairs to maximize its value, but overall presents a good investment opportunity in this market.</p>
                </div>
                
                <div class="signature-section">
                  <p>This appraisal report is prepared for the sole purpose of providing an opinion of value for the subject property as of the effective date stated herein.</p>
                  <div class="signature-line"></div>
                  <div>John Appraiser, State Certified Appraiser</div>
                  <div>License #: AP12345678</div>
                  <div style="margin-top: 10px;">Date: ${formattedDate}</div>
                </div>
              </div>
            `;
            
          case 'financial_statement':
            return `${baseStyle}
              <div class="document">
                <div class="document-header">
                  <div class="document-title">PERSONAL FINANCIAL STATEMENT</div>
                  <div class="document-subtitle">As of: ${formattedDate}</div>
                </div>
                
                <div class="document-section">
                  <div class="section-title">Borrower Information</div>
                  <table class="info-table">
                    <tr>
                      <th>Name:</th>
                      <td>${loanData.borrowerName}</td>
                    </tr>
                    <tr>
                      <th>Address:</th>
                      <td>123 Main Street, Anytown, USA 12345</td>
                    </tr>
                    <tr>
                      <th>Phone:</th>
                      <td>(555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}</td>
                    </tr>
                    <tr>
                      <th>Email:</th>
                      <td>${loanData.borrowerName.replace(' ', '.').toLowerCase()}@example.com</td>
                    </tr>
                  </table>
                </div>
                
                <div class="document-section">
                  <div class="section-title">Assets</div>
                  <table class="info-table">
                    <tr>
                      <th>Cash and Cash Equivalents:</th>
                      <td>${formatCurrency(Math.round(loanData.loanAmount * 0.3))}</td>
                    </tr>
                    <tr>
                      <th>Investment Accounts:</th>
                      <td>${formatCurrency(Math.round(loanData.loanAmount * 0.5))}</td>
                    </tr>
                    <tr>
                      <th>Real Estate Owned (Market Value):</th>
                      <td>${formatCurrency(Math.round(loanData.loanAmount * 2.5))}</td>
                    </tr>
                    <tr>
                      <th>Retirement Accounts:</th>
                      <td>${formatCurrency(Math.round(loanData.loanAmount * 1.2))}</td>
                    </tr>
                    <tr>
                      <th>Vehicles:</th>
                      <td>${formatCurrency(85000)}</td>
                    </tr>
                    <tr>
                      <th>Other Assets:</th>
                      <td>${formatCurrency(Math.round(loanData.loanAmount * 0.2))}</td>
                    </tr>
                    <tr>
                      <th style="font-weight: bold;">TOTAL ASSETS:</th>
                      <td style="font-weight: bold;">${formatCurrency(Math.round(loanData.loanAmount * 4.7 + 85000))}</td>
                    </tr>
                  </table>
                </div>
                
                <div class="document-section">
                  <div class="section-title">Liabilities</div>
                  <table class="info-table">
                    <tr>
                      <th>Mortgage Loans:</th>
                      <td>${formatCurrency(Math.round(loanData.loanAmount * 1.5))}</td>
                    </tr>
                    <tr>
                      <th>Auto Loans:</th>
                      <td>${formatCurrency(45000)}</td>
                    </tr>
                    <tr>
                      <th>Credit Card Debt:</th>
                      <td>${formatCurrency(15000)}</td>
                    </tr>
                    <tr>
                      <th>Student Loans:</th>
                      <td>${formatCurrency(Math.round(loanData.loanAmount * 0.1))}</td>
                    </tr>
                    <tr>
                      <th>Other Liabilities:</th>
                      <td>${formatCurrency(Math.round(loanData.loanAmount * 0.05))}</td>
                    </tr>
                    <tr>
                      <th style="font-weight: bold;">TOTAL LIABILITIES:</th>
                      <td style="font-weight: bold;">${formatCurrency(Math.round(loanData.loanAmount * 1.65 + 60000))}</td>
                    </tr>
                  </table>
                </div>
                
                <div class="document-section">
                  <div class="section-title">Net Worth Summary</div>
                  <table class="info-table">
                    <tr>
                      <th>Total Assets:</th>
                      <td>${formatCurrency(Math.round(loanData.loanAmount * 4.7 + 85000))}</td>
                    </tr>
                    <tr>
                      <th>Total Liabilities:</th>
                      <td>${formatCurrency(Math.round(loanData.loanAmount * 1.65 + 60000))}</td>
                    </tr>
                    <tr>
                      <th style="font-weight: bold;">NET WORTH:</th>
                      <td style="font-weight: bold;">${formatCurrency(Math.round(loanData.loanAmount * 3.05 + 25000))}</td>
                    </tr>
                  </table>
                </div>
                
                <div class="document-section">
                  <div class="section-title">Annual Income</div>
                  <table class="info-table">
                    <tr>
                      <th>Salary/Wages:</th>
                      <td>${formatCurrency(Math.round(loanData.loanAmount * 0.8))}</td>
                    </tr>
                    <tr>
                      <th>Business Income:</th>
                      <td>${formatCurrency(Math.round(loanData.loanAmount * 0.6))}</td>
                    </tr>
                    <tr>
                      <th>Rental Income:</th>
                      <td>${formatCurrency(Math.round(loanData.loanAmount * 0.3))}</td>
                    </tr>
                    <tr>
                      <th>Investment Income:</th>
                      <td>${formatCurrency(Math.round(loanData.loanAmount * 0.15))}</td>
                    </tr>
                    <tr>
                      <th style="font-weight: bold;">TOTAL ANNUAL INCOME:</th>
                      <td style="font-weight: bold;">${formatCurrency(Math.round(loanData.loanAmount * 1.85))}</td>
                    </tr>
                  </table>
                </div>
                
                <div class="signature-section">
                  <p>I certify that the information provided in this statement is true and correct to the best of my knowledge.</p>
                  <div class="signature-line"></div>
                  <div>${loanData.borrowerName}, Borrower</div>
                  <div style="margin-top: 10px;">Date: ${formattedDate}</div>
                </div>
              </div>
            `;
            
          case 'contact_information':
            return `${baseStyle}
              <div class="document">
                <div class="document-header">
                  <div class="document-title">BORROWER CONTACT INFORMATION SHEET</div>
                  <div class="document-subtitle">Date: ${formattedDate}</div>
                </div>
                
                <div class="document-section">
                  <div class="section-title">Primary Borrower Information</div>
                  <table class="info-table">
                    <tr>
                      <th>Full Legal Name:</th>
                      <td>${loanData.borrowerName}</td>
                    </tr>
                    <tr>
                      <th>Date of Birth:</th>
                      <td>01/15/${1960 + Math.floor(Math.random() * 40)}</td>
                    </tr>
                    <tr>
                      <th>Social Security Number:</th>
                      <td>XXX-XX-XXXX</td>
                    </tr>
                    <tr>
                      <th>Home Phone:</th>
                      <td>(555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}</td>
                    </tr>
                    <tr>
                      <th>Cell Phone:</th>
                      <td>(555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}</td>
                    </tr>
                    <tr>
                      <th>Email Address:</th>
                      <td>${loanData.borrowerName.replace(' ', '.').toLowerCase()}@example.com</td>
                    </tr>
                  </table>
                </div>
                
                <div class="document-section">
                  <div class="section-title">Current Residence</div>
                  <table class="info-table">
                    <tr>
                      <th>Street Address:</th>
                      <td>123 Main Street</td>
                    </tr>
                    <tr>
                      <th>City, State, ZIP:</th>
                      <td>Anytown, CA 12345</td>
                    </tr>
                    <tr>
                      <th>Residence Type:</th>
                      <td>Own / Rent</td>
                    </tr>
                    <tr>
                      <th>Years at Address:</th>
                      <td>${Math.floor(Math.random() * 15) + 1}</td>
                    </tr>
                    <tr>
                      <th>Monthly Payment:</th>
                      <td>${formatCurrency(2500 + Math.floor(Math.random() * 3000))}</td>
                    </tr>
                  </table>
                </div>
                
                <div class="document-section">
                  <div class="section-title">Employment Information</div>
                  <table class="info-table">
                    <tr>
                      <th>Employer Name:</th>
                      <td>ABC Corporation</td>
                    </tr>
                    <tr>
                      <th>Position/Title:</th>
                      <td>Senior Manager</td>
                    </tr>
                    <tr>
                      <th>Business Phone:</th>
                      <td>(555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}</td>
                    </tr>
                    <tr>
                      <th>Years at Company:</th>
                      <td>${Math.floor(Math.random() * 15) + 3}</td>
                    </tr>
                    <tr>
                      <th>Business Address:</th>
                      <td>456 Corporate Blvd, Suite 300, Anytown, CA 12345</td>
                    </tr>
                  </table>
                </div>
                
                <div class="document-section">
                  <div class="section-title">Emergency Contact</div>
                  <table class="info-table">
                    <tr>
                      <th>Name:</th>
                      <td>Jane Smith</td>
                    </tr>
                    <tr>
                      <th>Relationship:</th>
                      <td>Spouse</td>
                    </tr>
                    <tr>
                      <th>Phone:</th>
                      <td>(555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}</td>
                    </tr>
                    <tr>
                      <th>Email:</th>
                      <td>jane.smith@example.com</td>
                    </tr>
                  </table>
                </div>
                
                <div class="document-section">
                  <div class="section-title">References</div>
                  <table class="info-table">
                    <tr>
                      <th>Professional Reference:</th>
                      <td>Robert Johnson, (555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}</td>
                    </tr>
                    <tr>
                      <th>Personal Reference:</th>
                      <td>Sarah Williams, (555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}</td>
                    </tr>
                  </table>
                </div>
                
                <div class="document-section">
                  <div class="section-title">Preferred Communication</div>
                  <table class="info-table">
                    <tr>
                      <th>Preferred Method:</th>
                      <td>Email</td>
                    </tr>
                    <tr>
                      <th>Best Time to Contact:</th>
                      <td>Weekdays, 9:00 AM - 5:00 PM</td>
                    </tr>
                  </table>
                </div>
                
                <div class="signature-section">
                  <p>I certify that the information provided above is true and correct to the best of my knowledge.</p>
                  <div class="signature-line"></div>
                  <div>${loanData.borrowerName}, Borrower</div>
                  <div style="margin-top: 10px;">Date: ${formattedDate}</div>
                </div>
              </div>
            `;
            
          default:
            // Generate a generic document for other types
            return `${baseStyle}
              <div class="document">
                <div class="document-header">
                  <div class="document-title">${docType.toUpperCase().replace(/_/g, ' ')}</div>
                  <div class="document-subtitle">Date: ${formattedDate}</div>
                </div>
                
                <div class="document-section">
                  <div class="section-title">Loan Details</div>
                  <table class="info-table">
                    <tr>
                      <th>Borrower:</th>
                      <td>${loanData.borrowerName}</td>
                    </tr>
                    <tr>
                      <th>Loan ID:</th>
                      <td>${loanId}</td>
                    </tr>
                    <tr>
                      <th>Loan Type:</th>
                      <td>${loanData.loanType.replace(/_/g, ' ').toUpperCase()}</td>
                    </tr>
                    <tr>
                      <th>Loan Amount:</th>
                      <td>${formatCurrency(loanData.loanAmount)}</td>
                    </tr>
                    <tr>
                      <th>Property Address:</th>
                      <td>${loanData.propertyAddress}</td>
                    </tr>
                  </table>
                </div>
                
                <div class="document-section">
                  <p>This document contains information related to the ${docType.replace(/_/g, ' ')} for the above-referenced loan.</p>
                  <p>The content of this document is specific to the loan conditions and property details as specified in the loan agreement.</p>
                </div>
              </div>
            `;
        }
      };
      
      // Process each required document type
      for (const docType of requiredDocTypes) {
        // Skip if document already exists
        if (existingDocs.some(doc => doc.docType === docType.docType)) {
          continue;
        }
        
        // Generate random properties
        const uploadDate = getRandomDate();
        const status = getRandomStatus();
        const fileType = ".html"; // Change to HTML for proper rendering
        const fileSize = getRandomFileSize();
        
        // Create a more realistic filename
        const sanitizedLabel = docType.label.toLowerCase().replace(/\s+/g, '_');
        const filename = `SAMPLE_${sanitizedLabel}${fileType}`;
        
        // Generate document-specific content
        const content = generateDocumentContent(docType.docType);
        
        // Create the fake document
        const fakeDocument: LoanDocument = {
          id: uuidv4(),
          loanId,
          filename,
          fileType,
          fileSize,
          dateUploaded: uploadDate,
          category: docType.category,
          section: docType.section,
          subsection: docType.subsection,
          docType: docType.docType,
          status,
          isRequired: true,
          version: 1,
          content, // Add the generated content
          notes: `This is a sample document for ${loanData.borrowerName} with loan amount ${loanData.loanAmount} for the property at ${loanData.propertyAddress}. Status: ${status === 'approved' ? 'Document verified and approved.' : 
                 status === 'rejected' ? 'Document rejected. Please resubmit.' : 
                 status === 'reviewed' ? 'Document reviewed, pending approval.' : 
                 'Document uploaded, awaiting review.'}`
        };
        
        // Add expiration date for certain document types
        if (['insurance_policy', 'appraisal_report', 'credit_report', 'background_check'].includes(docType.docType)) {
          const expirationDate = new Date();
          expirationDate.setFullYear(expirationDate.getFullYear() + 1);
          fakeDocument.expirationDate = expirationDate.toISOString();
        }
        
        fakeDocuments.push(fakeDocument);
      }
      
      // Save the fake documents
      if (fakeDocuments.length > 0) {
        const allDocs = loanDocumentService.getAllDocuments();
        localStorage.setItem(LOAN_DOCUMENTS_STORAGE_KEY, JSON.stringify([...allDocs, ...fakeDocuments]));
      }
      
      return fakeDocuments;
    } catch (error) {
      console.error('Error generating fake documents:', error);
      return [];
    }
  },
  
  // Generate fake documents for all loans
  generateFakeDocumentsForAllLoans: (): number => {
    try {
      // Get all loans from the database
      const loans = loanDatabase.getLoans();
      let totalDocumentsGenerated = 0;
      
      // Generate fake documents for each loan
      for (const loan of loans) {
        const fakeDocuments = loanDocumentService.generateFakeDocuments(loan.id, loan.loanType);
        totalDocumentsGenerated += fakeDocuments.length;
      }
      
      return totalDocumentsGenerated;
    } catch (error) {
      console.error('Error generating fake documents for all loans:', error);
      return 0;
    }
  },
  
  // Clear all documents (for testing and reset)
  clearAllDocuments: (): void => {
    localStorage.removeItem(LOAN_DOCUMENTS_STORAGE_KEY);
  }
}; 