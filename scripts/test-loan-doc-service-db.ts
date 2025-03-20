// Convert to CommonJS imports
const { loanDocumentService } = require('../utilities/loanDocumentService');
const { databaseService } = require('../services/databaseService');
const { documentDatabaseService } = require('../services/documentDatabaseService');
const { v4: uuidv4 } = require('uuid');
// Import type from the LoanDocument interface but use it only for TypeScript typings
// @ts-ignore
const { LoanDocument } = require('../utilities/loanDocumentStructure');

// Test constants
const TEST_LOAN_ID = `test-loan-${Math.floor(Math.random() * 100)}`;
const TEST_DOC_TYPE = 'loan_application';

// Create a sample document
function createSampleDocument() {
  return {
    id: uuidv4(),
    loanId: TEST_LOAN_ID,
    filename: `SAMPLE_document-${Math.floor(Math.random() * 10000)}.html`,
    docType: TEST_DOC_TYPE,
    status: 'pending',
    dateUploaded: new Date().toISOString(),
    isRequired: true,
    version: 1,
    category: 'borrower',
    section: 'personal_information',
    subsection: '',  // Adding the required subsection property
    fileType: 'html',
    fileSize: 1024,
    content: `<html><body><h1>Sample Document</h1><p>This is a test document for loan ${TEST_LOAN_ID}</p></body></html>`
  };
}

// Test the loanDocumentService with database integration
async function testLoanDocumentServiceWithDB() {
  console.log('=======================================================');
  console.log('TESTING LOAN DOCUMENT SERVICE WITH DATABASE INTEGRATION');
  console.log('=======================================================');
  
  try {
    // Step 1: Initialize the database
    console.log('\n1. Initializing database...');
    await databaseService.initialize();
    console.log('Database initialized successfully.');
    
    // Step 2: Add a document using the loan document service
    console.log('\n2. Adding a document using loanDocumentService...');
    const sampleDoc = createSampleDocument();
    const addedDoc = loanDocumentService.addDocument(sampleDoc);
    console.log(`Document added with ID: ${addedDoc.id}`);
    
    // Step 3: Retrieve the document by ID
    console.log('\n3. Retrieving document by ID...');
    const retrievedDoc = loanDocumentService.getDocumentById(addedDoc.id, true);
    if (retrievedDoc) {
      console.log(`Retrieved document: ${retrievedDoc.id}`);
      console.log(`Filename: ${retrievedDoc.filename}`);
      console.log(`DocType: ${retrievedDoc.docType}`);
      console.log(`Content exists: ${!!retrievedDoc.content}`);
    } else {
      console.error('Failed to retrieve document!');
    }
    
    // Step 4: Get documents for loan
    console.log('\n4. Getting documents for loan...');
    const loanDocs = loanDocumentService.getDocumentsForLoan(TEST_LOAN_ID);
    console.log(`Found ${loanDocs.length} documents for loan ${TEST_LOAN_ID}`);
    loanDocs.forEach(doc => {
      console.log(`- ${doc.id}: ${doc.filename} (${doc.docType})`);
    });
    
    // Step 5: Update a document
    console.log('\n5. Updating document status...');
    const updatedDoc = await loanDocumentService.updateDocumentStatus(addedDoc.id, 'approved');
    if (updatedDoc) {
      console.log(`Updated document status: ${updatedDoc.status}`);
    } else {
      console.error('Failed to update document!');
    }
    
    // Step 6: Verify the update
    console.log('\n6. Verifying document update...');
    const verifyDoc = loanDocumentService.getDocumentById(addedDoc.id);
    if (verifyDoc) {
      console.log(`Verified document status: ${verifyDoc.status}`);
    } else {
      console.error('Failed to verify document update!');
    }
    
    // Step 7: Delete the document
    console.log('\n7. Deleting document...');
    const deleteResult = loanDocumentService.deleteDocument(addedDoc.id);
    console.log(`Document deletion ${deleteResult ? 'succeeded' : 'failed'}`);
    
    // Step 8: Verify the deletion
    console.log('\n8. Verifying document deletion...');
    const deletedDoc = loanDocumentService.getDocumentById(addedDoc.id);
    console.log(`Document exists after deletion: ${!!deletedDoc}`);
    
    // Step 9: Check documents for loan again
    console.log('\n9. Getting documents for loan after deletion...');
    const finalLoanDocs = loanDocumentService.getDocumentsForLoan(TEST_LOAN_ID);
    console.log(`Found ${finalLoanDocs.length} documents for loan ${TEST_LOAN_ID}`);
    
    console.log('\n10. Closing database connection...');
    databaseService.close();
    console.log('Database connection closed.');
    
    console.log('\nTEST COMPLETED SUCCESSFULLY!');
  } catch (error) {
    console.error('Error during test:', error);
  }
}

// Run the test
testLoanDocumentServiceWithDB(); 