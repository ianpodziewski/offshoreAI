// services/databaseService.ts
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { DATABASE_CONFIG, DB_TABLES } from '../configuration/databaseConfig';

/**
 * Database service for SQLite operations
 * This service provides connection management and basic database operations
 */
class DatabaseService {
  private static instance: DatabaseService;
  private db: Database.Database | null = null;
  private initialized = false;

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
   * Initialize the database, creating it if it doesn't exist
   * This should be called before any database operations
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Ensure the data directory exists
      const dbDir = path.dirname(DATABASE_CONFIG.dbFilePath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      // Create database options with correct verbose setting
      const dbOptions: Database.Options = {
        readonly: DATABASE_CONFIG.sqliteOptions.readonly,
        timeout: DATABASE_CONFIG.sqliteOptions.timeout,
      };
      
      // Add verbose logger if in development mode
      if (process.env.NODE_ENV === 'development') {
        dbOptions.verbose = console.log;
      }

      // Create database connection
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
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  /**
   * Create database schema if it doesn't exist
   */
  private async initializeSchema(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
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
   */
  public getDatabase(): Database.Database {
    if (!this.db || !this.initialized) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  /**
   * Close the database connection
   * This should be called when shutting down the application
   */
  public close(): void {
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
   */
  public async backup(backupName?: string): Promise<string> {
    if (!this.db || !this.initialized) {
      throw new Error('Database not initialized. Call initialize() first.');
    }

    // Ensure backup directory exists
    if (!fs.existsSync(DATABASE_CONFIG.backupDir)) {
      fs.mkdirSync(DATABASE_CONFIG.backupDir, { recursive: true });
    }

    // Generate backup filename
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
  }
}

// Export singleton instance
export const databaseService = DatabaseService.getInstance();

// Export for direct import
export default databaseService; 