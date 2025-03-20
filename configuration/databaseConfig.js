"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DB_TABLES = exports.DATABASE_CONFIG = void 0;
// Make path module usage conditional based on environment
var pathModule;
// Check if we're in a Node.js environment
var isServer = typeof window === 'undefined';
// Import path module only on the server side
if (isServer) {
    try {
        pathModule = require('path');
    }
    catch (error) {
        console.warn('Path module could not be loaded:', error);
    }
}
/**
 * Get a safe path join function that works in both server and client environments
 */
var safePathJoin = function () {
    var parts = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        parts[_i] = arguments[_i];
    }
    if (isServer && pathModule) {
        return pathModule.join.apply(pathModule, parts);
    }
    // Simple fallback path join for client side
    return parts.join('/').replace(/\/+/g, '/');
};
// Database configuration
exports.DATABASE_CONFIG = {
    // Database file path - uses the data directory in the project root
    dbFilePath: process.env.SQLITE_DB_PATH ||
        (isServer ? safePathJoin(process.cwd(), 'data', 'loans.db') : '/data/loans.db'),
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
    backupDir: isServer ?
        safePathJoin(process.cwd(), 'data', 'backups') :
        '/data/backups'
};
// Table names
exports.DB_TABLES = {
    DOCUMENTS: 'loan_documents',
    DOCUMENT_CONTENTS: 'document_contents'
};
// Export default for convenience
exports.default = exports.DATABASE_CONFIG;
