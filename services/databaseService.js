// services/databaseService.ts
'use server';
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseService = void 0;
// Dynamically import dependencies to prevent client-side bundling
var Database;
var fs;
var path;
// Check if we're in a Node.js environment
var isServer = typeof window === 'undefined';
// Import database dependencies only on the server side
if (isServer) {
    // Dynamic imports to avoid client-side bundling issues
    try {
        Database = require('better-sqlite3');
        fs = require('fs');
        path = require('path');
    }
    catch (error) {
        console.warn('Server-side dependencies could not be loaded:', error);
    }
}
// Import configuration (this is safe as it's just static data)
var databaseConfig_1 = require("../configuration/databaseConfig");
/**
 * Database service for SQLite operations
 * This service provides connection management and basic database operations
 * It only operates on the server-side
 */
var DatabaseService = /** @class */ (function () {
    // Private constructor for singleton pattern
    function DatabaseService() {
        this.db = null; // Using 'any' instead of Database.Database to avoid client-side type errors
        this.initialized = false;
        this.isServerSide = isServer;
    }
    /**
     * Get the singleton instance of the database service
     */
    DatabaseService.getInstance = function () {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    };
    /**
     * Check if we're in a server environment where database operations can be performed
     * @returns Whether the current environment supports database operations
     */
    DatabaseService.prototype.isEnvironmentSupported = function () {
        return this.isServerSide && !!Database && !!fs && !!path;
    };
    /**
     * Initialize the database, creating it if it doesn't exist
     * This should be called before any database operations
     * Does nothing on the client side
     */
    DatabaseService.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var dbDir, dbOptions, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Skip initialization if already initialized or not on server side
                        if (this.initialized || !this.isEnvironmentSupported()) {
                            if (!this.isServerSide) {
                                console.log('Database initialization skipped (client-side environment)');
                            }
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        // Ensure the data directory exists
                        if (path && fs) {
                            dbDir = path.dirname(databaseConfig_1.DATABASE_CONFIG.dbFilePath);
                            if (!fs.existsSync(dbDir)) {
                                fs.mkdirSync(dbDir, { recursive: true });
                            }
                        }
                        dbOptions = {
                            readonly: databaseConfig_1.DATABASE_CONFIG.sqliteOptions.readonly,
                            timeout: databaseConfig_1.DATABASE_CONFIG.sqliteOptions.timeout,
                        };
                        // Add verbose logger if in development mode
                        if (process.env.NODE_ENV === 'development') {
                            dbOptions.verbose = console.log;
                        }
                        if (!Database) return [3 /*break*/, 3];
                        this.db = new Database(databaseConfig_1.DATABASE_CONFIG.dbFilePath, dbOptions);
                        // Enable foreign keys support
                        this.db.pragma('foreign_keys = ON');
                        // Use Write-Ahead Logging for better concurrency if configured
                        if (databaseConfig_1.DATABASE_CONFIG.sqliteOptions.useWAL) {
                            this.db.pragma('journal_mode = WAL');
                        }
                        // Initialize database schema
                        return [4 /*yield*/, this.initializeSchema()];
                    case 2:
                        // Initialize database schema
                        _a.sent();
                        this.initialized = true;
                        console.log("Database initialized at ".concat(databaseConfig_1.DATABASE_CONFIG.dbFilePath));
                        return [3 /*break*/, 4];
                    case 3: throw new Error('Database module not available');
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_1 = _a.sent();
                        console.error('Failed to initialize database:', error_1);
                        throw error_1;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create database schema if it doesn't exist
     */
    DatabaseService.prototype.initializeSchema = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!this.db || !this.isEnvironmentSupported()) {
                    throw new Error('Database not initialized or environment not supported');
                }
                // Create loan_documents table if it doesn't exist
                this.db.exec("\n      CREATE TABLE IF NOT EXISTS ".concat(databaseConfig_1.DB_TABLES.DOCUMENTS, " (\n        id TEXT PRIMARY KEY,\n        loan_id TEXT NOT NULL,\n        filename TEXT NOT NULL,\n        doc_type TEXT NOT NULL,\n        category TEXT NOT NULL,\n        section TEXT NOT NULL,\n        subsection TEXT NOT NULL,\n        status TEXT NOT NULL,\n        date_uploaded TEXT NOT NULL,\n        file_type TEXT,\n        file_size INTEGER,\n        is_required INTEGER NOT NULL,\n        version INTEGER DEFAULT 1,\n        notes TEXT,\n        expiration_date TEXT\n      )\n    "));
                // Create document_contents table if it doesn't exist
                this.db.exec("\n      CREATE TABLE IF NOT EXISTS ".concat(databaseConfig_1.DB_TABLES.DOCUMENT_CONTENTS, " (\n        document_id TEXT PRIMARY KEY,\n        content TEXT,\n        FOREIGN KEY (document_id) REFERENCES ").concat(databaseConfig_1.DB_TABLES.DOCUMENTS, "(id) ON DELETE CASCADE\n      )\n    "));
                // Create indices for frequently queried fields
                this.db.exec("\n      CREATE INDEX IF NOT EXISTS idx_loan_documents_loan_id ON ".concat(databaseConfig_1.DB_TABLES.DOCUMENTS, "(loan_id);\n      CREATE INDEX IF NOT EXISTS idx_loan_documents_doc_type ON ").concat(databaseConfig_1.DB_TABLES.DOCUMENTS, "(doc_type);\n      CREATE INDEX IF NOT EXISTS idx_loan_documents_category ON ").concat(databaseConfig_1.DB_TABLES.DOCUMENTS, "(category);\n      CREATE INDEX IF NOT EXISTS idx_loan_documents_loan_id_doc_type ON ").concat(databaseConfig_1.DB_TABLES.DOCUMENTS, "(loan_id, doc_type);\n    "));
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get the database instance
     * @returns The database instance
     * @throws Error if not initialized or not in a server environment
     */
    DatabaseService.prototype.getDatabase = function () {
        if (!this.isEnvironmentSupported()) {
            throw new Error('Database operations are only supported on the server side');
        }
        if (!this.db || !this.initialized) {
            throw new Error('Database not initialized. Call initialize() first.');
        }
        return this.db;
    };
    /**
     * Close the database connection
     * This should be called when shutting down the application
     * Does nothing on the client side
     */
    DatabaseService.prototype.close = function () {
        if (!this.isEnvironmentSupported()) {
            return;
        }
        if (this.db) {
            this.db.close();
            this.db = null;
            this.initialized = false;
            console.log('Database connection closed');
        }
    };
    /**
     * Run a database backup
     * @param backupName Optional name for the backup file
     * @returns Path to the backup file
     * @throws Error if not initialized or not in a server environment
     */
    DatabaseService.prototype.backup = function (backupName) {
        return __awaiter(this, void 0, void 0, function () {
            var timestamp, backupFilename, backupPath;
            return __generator(this, function (_a) {
                if (!this.isEnvironmentSupported()) {
                    throw new Error('Database operations are only supported on the server side');
                }
                if (!this.db || !this.initialized) {
                    throw new Error('Database not initialized. Call initialize() first.');
                }
                // Ensure backup directory exists
                if (fs && path) {
                    if (!fs.existsSync(databaseConfig_1.DATABASE_CONFIG.backupDir)) {
                        fs.mkdirSync(databaseConfig_1.DATABASE_CONFIG.backupDir, { recursive: true });
                    }
                }
                // Generate backup filename
                if (path) {
                    timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                    backupFilename = backupName
                        ? "".concat(backupName, "-").concat(timestamp, ".db")
                        : "backup-".concat(timestamp, ".db");
                    backupPath = path.join(databaseConfig_1.DATABASE_CONFIG.backupDir, backupFilename);
                    // Perform backup
                    try {
                        this.db.backup(backupPath);
                        console.log("Database backed up to ".concat(backupPath));
                        return [2 /*return*/, backupPath];
                    }
                    catch (error) {
                        console.error('Database backup failed:', error);
                        throw error;
                    }
                }
                else {
                    throw new Error('Path module not available for backup operation');
                }
                return [2 /*return*/];
            });
        });
    };
    return DatabaseService;
}());
// Export singleton instance
exports.databaseService = DatabaseService.getInstance();
// Export for direct import
exports.default = exports.databaseService;
