// services/databaseService.ts
'use server';

// Types for the dynamically imported modules
// better-sqlite3 has a default export
type DatabaseType = any; // Use any for better-sqlite3 to avoid complex typing issues
type FsType = typeof import('fs');
type PathType = typeof import('path');

// Dynamically import dependencies to prevent client-side bundling
let Database: DatabaseType | undefined;
let fs: FsType | undefined;
let path: PathType | undefined;

// Check if we're in a Node.js environment
const isServer = typeof window === 'undefined';

// Import database dependencies only on the server side
if (isServer) {
  // Dynamic imports to avoid client-side bundling issues
  try {
    Database = require('better-sqlite3');
    fs = require('fs');
    path = require('path');
  } catch (error) {
    console.warn('Server-side dependencies could not be loaded:', error);
  }
}

// Import configuration (this is safe as it's just static data)
import { DATABASE_CONFIG, DB_TABLES } from '../configuration/databaseConfig';

// Interface for database options
interface DbOptions {
  readonly: boolean;
  timeout: number;
  verbose?: (message?: any, ...optionalParams: any[]) => void;
}

/**
 * Database service for SQLite operations
 * This service provides connection management and basic database operations
 * It only operates on the server-side
 */
class DatabaseService {
  private static instance: DatabaseService;
  private db: any = null; // Using 'any' instead of Database.Database to avoid client-side type errors
  private initialized = false;
  private isServerSide = isServer;

  // Private constructor for singleton pattern
  private constructor() {}

  /**
   * Get the singleton instance of the database service
   */
  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Check if we're in a server environment where database operations can be performed
   * @returns Whether the current environment supports database operations
   */
  public isEnvironmentSupported(): boolean {
    return this.isServerSide && !!Database && !!fs && !!path;
  }

  /**
   * Initialize the database, creating it if it doesn't exist
   * This should be called before any database operations
   * Does nothing on the client side
   */
  public async initialize(): Promise<void> {
    // Skip initialization if already initialized or not on server side
    if (this.initialized || !this.isEnvironmentSupported()) {
      if (!this.isServerSide) {
        console.log('Database initialization skipped (client-side environment)');
      }
      return;
    }

    try {
      // Ensure the data directory exists
      if (path && fs) {
        const dbDir = path.dirname(DATABASE_CONFIG.dbFilePath);
        if (!fs.existsSync(dbDir)) {
          fs.mkdirSync(dbDir, { recursive: true });
        }
      }

      // Create database options with correct verbose setting
      const dbOptions: DbOptions = {
        readonly: DATABASE_CONFIG.sqliteOptions.readonly,
        timeout: DATABASE_CONFIG.sqliteOptions.timeout,
      };
      
      // Add verbose logger if in development mode
      if (process.env.NODE_ENV === 'development') {
        dbOptions.verbose = console.log;
      }

      // Create database connection
      if (Database) {
        this.db = new Database(DATABASE_CONFIG.dbFilePath, dbOptions);
        
        // Enable foreign keys support
        this.db.pragma('foreign_keys = ON');
        
        // Use Write-Ahead Logging for better concurrency if configured
        if (DATABASE_CONFIG.sqliteOptions.useWAL) {
          this.db.pragma('journal_mode = WAL');
        }
        
        // Initialize database schema
        await this.initializeSchema();
        
        this.initialized = true;
        console.log(`Database initialized at ${DATABASE_CONFIG.dbFilePath}`);
      } else {
        throw new Error('Database module not available');
      }
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  /**
   * Create database schema if it doesn't exist
   */
  private async initializeSchema(): Promise<void> {
    if (!this.db || !this.isEnvironmentSupported()) {
      throw new Error('Database not initialized or environment not supported');
    }

    // Create loan_documents table if it doesn't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS ${DB_TABLES.DOCUMENTS} (
        id TEXT PRIMARY KEY,
        loan_id TEXT NOT NULL,
        filename TEXT NOT NULL,
        doc_type TEXT NOT NULL,
        category TEXT NOT NULL,
        section TEXT NOT NULL,
        subsection TEXT NOT NULL,
        status TEXT NOT NULL,
        date_uploaded TEXT NOT NULL,
        file_type TEXT,
        file_size INTEGER,
        is_required INTEGER NOT NULL,
        version INTEGER DEFAULT 1,
        notes TEXT,
        expiration_date TEXT
      )
    `);

    // Create document_contents table if it doesn't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS ${DB_TABLES.DOCUMENT_CONTENTS} (
        document_id TEXT PRIMARY KEY,
        content TEXT,
        FOREIGN KEY (document_id) REFERENCES ${DB_TABLES.DOCUMENTS}(id) ON DELETE CASCADE
      )
    `);

    // Create indices for frequently queried fields
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_loan_documents_loan_id ON ${DB_TABLES.DOCUMENTS}(loan_id);
      CREATE INDEX IF NOT EXISTS idx_loan_documents_doc_type ON ${DB_TABLES.DOCUMENTS}(doc_type);
      CREATE INDEX IF NOT EXISTS idx_loan_documents_category ON ${DB_TABLES.DOCUMENTS}(category);
      CREATE INDEX IF NOT EXISTS idx_loan_documents_loan_id_doc_type ON ${DB_TABLES.DOCUMENTS}(loan_id, doc_type);
    `);
  }

  /**
   * Get the database instance
   * @returns The database instance
   * @throws Error if not initialized or not in a server environment
   */
  public getDatabase(): any {
    if (!this.isEnvironmentSupported()) {
      throw new Error('Database operations are only supported on the server side');
    }
    
    if (!this.db || !this.initialized) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    
    return this.db;
  }

  /**
   * Close the database connection
   * This should be called when shutting down the application
   * Does nothing on the client side
   */
  public close(): void {
    if (!this.isEnvironmentSupported()) {
      return;
    }
    
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initialized = false;
      console.log('Database connection closed');
    }
  }

  /**
   * Run a database backup
   * @param backupName Optional name for the backup file
   * @returns Path to the backup file
   * @throws Error if not initialized or not in a server environment
   */
  public async backup(backupName?: string): Promise<string> {
    if (!this.isEnvironmentSupported()) {
      throw new Error('Database operations are only supported on the server side');
    }
    
    if (!this.db || !this.initialized) {
      throw new Error('Database not initialized. Call initialize() first.');
    }

    // Ensure backup directory exists
    if (fs && path) {
      if (!fs.existsSync(DATABASE_CONFIG.backupDir)) {
        fs.mkdirSync(DATABASE_CONFIG.backupDir, { recursive: true });
      }
    }

    // Generate backup filename
    if (path) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFilename = backupName 
        ? `${backupName}-${timestamp}.db` 
        : `backup-${timestamp}.db`;
      const backupPath = path.join(DATABASE_CONFIG.backupDir, backupFilename);

      // Perform backup
      try {
        this.db.backup(backupPath);
        console.log(`Database backed up to ${backupPath}`);
        return backupPath;
      } catch (error) {
        console.error('Database backup failed:', error);
        throw error;
      }
    } else {
      throw new Error('Path module not available for backup operation');
    }
  }
}

// Export singleton instance
export const databaseService = DatabaseService.getInstance();

// Export for direct import
export default databaseService; 