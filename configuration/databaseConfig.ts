import path from 'path';

// Database configuration
export const DATABASE_CONFIG = {
  // Database file path - uses the data directory in the project root
  dbFilePath: process.env.SQLITE_DB_PATH || path.join(process.cwd(), 'data', 'loans.db'),
  
  // Connection pool settings
  pool: {
    min: 1,
    max: 5
  },
  
  // SQLite specific settings
  sqliteOptions: {
    // Set to true for enhanced performance, false for enhanced safety
    useWAL: true,  // Write-Ahead Logging for better concurrency
    
    // For production, you might want to set this to true
    readonly: false,
    
    // Timeout settings
    timeout: 5000, // Timeout in milliseconds for busy connections
  },
  
  // Location for database backups
  backupDir: path.join(process.cwd(), 'data', 'backups')
};

// Table names
export const DB_TABLES = {
  DOCUMENTS: 'loan_documents',
  DOCUMENT_CONTENTS: 'document_contents'
};

// Export default for convenience
export default DATABASE_CONFIG; 