// scripts/test-document-db.ts
import { v4 as uuidv4 } from 'uuid';
import { databaseService } from '../services/databaseService';
import { documentDatabaseService } from '../services/documentDatabaseService';
import { LoanDocument, DocumentStatus } from '../utilities/loanDocumentStructure';

// Create a sample document for testing
function createSampleDocument(): LoanDocument {
  return {
    id: uuidv4(),
    loanId: 'test-loan-' + Math.floor(Math.random() * 1000),
    filename: 'SAMPLE_test-document.html',
    docType: 'loan_application',
    category: 'borrower',
    section: 'personal_information',
    subsection: 'Personal Information',
    status: 'pending' as DocumentStatus,
    dateUploaded: new Date().toISOString(),
    fileType: '.html',
    fileSize: 1024,
    isRequired: true,
    version: 1,
    content: '<html><body><h1>Test Document</h1><p>This is a test document content.</p></body></html>',
    notes: 'Test document notes'
  };
}

// Test the document database service
async function testDocumentDatabaseService() {
  console.log('Testing document database service...');
  
  try {
    // Initialize the database
    await databaseService.initialize();
    console.log('Database initialized successfully');
    
    // Create sample documents
    const sampleDoc1 = createSampleDocument();
    const sampleDoc2 = createSampleDocument(); 
    const sampleDoc3 = createSampleDocument();
    sampleDoc3.loanId = sampleDoc2.loanId; // Same loan ID for testing retrieval
    
    // Test insert document
    console.log('\nInserting sample document 1...');
    const docId1 = documentDatabaseService.insertDocument(sampleDoc1);
    console.log(`Document inserted with ID: ${docId1}`);
    
    // Test bulk insert documents
    console.log('\nBulk inserting sample documents 2 and 3...');
    const count = documentDatabaseService.bulkInsertDocuments([sampleDoc2, sampleDoc3]);
    console.log(`${count} documents inserted`);
    
    // Test get document by ID
    console.log('\nRetrieving document by ID...');
    const retrievedDoc = documentDatabaseService.getDocumentById(docId1, true);
    console.log('Retrieved document:');
    console.log(`- ID: ${retrievedDoc?.id}`);
    console.log(`- Filename: ${retrievedDoc?.filename}`);
    console.log(`- Document Type: ${retrievedDoc?.docType}`);
    console.log(`- Has Content: ${!!retrievedDoc?.content}`);
    
    // Test get documents for loan
    console.log('\nRetrieving documents for loan...');
    const loanDocs = documentDatabaseService.getDocumentsForLoan(sampleDoc2.loanId, false);
    console.log(`Found ${loanDocs.length} documents for loan ${sampleDoc2.loanId}`);
    loanDocs.forEach((doc, index) => {
      console.log(`- Document ${index + 1}: ${doc.filename} (${doc.docType})`);
    });
    
    // Test count documents for loan
    console.log('\nCounting documents for loan...');
    const docCount = documentDatabaseService.countDocumentsForLoan(sampleDoc2.loanId);
    console.log(`Count: ${docCount} documents for loan ${sampleDoc2.loanId}`);
    
    // Test update document
    console.log('\nUpdating document...');
    const updateResult = documentDatabaseService.updateDocument({
      id: docId1,
      status: 'approved' as DocumentStatus,
      notes: 'Updated test document notes'
    });
    console.log(`Update result: ${updateResult}`);
    
    // Verify update
    console.log('\nVerifying document update...');
    const updatedDoc = documentDatabaseService.getDocumentById(docId1);
    console.log(`- Status: ${updatedDoc?.status}`);
    console.log(`- Notes: ${updatedDoc?.notes}`);
    
    // Test delete document
    console.log('\nDeleting document...');
    const deleteResult = documentDatabaseService.deleteDocument(sampleDoc3.id);
    console.log(`Delete result: ${deleteResult}`);
    
    // Verify deletion
    console.log('\nVerifying document deletion...');
    const deletedDoc = documentDatabaseService.getDocumentById(sampleDoc3.id);
    console.log(`Document exists: ${!!deletedDoc}`);
    
    // Count documents after deletion
    const docCountAfterDelete = documentDatabaseService.countDocumentsForLoan(sampleDoc2.loanId);
    console.log(`Count after deletion: ${docCountAfterDelete} documents for loan ${sampleDoc2.loanId}`);
    
    // Close the database connection
    databaseService.close();
    console.log('\nDatabase connection closed.');
    
    console.log('\nDocument database service test completed successfully!');
  } catch (error) {
    console.error('Document database service test failed:', error);
  }
}

// Run the test
testDocumentDatabaseService(); 