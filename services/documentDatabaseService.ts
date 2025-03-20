'use server';

import { databaseService } from './databaseService';
import { DB_TABLES } from '../configuration/databaseConfig';
import { LoanDocument, DocumentStatus } from '../utilities/loanDocumentStructure';

// Check if we're in a Node.js environment
const isServer = typeof window === 'undefined';

/**
 * Service for database operations related to loan documents
 * Safely handles both server and client environments
 */
export class DocumentDatabaseService {
  private static instance: DocumentDatabaseService;

  // Private constructor for singleton pattern
  private constructor() {}

  /**
   * Get the singleton instance of the document database service
   */
  public static getInstance(): DocumentDatabaseService {
    if (!DocumentDatabaseService.instance) {
      DocumentDatabaseService.instance = new DocumentDatabaseService();
    }
    return DocumentDatabaseService.instance;
  }

  /**
   * Check if the environment supports database operations
   * @returns Whether database operations are supported
   */
  public isEnvironmentSupported(): boolean {
    return isServer && databaseService.isEnvironmentSupported();
  }

  /**
   * Insert a document into the database
   * @param document The document to insert
   * @returns The inserted document ID
   * @throws Error if the environment doesn't support database operations
   */
  public insertDocument(document: LoanDocument): string {
    if (!this.isEnvironmentSupported()) {
      console.warn('Document insertion attempted on client-side, operation skipped');
      return document.id;
    }

    const db = databaseService.getDatabase();
    
    try {
      // Begin transaction
      const transaction = db.transaction(() => {
        // Insert document metadata
        const insertStmt = db.prepare(`
          INSERT INTO ${DB_TABLES.DOCUMENTS} (
            id, loan_id, filename, doc_type, category, section, subsection, status,
            date_uploaded, file_type, file_size, is_required, version, notes, expiration_date
          ) VALUES (
            @id, @loanId, @filename, @docType, @category, @section, @subsection, @status,
            @dateUploaded, @fileType, @fileSize, @isRequired, @version, @notes, @expirationDate
          )
        `);
        
        insertStmt.run({
          id: document.id,
          loanId: document.loanId,
          filename: document.filename,
          docType: document.docType,
          category: document.category,
          section: document.section,
          subsection: document.subsection,
          status: document.status,
          dateUploaded: document.dateUploaded,
          fileType: document.fileType || null,
          fileSize: document.fileSize || null,
          isRequired: document.isRequired ? 1 : 0, // Convert boolean to integer
          version: document.version || 1,
          notes: document.notes || null,
          expirationDate: document.expirationDate || null
        });
        
        // If document has content, insert it into the content table
        if (document.content) {
          const contentStmt = db.prepare(`
            INSERT INTO ${DB_TABLES.DOCUMENT_CONTENTS} (document_id, content)
            VALUES (@documentId, @content)
          `);
          
          contentStmt.run({
            documentId: document.id,
            content: document.content
          });
        }
        
        return document.id;
      });
      
      // Execute transaction
      return transaction();
    } catch (error) {
      console.error('Error inserting document into database:', error);
      throw error;
    }
  }

