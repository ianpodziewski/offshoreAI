// Simple test script for document database service
const { databaseService } = require('../services/databaseService');
const { documentDatabaseService } = require('../services/documentDatabaseService');
const { v4: uuidv4 } = require('uuid');

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
    subsection: '',
    fileType: 'html',
    fileSize: 1024,
    content: `<html><body><h1>Sample Document</h1><p>This is a test document for loan ${TEST_LOAN_ID}</p></body></html>`
  };
}

// Test the document database service directly
async function testDocumentDatabaseService() {
  console.log('=======================================================');
  console.log('TESTING DOCUMENT DATABASE SERVICE DIRECTLY');
  console.log('=======================================================');
  
  try {
    // Step 1: Initialize the database
    console.log('\n1. Initializing database...');
    try {
      await databaseService.initialize();
      console.log('Database initialized successfully.');
    } catch (initError) {
      console.error('Database initialization error:', initError);
      return;
    }
    
    // Step 2: Insert a document
    console.log('\n2. Inserting a document...');
    const sampleDoc = createSampleDocument();
    try {
      const insertResult = documentDatabaseService.insertDocument(sampleDoc);
      console.log(`Document inserted with ID: ${sampleDoc.id}`);
    } catch (insertError) {
      console.error('Document insertion error:', insertError);
      return;
    }
    
    // Step 3: Retrieve the document by ID
    console.log('\n3. Retrieving document by ID...');
    try {
      const retrievedDoc = documentDatabaseService.getDocumentById(sampleDoc.id, true);
      if (retrievedDoc) {
        console.log(`Retrieved document: ${retrievedDoc.id}`);
        console.log(`Filename: ${retrievedDoc.filename}`);
        console.log(`DocType: ${retrievedDoc.docType}`);
        console.log(`Content exists: ${!!retrievedDoc.content}`);
      } else {
        console.error('Failed to retrieve document!');
      }
    } catch (retrieveError) {
      console.error('Document retrieval error:', retrieveError);
    }
    
    // Step 4: Insert more documents for the same loan
    console.log('\n4. Inserting more documents for the same loan...');
    const sampleDoc2 = createSampleDocument();
    const sampleDoc3 = createSampleDocument();
    documentDatabaseService.bulkInsertDocuments([sampleDoc2, sampleDoc3]);
    console.log(`Inserted 2 more documents with IDs: ${sampleDoc2.id}, ${sampleDoc3.id}`);
    
    // Step 5: Get documents for loan
    console.log('\n5. Getting documents for loan...');
    const loanDocs = documentDatabaseService.getDocumentsForLoan(TEST_LOAN_ID);
    console.log(`Found ${loanDocs.length} documents for loan ${TEST_LOAN_ID}`);
    loanDocs.forEach(doc => {
      console.log(`- ${doc.id}: ${doc.filename} (${doc.docType})`);
    });
    
    // Step 6: Count documents for loan
    console.log('\n6. Counting documents for loan...');
    const docCount = documentDatabaseService.countDocumentsForLoan(TEST_LOAN_ID);
    console.log(`Document count for loan ${TEST_LOAN_ID}: ${docCount}`);
    
    // Step 7: Update a document
    console.log('\n7. Updating document status...');
    const updateResult = documentDatabaseService.updateDocument(sampleDoc.id, { 
      status: 'approved',
      notes: 'Approved with conditions'
    });
    console.log(`Document update result: ${updateResult ? 'Success' : 'Failed'}`);
    
    // Step 8: Verify the update
    console.log('\n8. Verifying document update...');
    const updatedDoc = documentDatabaseService.getDocumentById(sampleDoc.id);
    if (updatedDoc) {
      console.log(`Updated document status: ${updatedDoc.status}`);
      console.log(`Updated document notes: ${updatedDoc.notes}`);
    } else {
      console.error('Failed to verify document update!');
    }
    
    // Step 9: Delete a document
    console.log('\n9. Deleting document...');
    const deleteResult = documentDatabaseService.deleteDocument(sampleDoc.id);
    console.log(`Document deletion result: ${deleteResult ? 'Success' : 'Failed'}`);
    
    // Step 10: Verify the deletion
    console.log('\n10. Verifying document deletion...');
    const deletedDoc = documentDatabaseService.getDocumentById(sampleDoc.id);
    console.log(`Document exists after deletion: ${!!deletedDoc}`);
    
    // Step 11: Count documents for loan again
    console.log('\n11. Counting documents for loan after deletion...');
    const finalDocCount = documentDatabaseService.countDocumentsForLoan(TEST_LOAN_ID);
    console.log(`Final document count for loan ${TEST_LOAN_ID}: ${finalDocCount}`);
    
    // Finally, close the database
    console.log('\nClosing database connection...');
    try {
      databaseService.close();
      console.log('Database connection closed.');
    } catch (closeError) {
      console.error('Error closing database:', closeError);
    }
    
    console.log('\nTEST COMPLETED!');
  } catch (error) {
    console.error('Error during test:', error);
  }
}

// Run the test
console.log('Starting test...');
testDocumentDatabaseService().then(() => {
  console.log('Test function completed.');
}).catch(error => {
  console.error('Unhandled error in test function:', error);
}); 