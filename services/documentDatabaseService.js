'use server';
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentDatabaseService = exports.DocumentDatabaseService = void 0;
var databaseService_1 = require("./databaseService");
var databaseConfig_1 = require("../configuration/databaseConfig");
// Check if we're in a Node.js environment
var isServer = typeof window === 'undefined';
/**
 * Service for database operations related to loan documents
 * Safely handles both server and client environments
 */
var DocumentDatabaseService = /** @class */ (function () {
    // Private constructor for singleton pattern
    function DocumentDatabaseService() {
    }
    /**
     * Get the singleton instance of the document database service
     */
    DocumentDatabaseService.getInstance = function () {
        if (!DocumentDatabaseService.instance) {
            DocumentDatabaseService.instance = new DocumentDatabaseService();
        }
        return DocumentDatabaseService.instance;
    };
    /**
     * Check if the environment supports database operations
     * @returns Whether database operations are supported
     */
    DocumentDatabaseService.prototype.isEnvironmentSupported = function () {
        return isServer && databaseService_1.databaseService.isEnvironmentSupported();
    };
    /**
     * Insert a document into the database
     * @param document The document to insert
     * @returns The inserted document ID
     * @throws Error if the environment doesn't support database operations
     */
    DocumentDatabaseService.prototype.insertDocument = function (document) {
        if (!this.isEnvironmentSupported()) {
            console.warn('Document insertion attempted on client-side, operation skipped');
            return document.id;
        }
        var db = databaseService_1.databaseService.getDatabase();
        try {
            // Begin transaction
            var transaction = db.transaction(function () {
                // Insert document metadata
                var insertStmt = db.prepare("\n          INSERT INTO ".concat(databaseConfig_1.DB_TABLES.DOCUMENTS, " (\n            id, loan_id, filename, doc_type, category, section, subsection, status,\n            date_uploaded, file_type, file_size, is_required, version, notes, expiration_date\n          ) VALUES (\n            @id, @loanId, @filename, @docType, @category, @section, @subsection, @status,\n            @dateUploaded, @fileType, @fileSize, @isRequired, @version, @notes, @expirationDate\n          )\n        "));
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
                    var contentStmt = db.prepare("\n            INSERT INTO ".concat(databaseConfig_1.DB_TABLES.DOCUMENT_CONTENTS, " (document_id, content)\n            VALUES (@documentId, @content)\n          "));
                    contentStmt.run({
                        documentId: document.id,
                        content: document.content
                    });
                }
                return document.id;
            });
            // Execute transaction
            return transaction();
        }
        catch (error) {
            console.error('Error inserting document into database:', error);
            throw error;
        }
    };
    /**
     * Update a document in the database
     * @param idOrDocument Document ID to update or document object with id
     * @param updates Document fields to update (optional if first parameter is document)
     * @returns Whether the update was successful
     * @throws Error if the environment doesn't support database operations
     */
    DocumentDatabaseService.prototype.updateDocument = function (idOrDocument, updates) {
        if (!this.isEnvironmentSupported()) {
            console.warn('Document update attempted on client-side, operation skipped');
            return false;
        }
        var document;
        // Handle both calling conventions: updateDocument(id, updates) and updateDocument(document)
        if (typeof idOrDocument === 'string' && updates) {
            // New style: (id, updates)
            document = __assign(__assign({}, updates), { id: idOrDocument });
        }
        else if (typeof idOrDocument === 'object' && idOrDocument.id) {
            // Old style: (document)
            document = idOrDocument;
        }
        else {
            console.error('Invalid parameters for updateDocument');
            return false;
        }
        var db = databaseService_1.databaseService.getDatabase();
        try {
            // Begin transaction
            var transaction = db.transaction(function () {
                // Build update statement dynamically based on provided fields
                var fields = [];
                var params = { id: document.id };
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
                    var updateStmt = db.prepare("\n            UPDATE ".concat(databaseConfig_1.DB_TABLES.DOCUMENTS, "\n            SET ").concat(fields.join(', '), "\n            WHERE id = @id\n          "));
                    updateStmt.run(params);
                }
                // If document has content, update or insert it
                if (document.content !== undefined) {
                    // Check if content exists for this document
                    var contentExists = db.prepare("\n            SELECT 1 FROM ".concat(databaseConfig_1.DB_TABLES.DOCUMENT_CONTENTS, "\n            WHERE document_id = ?\n          ")).get(document.id);
                    if (contentExists) {
                        // Update existing content
                        var updateContentStmt = db.prepare("\n              UPDATE ".concat(databaseConfig_1.DB_TABLES.DOCUMENT_CONTENTS, "\n              SET content = @content\n              WHERE document_id = @documentId\n            "));
                        updateContentStmt.run({
                            documentId: document.id,
                            content: document.content
                        });
                    }
                    else {
                        // Insert new content
                        var insertContentStmt = db.prepare("\n              INSERT INTO ".concat(databaseConfig_1.DB_TABLES.DOCUMENT_CONTENTS, " (document_id, content)\n              VALUES (@documentId, @content)\n            "));
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
        }
        catch (error) {
            console.error('Error updating document in database:', error);
            throw error;
        }
    };
    /**
     * Delete a document from the database
     * @param documentId The ID of the document to delete
     * @returns Whether the deletion was successful
     * @throws Error if the environment doesn't support database operations
     */
    DocumentDatabaseService.prototype.deleteDocument = function (documentId) {
        if (!this.isEnvironmentSupported()) {
            console.warn('Document deletion attempted on client-side, operation skipped');
            return false;
        }
        var db = databaseService_1.databaseService.getDatabase();
        try {
            // With CASCADE enabled, this will also delete the content
            var deleteStmt = db.prepare("\n        DELETE FROM ".concat(databaseConfig_1.DB_TABLES.DOCUMENTS, "\n        WHERE id = ?\n      "));
            var result = deleteStmt.run(documentId);
            return result.changes > 0;
        }
        catch (error) {
            console.error('Error deleting document from database:', error);
            throw error;
        }
    };
    /**
     * Get a document by ID
     * @param documentId The ID of the document to retrieve
     * @param includeContent Whether to include the document content
     * @returns The document, or null if not found
     * @throws Error if the environment doesn't support database operations
     */
    DocumentDatabaseService.prototype.getDocumentById = function (documentId, includeContent) {
        if (includeContent === void 0) { includeContent = false; }
        if (!this.isEnvironmentSupported()) {
            console.warn('Document retrieval attempted on client-side, operation skipped');
            return null;
        }
        var db = databaseService_1.databaseService.getDatabase();
        try {
            // Get document metadata
            var document_1 = db.prepare("\n        SELECT\n          id, loan_id AS loanId, filename, doc_type AS docType, category,\n          section, subsection, status, date_uploaded AS dateUploaded,\n          file_type AS fileType, file_size AS fileSize,\n          is_required AS isRequired, version, notes, expiration_date AS expirationDate\n        FROM ".concat(databaseConfig_1.DB_TABLES.DOCUMENTS, "\n        WHERE id = ?\n      ")).get(documentId);
            if (!document_1) {
                return null;
            }
            // Convert integer to boolean
            document_1.isRequired = !!document_1.isRequired;
            if (includeContent) {
                // Get document content
                var contentResult = db.prepare("\n          SELECT content\n          FROM ".concat(databaseConfig_1.DB_TABLES.DOCUMENT_CONTENTS, "\n          WHERE document_id = ?\n        ")).get(documentId);
                if (contentResult) {
                    document_1.content = contentResult.content;
                }
            }
            return document_1;
        }
        catch (error) {
            console.error('Error getting document from database:', error);
            throw error;
        }
    };
    /**
     * Get all documents for a loan
     * @param loanId The loan ID
     * @param includeContent Whether to include document content
     * @returns Array of documents
     * @throws Error if the environment doesn't support database operations
     */
    DocumentDatabaseService.prototype.getDocumentsForLoan = function (loanId, includeContent) {
        if (includeContent === void 0) { includeContent = false; }
        if (!this.isEnvironmentSupported()) {
            console.warn('Document retrieval for loan attempted on client-side, operation skipped');
            return [];
        }
        var db = databaseService_1.databaseService.getDatabase();
        try {
            // Get document metadata
            var documents = db.prepare("\n        SELECT\n          id, loan_id AS loanId, filename, doc_type AS docType, category,\n          section, subsection, status, date_uploaded AS dateUploaded,\n          file_type AS fileType, file_size AS fileSize,\n          is_required AS isRequired, version, notes, expiration_date AS expirationDate\n        FROM ".concat(databaseConfig_1.DB_TABLES.DOCUMENTS, "\n        WHERE loan_id = ?\n        ORDER BY date_uploaded DESC\n      ")).all(loanId);
            // Convert integers to booleans
            documents.forEach(function (doc) {
                doc.isRequired = !!doc.isRequired;
            });
            if (includeContent) {
                // Get content for each document
                for (var _i = 0, documents_1 = documents; _i < documents_1.length; _i++) {
                    var doc = documents_1[_i];
                    var contentResult = db.prepare("\n            SELECT content\n            FROM ".concat(databaseConfig_1.DB_TABLES.DOCUMENT_CONTENTS, "\n            WHERE document_id = ?\n          ")).get(doc.id);
                    if (contentResult) {
                        doc.content = contentResult.content;
                    }
                }
            }
            return documents;
        }
        catch (error) {
            console.error('Error getting documents for loan from database:', error);
            throw error;
        }
    };
    /**
     * Bulk insert multiple documents
     * @param documents Array of documents to insert
     * @returns Number of documents inserted
     * @throws Error if the environment doesn't support database operations
     */
    DocumentDatabaseService.prototype.bulkInsertDocuments = function (documents) {
        if (!this.isEnvironmentSupported()) {
            console.warn('Bulk document insertion attempted on client-side, operation skipped');
            return 0;
        }
        var db = databaseService_1.databaseService.getDatabase();
        try {
            // Begin transaction
            var transaction = db.transaction(function () {
                // Prepare statements
                var insertDocStmt = db.prepare("\n          INSERT INTO ".concat(databaseConfig_1.DB_TABLES.DOCUMENTS, " (\n            id, loan_id, filename, doc_type, category, section, subsection, status,\n            date_uploaded, file_type, file_size, is_required, version, notes, expiration_date\n          ) VALUES (\n            @id, @loanId, @filename, @docType, @category, @section, @subsection, @status,\n            @dateUploaded, @fileType, @fileSize, @isRequired, @version, @notes, @expirationDate\n          )\n        "));
                var insertContentStmt = db.prepare("\n          INSERT INTO ".concat(databaseConfig_1.DB_TABLES.DOCUMENT_CONTENTS, " (document_id, content)\n          VALUES (@documentId, @content)\n        "));
                // Insert each document
                var count = 0;
                for (var _i = 0, documents_2 = documents; _i < documents_2.length; _i++) {
                    var doc = documents_2[_i];
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
        }
        catch (error) {
            console.error('Error bulk inserting documents into database:', error);
            throw error;
        }
    };
    /**
     * Count documents for a loan
     * @param loanId The loan ID
     * @returns Number of documents
     * @throws Error if the environment doesn't support database operations
     */
    DocumentDatabaseService.prototype.countDocumentsForLoan = function (loanId) {
        if (!this.isEnvironmentSupported()) {
            console.warn('Document count attempted on client-side, operation skipped');
            return 0;
        }
        var db = databaseService_1.databaseService.getDatabase();
        try {
            var result = db.prepare("\n        SELECT COUNT(*) AS count\n        FROM ".concat(databaseConfig_1.DB_TABLES.DOCUMENTS, "\n        WHERE loan_id = ?\n      ")).get(loanId);
            return result ? result.count : 0;
        }
        catch (error) {
            console.error('Error counting documents for loan:', error);
            throw error;
        }
    };
    return DocumentDatabaseService;
}());
exports.DocumentDatabaseService = DocumentDatabaseService;
// Export singleton instance
exports.documentDatabaseService = DocumentDatabaseService.getInstance();
// Export for direct import
exports.default = exports.documentDatabaseService;