  /**
   * Update a document in the database
   * @param idOrDocument Document ID to update or document object with id
   * @param updates Document fields to update (optional if first parameter is document)
   * @returns Whether the update was successful
   * @throws Error if the environment doesn't support database operations
   */
  public updateDocument(idOrDocument: string | (Partial<LoanDocument> & { id: string }), updates?: Partial<LoanDocument>): boolean {
    if (!this.isEnvironmentSupported()) {
      console.warn('Document update attempted on client-side, operation skipped');
      return false;
    }

    let document: Partial<LoanDocument> & { id: string };
    
    // Handle both calling conventions: updateDocument(id, updates) and updateDocument(document)
    if (typeof idOrDocument === 'string' && updates) {
      // New style: (id, updates)
      document = { ...updates, id: idOrDocument };
    } else if (typeof idOrDocument === 'object' && idOrDocument.id) {
      // Old style: (document)
      document = idOrDocument;
    } else {
      console.error('Invalid parameters for updateDocument');
      return false;
    }

    const db = databaseService.getDatabase();
    
    try {
      // Begin transaction
      const transaction = db.transaction(() => {
        // Build update statement dynamically based on provided fields
        const fields: string[] = [];
        const params: any = { id: document.id };
        
        if (document.loanId !== undefined) {
          fields.push('loan_id = @loanId');
          params.loanId = document.loanId;
        }
        
        if (document.filename !== undefined) {
          fields.push('filename = @filename');
          params.filename = document.filename;
        }
        
        if (document.docType !== undefined) {
          fields.push('doc_type = @docType');
          params.docType = document.docType;
        }
        
        if (document.category !== undefined) {
          fields.push('category = @category');
          params.category = document.category;
        }
        
        if (document.section !== undefined) {
          fields.push('section = @section');
          params.section = document.section;
        }
        
        if (document.subsection !== undefined) {
          fields.push('subsection = @subsection');
          params.subsection = document.subsection;
        }
        
        if (document.status !== undefined) {
          fields.push('status = @status');
          params.status = document.status;
        }
        
        if (document.dateUploaded !== undefined) {
          fields.push('date_uploaded = @dateUploaded');
          params.dateUploaded = document.dateUploaded;
        }
        
        if (document.fileType !== undefined) {
          fields.push('file_type = @fileType');
          params.fileType = document.fileType;
        }
        
        if (document.fileSize !== undefined) {
          fields.push('file_size = @fileSize');
          params.fileSize = document.fileSize;
        }
        
        if (document.isRequired !== undefined) {
          fields.push('is_required = @isRequired');
          params.isRequired = document.isRequired ? 1 : 0;
        }
        
        if (document.version !== undefined) {
          fields.push('version = @version');
          params.version = document.version;
        }
        
        if (document.notes !== undefined) {
          fields.push('notes = @notes');
          params.notes = document.notes;
        }
        
        if (document.expirationDate !== undefined) {
          fields.push('expiration_date = @expirationDate');
          params.expirationDate = document.expirationDate;
        }
        
        // If there are fields to update, execute the update statement
        if (fields.length > 0) {
          const updateStmt = db.prepare(`
            UPDATE ${DB_TABLES.DOCUMENTS}
            SET ${fields.join(', ')}
            WHERE id = @id
          `);
          updateStmt.run(params);
        }
        
        // If document has content, update or insert it
        if (document.content !== undefined) {
          // Check if content exists for this document
          const contentExists = db.prepare(`
            SELECT 1 FROM ${DB_TABLES.DOCUMENT_CONTENTS}
            WHERE document_id = ?
          `).get(document.id);
          
          if (contentExists) {
            // Update existing content
            const updateContentStmt = db.prepare(`
              UPDATE ${DB_TABLES.DOCUMENT_CONTENTS}
              SET content = @content
              WHERE document_id = @documentId
            `);
            
            updateContentStmt.run({
              documentId: document.id,
              content: document.content
            });
          } else {
            // Insert new content
            const insertContentStmt = db.prepare(`
              INSERT INTO ${DB_TABLES.DOCUMENT_CONTENTS} (document_id, content)
              VALUES (@documentId, @content)
            `);
            
            insertContentStmt.run({
              documentId: document.id,
              content: document.content
            });
          }
        }
        
        return true;
      });
      
      // Execute transaction
      return transaction();
    } catch (error) {
      console.error('Error updating document in database:', error);
      throw error;
    }
  }

  /**
   * Delete a document from the database
   * @param documentId The ID of the document to delete
   * @returns Whether the deletion was successful
   * @throws Error if the environment doesn't support database operations
   */
  public deleteDocument(documentId: string): boolean {
    if (!this.isEnvironmentSupported()) {
      console.warn('Document deletion attempted on client-side, operation skipped');
      return false;
    }

    const db = databaseService.getDatabase();
    
    try {
      // With CASCADE enabled, this will also delete the content
      const deleteStmt = db.prepare(`
        DELETE FROM ${DB_TABLES.DOCUMENTS}
        WHERE id = ?
      `);
      
      const result = deleteStmt.run(documentId);
      return result.changes > 0;
    } catch (error) {
      console.error('Error deleting document from database:', error);
      throw error;
    }
  }

  /**
   * Get a document by ID
   * @param documentId The ID of the document to retrieve
   * @param includeContent Whether to include the document content
   * @returns The document, or null if not found
   * @throws Error if the environment doesn't support database operations
   */
  public getDocumentById(documentId: string, includeContent = false): LoanDocument | null {
    if (!this.isEnvironmentSupported()) {
      console.warn('Document retrieval attempted on client-side, operation skipped');
      return null;
    }

    const db = databaseService.getDatabase();
    
    try {
      // Get document metadata
      const document = db.prepare(`
        SELECT
          id, loan_id AS loanId, filename, doc_type AS docType, category,
          section, subsection, status, date_uploaded AS dateUploaded,
          file_type AS fileType, file_size AS fileSize,
          is_required AS isRequired, version, notes, expiration_date AS expirationDate
        FROM ${DB_TABLES.DOCUMENTS}
        WHERE id = ?
      `).get(documentId) as any;
      
      if (!document) {
        return null;
      }
      
      // Convert integer to boolean
      document.isRequired = !!document.isRequired;
      
      if (includeContent) {
        // Get document content
        const contentResult = db.prepare(`
          SELECT content
          FROM ${DB_TABLES.DOCUMENT_CONTENTS}
          WHERE document_id = ?
        `).get(documentId) as any;
        
        if (contentResult) {
          document.content = contentResult.content;
        }
      }
      
      return document as LoanDocument;
    } catch (error) {
      console.error('Error getting document from database:', error);
      throw error;
    }
  }

