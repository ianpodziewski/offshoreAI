"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DB_TABLES = exports.DATABASE_CONFIG = void 0;
var path_1 = __importDefault(require("path"));
// Database configuration
exports.DATABASE_CONFIG = {
    // Database file path - uses the data directory in the project root
    dbFilePath: process.env.SQLITE_DB_PATH || path_1.default.join(process.cwd(), 'data', 'loans.db'),
    // Connection pool settings
    pool: {
        min: 1,
        max: 5
    },
    // SQLite specific settings
    sqliteOptions: {
        // Set to true for enhanced performance, false for enhanced safety
        useWAL: true, // Write-Ahead Logging for better concurrency
        // For production, you might want to set this to true
        readonly: false,
        // Timeout settings
        timeout: 5000, // Timeout in milliseconds for busy connections
    },
    // Location for database backups
    backupDir: path_1.default.join(process.cwd(), 'data', 'backups')
};
// Table names
exports.DB_TABLES = {
    DOCUMENTS: 'loan_documents',
    DOCUMENT_CONTENTS: 'document_contents'
};
// Export default for convenience
exports.default = exports.DATABASE_CONFIG;
