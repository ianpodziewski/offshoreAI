/**
 * Redis Test Document Generator
 * 
 * This script creates test documents and saves them directly to Redis.
 * Use it to verify Redis document storage is working correctly.
 * 
 * Usage: node scripts/generate-test-docs.js DEMO-2025-1299
 */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const Redis = require('ioredis');
const { v4: uuidv4 } = require('uuid');

// Redis key prefixes that match the storageService.ts file
const DOCUMENT_PREFIX = 'doc:';
const DOCUMENT_BY_LOAN_PREFIX = 'docs_by_loan:';
const DOCUMENT_LIST_KEY = 'document_list';

// Check if Redis URL is configured
const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  console.error('❌ Error: REDIS_URL environment variable not found');
  console.error('Please run npm run fix-redis first');
  process.exit(1);
}

console.log(`🔌 Connecting to Redis: ${redisUrl.substring(0, 15)}...`);
const redis = new Redis(redisUrl);

// Utility function to generate simple HTML content
function generateSimpleHtml(title, loanId) {
  return `
    <html>
      <head><title>${title}</title></head>
      <body>
        <h1>${title}</h1>
        <p>This is a test document for loan ${loanId}</p>
        <p>Generated on ${new Date().toISOString()}</p>
        <ul>
          <li>Document Type: ${title}</li>
          <li>Loan ID: ${loanId}</li>
          <li>Status: Approved</li>
        </ul>
      </body>
    </html>
  `;
}

async function testRedisConnection() {
  try {
    const ping = await redis.ping();
    console.log(`🔌 Redis connection test: ${ping}`);
    return true;
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
    return false;
  }
}

async function createTestDocument(loanId, docType, category) {
  try {
    const docId = uuidv4();
    const filename = `${docType.replace(/_/g, '-')}.html`;
    const title = docType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    // Create document object
    const document = {
      id: docId,
      loanId: loanId,
      filename: filename,
      fileType: 'text/html',
      fileSize: 5000,
      dateUploaded: new Date().toISOString(),
      category: category,
      section: category,
      subsection: '',
      docType: docType,
      content: generateSimpleHtml(title, loanId),
      status: 'approved',
      version: 1,
      notes: `Test document for ${loanId}`
    };
    
    // Save document to Redis
    console.log(`📝 Saving document: ${filename} (ID: ${docId})`);
    
    // 1. Store document data
    await redis.set(`${DOCUMENT_PREFIX}${docId}`, JSON.stringify(document));
    
    // 2. Add document ID to the loan's document list
    await redis.sadd(`${DOCUMENT_BY_LOAN_PREFIX}${loanId}`, docId);
    
    // 3. Add document ID to global document list
    await redis.sadd(DOCUMENT_LIST_KEY, docId);
    
    console.log(`✅ Document saved: ${filename}`);
    return docId;
  } catch (error) {
    console.error(`❌ Failed to create document: ${error.message}`);
    return null;
  }
}

async function generateSampleDocuments(loanId) {
  console.log(`\n📋 Generating sample documents for loan ${loanId}`);
  console.log(`------------------------------------------------`);
  
  // Define sample document types by category
  const docTypes = {
    borrower: ['loan_application', 'income_verification', 'credit_report'],
    property: ['appraisal_report', 'property_photos', 'inspection_report'],
    closing: ['closing_disclosure', 'promissory_note', 'title_insurance'],
    servicing: ['payment_history', 'correspondence', 'insurance_verification']
  };
  
  // Track created document IDs
  const createdDocIds = [];
  
  // Create documents for each category
  for (const [category, types] of Object.entries(docTypes)) {
    console.log(`\n📂 Creating ${types.length} documents for category: ${category}`);
    
    for (const docType of types) {
      const docId = await createTestDocument(loanId, docType, category);
      if (docId) {
        createdDocIds.push(docId);
      }
    }
  }
  
  // Print document lists
  try {
    const docIds = await redis.smembers(`${DOCUMENT_BY_LOAN_PREFIX}${loanId}`);
    console.log(`\n✅ Successfully created ${createdDocIds.length} documents`);
    console.log(`📋 Documents for loan ${loanId}: ${docIds.length} found in Redis`);
    
    // List all loan document sets
    const loanDocSets = await redis.keys(`${DOCUMENT_BY_LOAN_PREFIX}*`);
    console.log(`\n📋 Loan document sets in Redis: ${loanDocSets.length}`);
    for (const docSet of loanDocSets) {
      const count = await redis.scard(docSet);
      console.log(`   - ${docSet}: ${count} documents`);
    }
  } catch (error) {
    console.error('❌ Error retrieving document information:', error.message);
  }
}

async function main() {
  // Check if loan ID was provided
  const loanId = process.argv[2];
  if (!loanId) {
    console.error('❌ Error: No loan ID provided');
    console.error('Usage: node scripts/generate-test-docs.js LOAN_ID');
    process.exit(1);
  }
  
  // Test Redis connection
  const connected = await testRedisConnection();
  if (!connected) {
    console.error('❌ Cannot proceed: Redis connection failed');
    process.exit(1);
  }
  
  // Generate sample documents
  await generateSampleDocuments(loanId);
  
  // Close Redis connection
  redis.disconnect();
  console.log('\n👋 Done. Redis connection closed.');
}

// Run the script
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
}); 