  /**
   * Get all documents for a loan
   * @param loanId The loan ID
   * @param includeContent Whether to include document content
   * @returns Array of documents
   * @throws Error if the environment doesn't support database operations
   */
  public getDocumentsForLoan(loanId: string, includeContent = false): LoanDocument[] {
    if (!this.isEnvironmentSupported()) {
      console.warn('Document retrieval for loan attempted on client-side, operation skipped');
      return [];
    }

    const db = databaseService.getDatabase();
    
    try {
      // Get document metadata
      const documents = db.prepare(`
        SELECT
          id, loan_id AS loanId, filename, doc_type AS docType, category,
          section, subsection, status, date_uploaded AS dateUploaded,
          file_type AS fileType, file_size AS fileSize,
          is_required AS isRequired, version, notes, expiration_date AS expirationDate
        FROM ${DB_TABLES.DOCUMENTS}
        WHERE loan_id = ?
        ORDER BY date_uploaded DESC
      `).all(loanId) as any[];
      
      // Convert integers to booleans
      documents.forEach((doc) => {
        doc.isRequired = !!doc.isRequired;
      });
      
      if (includeContent) {
        // Get content for each document
        for (const doc of documents) {
          const contentResult = db.prepare(`
            SELECT content
            FROM ${DB_TABLES.DOCUMENT_CONTENTS}
            WHERE document_id = ?
          `).get(doc.id) as any;
          
          if (contentResult) {
            doc.content = contentResult.content;
          }
        }
      }
      
      return documents as LoanDocument[];
    } catch (error) {
      console.error('Error getting documents for loan from database:', error);
      throw error;
    }
  }

  /**
   * Bulk insert multiple documents
   * @param documents Array of documents to insert
   * @returns Number of documents inserted
   * @throws Error if the environment doesn't support database operations
   */
  public bulkInsertDocuments(documents: LoanDocument[]): number {
    if (!this.isEnvironmentSupported()) {
      console.warn('Bulk document insertion attempted on client-side, operation skipped');
      return 0;
    }

    const db = databaseService.getDatabase();
    
    try {
      // Begin transaction
      const transaction = db.transaction(() => {
        // Prepare statements
        const insertDocStmt = db.prepare(`
          INSERT INTO ${DB_TABLES.DOCUMENTS} (
            id, loan_id, filename, doc_type, category, section, subsection, status,
            date_uploaded, file_type, file_size, is_required, version, notes, expiration_date
          ) VALUES (
            @id, @loanId, @filename, @docType, @category, @section, @subsection, @status,
            @dateUploaded, @fileType, @fileSize, @isRequired, @version, @notes, @expirationDate
          )
        `);
        
        const insertContentStmt = db.prepare(`
          INSERT INTO ${DB_TABLES.DOCUMENT_CONTENTS} (document_id, content)
          VALUES (@documentId, @content)
        `);
        
        // Insert each document
        let count = 0;
        for (const doc of documents) {
          insertDocStmt.run({
            id: doc.id,
            loanId: doc.loanId,
            filename: doc.filename,
            docType: doc.docType,
            category: doc.category,
            section: doc.section,
            subsection: doc.subsection,
            status: doc.status,
            dateUploaded: doc.dateUploaded,
            fileType: doc.fileType || null,
            fileSize: doc.fileSize || null,
            isRequired: doc.isRequired ? 1 : 0,
            version: doc.version || 1,
            notes: doc.notes || null,
            expirationDate: doc.expirationDate || null
          });
          
          // Insert content if available
          if (doc.content) {
            insertContentStmt.run({
              documentId: doc.id,
              content: doc.content
            });
          }
          
          count++;
        }
        
        return count;
      });
      
      // Execute transaction
      return transaction();
    } catch (error) {
      console.error('Error bulk inserting documents into database:', error);
      throw error;
    }
  }

  /**
   * Count documents for a loan
   * @param loanId The loan ID
   * @returns Number of documents
   * @throws Error if the environment doesn't support database operations
   */
  public countDocumentsForLoan(loanId: string): number {
    if (!this.isEnvironmentSupported()) {
      console.warn('Document count attempted on client-side, operation skipped');
      return 0;
    }

    const db = databaseService.getDatabase();
    
    try {
      const result = db.prepare(`
        SELECT COUNT(*) AS count
        FROM ${DB_TABLES.DOCUMENTS}
        WHERE loan_id = ?
      `).get(loanId) as any;
      
      return result ? result.count : 0;
    } catch (error) {
      console.error('Error counting documents for loan:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const documentDatabaseService = DocumentDatabaseService.getInstance();

// Export for direct import
export default documentDatabaseService; 