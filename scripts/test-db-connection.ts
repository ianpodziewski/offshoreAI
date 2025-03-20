// scripts/test-db-connection.ts
import { databaseService } from '../services/databaseService';
import { DB_TABLES } from '../configuration/databaseConfig';

async function testDatabaseConnection() {
  console.log('Testing database connection...');
  
  try {
    // Initialize the database
    await databaseService.initialize();
    console.log('Database initialized successfully');
    
    // Get the database instance
    const db = databaseService.getDatabase();
    
    // Test basic query
    const tables = db.prepare(`SELECT name FROM sqlite_master WHERE type='table'`).all();
    console.log('Database tables:');
    tables.forEach((table: any) => {
      console.log(`- ${table.name}`);
    });
    
    // Test table structure
    const documentFields = db.prepare(`PRAGMA table_info(${DB_TABLES.DOCUMENTS})`).all();
    console.log(`\nStructure of ${DB_TABLES.DOCUMENTS} table:`);
    documentFields.forEach((field: any) => {
      console.log(`- ${field.name} (${field.type})`);
    });
    
    const contentFields = db.prepare(`PRAGMA table_info(${DB_TABLES.DOCUMENT_CONTENTS})`).all();
    console.log(`\nStructure of ${DB_TABLES.DOCUMENT_CONTENTS} table:`);
    contentFields.forEach((field: any) => {
      console.log(`- ${field.name} (${field.type})`);
    });
    
    // Test backup function
    const backupPath = await databaseService.backup('test');
    console.log(`\nDatabase backed up to: ${backupPath}`);
    
    // Close the connection
    databaseService.close();
    console.log('\nDatabase connection closed.');
    
    console.log('\nDatabase test completed successfully!');
  } catch (error) {
    console.error('Database test failed:', error);
  }
}

// Run the test
testDatabaseConnection(); 