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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loanDocumentService = exports.formatFileSize = void 0;
// @ts-nocheck /* This disables TypeScript type checking for this file due to complex template literals */
var uuid_1 = require("uuid");
var loanDocumentStructure_1 = require("./loanDocumentStructure");
var loanDatabase_1 = require("./loanDatabase");
var documentTemplateStrings_1 = require("./templates/documentTemplateStrings");
var simplifiedDocumentService_1 = require("./simplifiedDocumentService");
// Constants for storage keys
var LOAN_DOCUMENTS_STORAGE_KEY = 'loan_documents';
// Document statuses for fake documents (excluding 'required' since we want to show uploaded docs)
var FAKE_DOCUMENT_STATUSES = ['pending', 'approved', 'received', 'reviewed'];
// Document file types - Changed to only use HTML to avoid creating PDFs
var FILE_TYPES = ['.html'];
// Maximum characters that can be safely sent to the embeddings API
var MAX_EMBEDDING_CHARS = 8000;
// Prefix for loan document embeddings to group them separately
var LOAN_DOCUMENTS_PREFIX = 'loan-docs';
// Chunk size (characters) for splitting large documents
var CHUNK_SIZE = 3500;
var CHUNK_OVERLAP = 500;
// Storage mode flags
var USE_LOCAL_STORAGE = true;
var USE_DATABASE = true;
// Check if we're in a server environment
var isServer = typeof window === 'undefined';
// Safely store database service references
var documentDatabaseService = null;
var databaseService = null;
// Function to generate a random file size between 100KB and 10MB
var getRandomFileSize = function () {
    return Math.floor(Math.random() * 9900000) + 100000; // 100KB to 10MB
};
// Format file size into human-readable strings (KB, MB, etc)
var formatFileSize = function (bytes) {
    if (bytes < 1024)
        return bytes + ' bytes';
    if (bytes < 1024 * 1024)
        return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024)
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
};
exports.formatFileSize = formatFileSize;
// Dynamically load database services only in server environment
var loadDatabaseServices = function () { return __awaiter(void 0, void 0, void 0, function () {
    var dbServiceModule, docDbServiceModule, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!isServer) {
                    console.log('Database services cannot be loaded in browser environment');
                    return [2 /*return*/, false];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, Promise.resolve().then(function () { return require('@/services/databaseService'); })];
            case 2:
                dbServiceModule = _a.sent();
                return [4 /*yield*/, Promise.resolve().then(function () { return require('@/services/documentDatabaseService'); })];
            case 3:
                docDbServiceModule = _a.sent();
                databaseService = dbServiceModule.default;
                documentDatabaseService = docDbServiceModule.default;
                return [2 /*return*/, true];
            case 4:
                error_1 = _a.sent();
                console.error('Failed to load database services:', error_1);
                return [2 /*return*/, false];
            case 5: return [2 /*return*/];
        }
    });
}); };
// Check if database is available and initialized
var isDatabaseAvailable = function () { return __awaiter(void 0, void 0, void 0, function () {
    var loaded, error_2, error_3;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                if (!isServer) {
                    console.log('Database not available in browser environment');
                    return [2 /*return*/, false];
                }
                if (!USE_DATABASE) {
                    return [2 /*return*/, false];
                }
                if (!(!databaseService || !documentDatabaseService)) return [3 /*break*/, 2];
                return [4 /*yield*/, loadDatabaseServices()];
            case 1:
                loaded = _c.sent();
                if (!loaded) {
                    return [2 /*return*/, false];
                }
                _c.label = 2;
            case 2:
                _c.trys.push([2, 7, , 8]);
                if (!((_a = databaseService.isEnvironmentSupported) === null || _a === void 0 ? void 0 : _a.call(databaseService))) {
                    return [2 /*return*/, false];
                }
                if (!!databaseService.initialized) return [3 /*break*/, 6];
                _c.label = 3;
            case 3:
                _c.trys.push([3, 5, , 6]);
                return [4 /*yield*/, ((_b = databaseService.initialize) === null || _b === void 0 ? void 0 : _b.call(databaseService))];
            case 4:
                _c.sent();
                return [3 /*break*/, 6];
            case 5:
                error_2 = _c.sent();
                console.error('Error initializing database:', error_2);
                return [2 /*return*/, false];
            case 6: return [2 /*return*/, !!databaseService.initialized];
            case 7:
                error_3 = _c.sent();
                console.error('Error checking database availability:', error_3);
                return [2 /*return*/, false];
            case 8: return [2 /*return*/];
        }
    });
}); };
// Initialize the database if needed
var initializeDatabase = function () { return __awaiter(void 0, void 0, void 0, function () {
    var loaded, error_4, error_5;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                if (!isServer) {
                    console.log('Cannot initialize database in browser environment');
                    return [2 /*return*/, false];
                }
                if (!USE_DATABASE) {
                    return [2 /*return*/, false];
                }
                _c.label = 1;
            case 1:
                _c.trys.push([1, 8, , 9]);
                if (!(!databaseService || !documentDatabaseService)) return [3 /*break*/, 3];
                return [4 /*yield*/, loadDatabaseServices()];
            case 2:
                loaded = _c.sent();
                if (!loaded) {
                    return [2 /*return*/, false];
                }
                _c.label = 3;
            case 3:
                // Check if database service is available
                if (!((_a = databaseService.isEnvironmentSupported) === null || _a === void 0 ? void 0 : _a.call(databaseService))) {
                    console.warn('Database environment not supported, skipping initialization');
                    return [2 /*return*/, false];
                }
                _c.label = 4;
            case 4:
                _c.trys.push([4, 6, , 7]);
                return [4 /*yield*/, ((_b = databaseService.initialize) === null || _b === void 0 ? void 0 : _b.call(databaseService))];
            case 5:
                _c.sent();
                console.log('Database initialized for document storage');
                return [2 /*return*/, true];
            case 6:
                error_4 = _c.sent();
                console.error('Failed to initialize database:', error_4);
                return [2 /*return*/, false];
            case 7: return [3 /*break*/, 9];
            case 8:
                error_5 = _c.sent();
                console.error('Failed to initialize database:', error_5);
                return [2 /*return*/, false];
            case 9: return [2 /*return*/];
        }
    });
}); };
// Generate fake document content
var generateDocumentContent = function (docType, loan) {
    // First check if the loan object is valid
    if (!loan) {
        console.error("Cannot generate document content: loan data is undefined");
        return "<html><body><h1>Error: Missing Loan Data</h1><p>The loan data required to generate this document is unavailable.</p></body></html>";
    }
    // Ensure borrowerName is set to prevent errors in templates
    var safeLoan = __assign(__assign({}, loan), { borrowerName: loan.borrowerName || 'Borrower Name Not Available', propertyAddress: loan.propertyAddress || 'Property Address Not Available', loanAmount: loan.loanAmount || 0, loanTerm: loan.loanTerm || 0, interestRate: loan.interestRate || 0, loanType: loan.loanType || 'unknown' });
    try {
        // Call getDocumentTemplate with both required parameters
        var template = (0, documentTemplateStrings_1.getDocumentTemplate)(docType, safeLoan);
        if (!template)
            return '';
        // The template already has the loan data injected, so we can return it directly
        return template;
    }
    catch (error) {
        console.error("Error generating document content for ".concat(docType, ":"), error);
        return "<html><body><h1>Error Generating Document</h1><p>There was an error generating the ".concat(docType, " document.</p></body></html>");
    }
};
// Check if localStorage is getting full
var isLocalStorageFull = function () {
    try {
        var totalSize = localStorage.length > 0
            ? Object.keys(localStorage).map(function (key) { return key.length + (localStorage[key] || '').length; }).reduce(function (a, b) { return a + b; }, 0)
            : 0;
        var maxSize = 5 * 1024 * 1024; // 5MB is a conservative estimate for localStorage
        var usedPercentage = (totalSize / maxSize) * 100;
        console.log("LocalStorage usage: ".concat(usedPercentage.toFixed(2), "% (").concat((0, exports.formatFileSize)(totalSize), " of ~").concat((0, exports.formatFileSize)(maxSize), ")"));
        return usedPercentage > 80; // Warning at 80% usage
    }
    catch (e) {
        console.error('Error checking localStorage size:', e);
        return false;
    }
};
// Batch size for generating fake documents
var BATCH_SIZE = 5;
// Helper function that no longer deduplicates documents - just returns them
var deduplicateDocuments = function (documents) {
    // Return documents without deduplication
    return documents;
};
// Export the loan document service
exports.loanDocumentService = {
    // Get all documents
    getAllDocuments: function () {
        try {
            // Always check localStorage first
            var docsFromStorage = localStorage.getItem(LOAN_DOCUMENTS_STORAGE_KEY);
            return docsFromStorage ? JSON.parse(docsFromStorage) : [];
        }
        catch (error) {
            console.error('Error getting all documents:', error);
            return [];
        }
    },
    // Get documents for a specific loan
    getDocumentsForLoan: function (loanId_1) {
        var args_1 = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args_1[_i - 1] = arguments[_i];
        }
        return __awaiter(void 0, __spreadArray([loanId_1], args_1, true), void 0, function (loanId, includeContent) {
            var dbAvailable, docs, dbError_1, allDocs, error_6;
            if (includeContent === void 0) { includeContent = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        dbAvailable = false;
                        if (!(isServer && USE_DATABASE)) return [3 /*break*/, 2];
                        return [4 /*yield*/, isDatabaseAvailable()];
                    case 1:
                        dbAvailable = _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!(dbAvailable && documentDatabaseService)) return [3 /*break*/, 6];
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        // Attempt to get documents from database
                        console.log("Getting documents for loan ".concat(loanId, " from database"));
                        return [4 /*yield*/, documentDatabaseService.getDocumentsForLoan(loanId, includeContent)];
                    case 4:
                        docs = _a.sent();
                        // If we have results from the database, return them
                        if (docs && docs.length > 0) {
                            console.log("Found ".concat(docs.length, " documents in database for loan ").concat(loanId));
                            return [2 /*return*/, docs];
                        }
                        return [3 /*break*/, 6];
                    case 5:
                        dbError_1 = _a.sent();
                        console.error("Error getting documents from database for loan ".concat(loanId, ":"), dbError_1);
                        return [3 /*break*/, 6];
                    case 6:
                        // Fallback to localStorage
                        console.log("Getting documents for loan ".concat(loanId, " from localStorage"));
                        allDocs = exports.loanDocumentService.getAllDocuments();
                        return [2 /*return*/, allDocs.filter(function (doc) { return doc.loanId === loanId; })];
                    case 7:
                        error_6 = _a.sent();
                        console.error("Error getting documents for loan ".concat(loanId, ":"), error_6);
                        return [2 /*return*/, []];
                    case 8: return [2 /*return*/];
                }
            });
        });
    },
    // Get documents for a specific loan by category
    getDocumentsByCategory: function (loanId, category) { return __awaiter(void 0, void 0, void 0, function () {
        var loanDocs;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, exports.loanDocumentService.getDocumentsForLoan(loanId)];
                case 1:
                    loanDocs = _a.sent();
                    return [2 /*return*/, loanDocs.filter(function (doc) { return doc.category === category; })];
            }
        });
    }); },
    // Get documents for a specific loan by section
    getDocumentsBySection: function (loanId, section) { return __awaiter(void 0, void 0, void 0, function () {
        var loanDocs;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, exports.loanDocumentService.getDocumentsForLoan(loanId)];
                case 1:
                    loanDocs = _a.sent();
                    return [2 /*return*/, loanDocs.filter(function (doc) { return doc.section === section; })];
            }
        });
    }); },
    // Get document by ID
    getDocumentById: function (docId_1) {
        var args_1 = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args_1[_i - 1] = arguments[_i];
        }
        return __awaiter(void 0, __spreadArray([docId_1], args_1, true), void 0, function (docId, includeContent) {
            var dbAvailable, doc, dbError_2, allDocs, error_7;
            if (includeContent === void 0) { includeContent = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        dbAvailable = false;
                        if (!(isServer && USE_DATABASE)) return [3 /*break*/, 2];
                        return [4 /*yield*/, isDatabaseAvailable()];
                    case 1:
                        dbAvailable = _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!(dbAvailable && documentDatabaseService)) return [3 /*break*/, 6];
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        // Attempt to get document from database
                        console.log("Getting document with ID ".concat(docId, " from database"));
                        return [4 /*yield*/, documentDatabaseService.getDocumentById(docId, includeContent)];
                    case 4:
                        doc = _a.sent();
                        // If we found the document in the database, return it
                        if (doc) {
                            console.log("Found document ".concat(docId, " in database"));
                            return [2 /*return*/, doc];
                        }
                        return [3 /*break*/, 6];
                    case 5:
                        dbError_2 = _a.sent();
                        console.error("Error getting document ".concat(docId, " from database:"), dbError_2);
                        return [3 /*break*/, 6];
                    case 6:
                        // Fallback to localStorage
                        console.log("Getting document with ID ".concat(docId, " from localStorage"));
                        allDocs = exports.loanDocumentService.getAllDocuments();
                        return [2 /*return*/, allDocs.find(function (doc) { return doc.id === docId; }) || null];
                    case 7:
                        error_7 = _a.sent();
                        console.error("Error getting document with ID ".concat(docId, ":"), error_7);
                        return [2 /*return*/, null];
                    case 8: return [2 /*return*/];
                }
            });
        });
    },
    // Add a document
    addDocument: function (document) {
        var allDocs = exports.loanDocumentService.getAllDocuments();
        // Determine if this is an uploaded document or a persistent generated document
        // Modified logic to handle both UPLOAD_ prefixes and SAMPLE_ with PERSISTENT marker
        var isPersistentDoc = document.filename.startsWith('UPLOAD_') ||
            (document.filename.startsWith('SAMPLE_PERSISTENT_')) ||
            (!document.filename.startsWith('SAMPLE_') && document.status !== 'required');
        // Filter existing documents
        var filteredDocs = allDocs;
        if (isPersistentDoc) {
            // For user uploads and persistent generated docs: 
            // 1. Remove any documents with the same docType AND filename
            // 2. Keep other documents with the same docType but different filename
            filteredDocs = allDocs.filter(function (doc) {
                return !(doc.loanId === document.loanId &&
                    doc.docType === document.docType &&
                    doc.filename === document.filename);
            });
            console.log("For persistent document: Filtered to ".concat(filteredDocs.length, " documents"));
        }
        else {
            // For temporary generated docs: replace any with the same docType
            filteredDocs = allDocs.filter(function (doc) {
                return !(doc.loanId === document.loanId && doc.docType === document.docType);
            });
            console.log("For temporary doc: Removed ".concat(allDocs.length - filteredDocs.length, " existing documents with docType ").concat(document.docType));
        }
        // Add the new document
        filteredDocs.push(document);
        // Save to localStorage
        try {
            localStorage.setItem(LOAN_DOCUMENTS_STORAGE_KEY, JSON.stringify(filteredDocs));
            console.log("Successfully saved document ".concat(document.filename, " to localStorage"));
        }
        catch (error) {
            console.error('Error saving document to localStorage:', error);
        }
        return document;
    },
    // Update a document
    updateDocument: function (document) { return __awaiter(void 0, void 0, void 0, function () {
        var dbAvailable, updated, dbError_3, allDocs, docIndex, error_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!document.id) {
                        console.error('Cannot update document without ID');
                        return [2 /*return*/, false];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 8, , 9]);
                    dbAvailable = false;
                    if (!(isServer && USE_DATABASE)) return [3 /*break*/, 3];
                    return [4 /*yield*/, isDatabaseAvailable()];
                case 2:
                    dbAvailable = _a.sent();
                    _a.label = 3;
                case 3:
                    updated = false;
                    if (!(dbAvailable && documentDatabaseService)) return [3 /*break*/, 7];
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, documentDatabaseService.updateDocument(document)];
                case 5:
                    // Update in database
                    updated = _a.sent();
                    console.log("Document ".concat(document.id, " ").concat(updated ? 'updated in' : 'not found in', " database"));
                    return [3 /*break*/, 7];
                case 6:
                    dbError_3 = _a.sent();
                    console.error("Error updating document ".concat(document.id, " in database:"), dbError_3);
                    return [3 /*break*/, 7];
                case 7:
                    allDocs = exports.loanDocumentService.getAllDocuments();
                    docIndex = allDocs.findIndex(function (doc) { return doc.id === document.id; });
                    if (docIndex >= 0) {
                        allDocs[docIndex] = __assign(__assign({}, allDocs[docIndex]), document);
                        localStorage.setItem(LOAN_DOCUMENTS_STORAGE_KEY, JSON.stringify(allDocs));
                        console.log("Document ".concat(document.id, " updated in localStorage"));
                        updated = true;
                    }
                    return [2 /*return*/, updated];
                case 8:
                    error_8 = _a.sent();
                    console.error("Error updating document ".concat(document.id, ":"), error_8);
                    return [2 /*return*/, false];
                case 9: return [2 /*return*/];
            }
        });
    }); },
    // Delete a document
    deleteDocument: function (docId) { return __awaiter(void 0, void 0, void 0, function () {
        var dbAvailable, deleted, dbError_4, allDocs, docIndex, error_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 8]);
                    dbAvailable = false;
                    if (!(isServer && USE_DATABASE)) return [3 /*break*/, 2];
                    return [4 /*yield*/, isDatabaseAvailable()];
                case 1:
                    dbAvailable = _a.sent();
                    _a.label = 2;
                case 2:
                    deleted = false;
                    if (!(dbAvailable && documentDatabaseService)) return [3 /*break*/, 6];
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, documentDatabaseService.deleteDocument(docId)];
                case 4:
                    // Delete from database
                    deleted = _a.sent();
                    console.log("Document ".concat(docId, " ").concat(deleted ? 'deleted from' : 'not found in', " database"));
                    return [3 /*break*/, 6];
                case 5:
                    dbError_4 = _a.sent();
                    console.error("Error deleting document ".concat(docId, " from database:"), dbError_4);
                    return [3 /*break*/, 6];
                case 6:
                    allDocs = exports.loanDocumentService.getAllDocuments();
                    docIndex = allDocs.findIndex(function (doc) { return doc.id === docId; });
                    if (docIndex >= 0) {
                        allDocs.splice(docIndex, 1);
                        localStorage.setItem(LOAN_DOCUMENTS_STORAGE_KEY, JSON.stringify(allDocs));
                        console.log("Document ".concat(docId, " deleted from localStorage"));
                        deleted = true;
                    }
                    return [2 /*return*/, deleted];
                case 7:
                    error_9 = _a.sent();
                    console.error("Error deleting document ".concat(docId, ":"), error_9);
                    return [2 /*return*/, false];
                case 8: return [2 /*return*/];
            }
        });
    }); },
    // Update document status
    updateDocumentStatus: function (docId, status) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, exports.loanDocumentService.updateDocument({ id: docId, status: status })];
        });
    }); },
    // Get missing required documents for a loan
    getMissingRequiredDocuments: function (loanId, loanType) {
        try {
            // Get all required document types for this loan type
            var requiredDocTypes = (0, loanDocumentStructure_1.getRequiredDocuments)(loanType);
            // Get existing documents for this loan
            var existingDocs = exports.loanDocumentService.getDocumentsForLoan(loanId);
            // Get existing document types
            var existingDocTypes_1 = existingDocs.map(function (doc) { return doc.docType; });
            // Filter out document types that already exist
            var missingDocTypes = requiredDocTypes.filter(function (doc) { return !existingDocTypes_1.includes(doc.docType); });
            // Create placeholder documents for each missing type
            return missingDocTypes.map(function (docType) { return ({
                id: (0, uuid_1.v4)(),
                loanId: loanId,
                filename: "SAMPLE_".concat(docType.label, ".html"),
                dateUploaded: new Date().toISOString(),
                category: docType.category,
                section: docType.section,
                subsection: docType.subsection,
                docType: docType.docType,
                status: 'required',
                isRequired: true,
                version: 1
            }); });
        }
        catch (error) {
            console.error('Error getting missing required documents:', error);
            return [];
        }
    },
    // Initialize documents for a new loan
    initializeDocumentsForLoan: function (loanId, loanType) {
        try {
            console.log("Initializing documents for loan ".concat(loanId, " with type ").concat(loanType));
            // Get all required document types for this loan type
            var requiredDocTypes = (0, loanDocumentStructure_1.getRequiredDocuments)(loanType);
            // Get existing documents from storage
            var existingDocs_1 = exports.loanDocumentService.getAllDocuments();
            var existingLoanDocs = existingDocs_1.filter(function (doc) { return doc.loanId === loanId; });
            // Create placeholder documents only for docTypes that don't have any persistent documents
            var placeholderDocs = [];
            var _loop_1 = function (docType) {
                // Check if there's already a persistent document for this docType
                var hasExistingDocument = existingLoanDocs.some(function (doc) {
                    return doc.docType === docType.docType &&
                        (doc.status !== 'required' ||
                            doc.filename.startsWith('UPLOAD_') ||
                            doc.filename.startsWith('SAMPLE_PERSISTENT_') ||
                            doc.filename.startsWith('SAMPLE_'));
                });
                // If no existing document, create a placeholder
                if (!hasExistingDocument) {
                    placeholderDocs.push({
                        id: (0, uuid_1.v4)(),
                        loanId: loanId,
                        filename: "SAMPLE_".concat(docType.label, ".html"),
                        dateUploaded: new Date().toISOString(),
                        category: docType.category,
                        section: docType.section,
                        subsection: docType.subsection,
                        docType: docType.docType,
                        status: 'required',
                        isRequired: true,
                        version: 1
                    });
                }
            };
            for (var _i = 0, requiredDocTypes_1 = requiredDocTypes; _i < requiredDocTypes_1.length; _i++) {
                var docType = requiredDocTypes_1[_i];
                _loop_1(docType);
            }
            // Filter out any exact duplicates that already exist
            var nonDuplicateDocs = placeholderDocs.filter(function (newDoc) {
                return !existingDocs_1.some(function (existingDoc) {
                    return existingDoc.loanId === loanId &&
                        existingDoc.docType === newDoc.docType &&
                        existingDoc.status === newDoc.status;
                });
            });
            console.log("Created ".concat(nonDuplicateDocs.length, " new placeholder documents out of ").concat(requiredDocTypes.length, " required document types"));
            // Save the combined documents
            if (nonDuplicateDocs.length > 0) {
                localStorage.setItem(LOAN_DOCUMENTS_STORAGE_KEY, JSON.stringify(__spreadArray(__spreadArray([], existingDocs_1, true), nonDuplicateDocs, true)));
            }
            return nonDuplicateDocs;
        }
        catch (error) {
            console.error('Error initializing documents for loan:', error);
            return [];
        }
    },
    // Get document completion status for a loan
    getDocumentCompletionStatus: function (loanId, loanType) {
        try {
            // Get all required document types for this loan type
            var requiredDocTypes_2 = (0, loanDocumentStructure_1.getRequiredDocuments)(loanType);
            // Get existing documents for this loan
            var existingDocs_2 = exports.loanDocumentService.getDocumentsForLoan(loanId);
            // Count total required document types (sockets)
            var total = requiredDocTypes_2.length;
            // Get unique docTypes that have at least one document (status not 'required')
            // This counts each document socket only once, regardless of how many documents it contains
            var uniqueCompletedDocTypes = new Set(existingDocs_2
                .filter(function (doc) { return doc.status !== 'required'; })
                .map(function (doc) { return doc.docType; }));
            // Count completed document sockets (those with at least one document)
            var completed = __spreadArray([], uniqueCompletedDocTypes, true).filter(function (docType) {
                return requiredDocTypes_2.some(function (rt) { return rt.docType === docType; });
            }).length;
            // Calculate completion percentage
            var percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
            // Calculate completion by category
            var byCategory_1 = {};
            // Initialize categories
            var categories = ['borrower', 'property', 'closing', 'servicing', 'misc'];
            categories.forEach(function (category) {
                var categoryRequiredDocs = requiredDocTypes_2.filter(function (doc) { return doc.category === category; });
                var categoryTotal = categoryRequiredDocs.length;
                // Get unique docTypes in this category that have at least one document
                var categoryCompletedDocTypes = new Set(existingDocs_2
                    .filter(function (doc) { return doc.category === category && doc.status !== 'required'; })
                    .map(function (doc) { return doc.docType; }));
                // Count document sockets that have at least one document
                var categoryCompleted = __spreadArray([], categoryCompletedDocTypes, true).filter(function (docType) {
                    return categoryRequiredDocs.some(function (rt) { return rt.docType === docType; });
                }).length;
                var categoryPercentage = categoryTotal > 0 ? Math.round((categoryCompleted / categoryTotal) * 100) : 0;
                byCategory_1[category] = {
                    total: categoryTotal,
                    completed: categoryCompleted,
                    percentage: categoryPercentage
                };
            });
            return {
                total: total,
                completed: completed,
                percentage: percentage,
                byCategory: byCategory_1
            };
        }
        catch (error) {
            console.error('Error getting document completion status:', error);
            return {
                total: 0,
                completed: 0,
                percentage: 0,
                byCategory: {
                    borrower: { total: 0, completed: 0, percentage: 0 },
                    property: { total: 0, completed: 0, percentage: 0 },
                    closing: { total: 0, completed: 0, percentage: 0 },
                    servicing: { total: 0, completed: 0, percentage: 0 },
                    misc: { total: 0, completed: 0, percentage: 0 }
                }
            };
        }
    },
    // Generate fake documents for a loan
    generateFakeDocuments: function (loanId, loanType) { return __awaiter(void 0, void 0, void 0, function () {
        var loan, requiredDocTypes, fakeDocuments, _i, requiredDocTypes_3, docType, docId, fileSize, fakeDocument, allExistingDocs, dbInitialized, insertedCount, dbError_5, error_10;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    loan = loanDatabase_1.loanDatabase.getLoanById(loanId);
                    if (!loan) {
                        console.error("Cannot generate fake documents: loan ".concat(loanId, " not found"));
                        return [2 /*return*/, []];
                    }
                    console.log("Generating fake documents for loan ".concat(loanId, " of type ").concat(loanType));
                    requiredDocTypes = (0, loanDocumentStructure_1.getRequiredDocuments)(loanType);
                    fakeDocuments = [];
                    // For each document type, create a fake document
                    for (_i = 0, requiredDocTypes_3 = requiredDocTypes; _i < requiredDocTypes_3.length; _i++) {
                        docType = requiredDocTypes_3[_i];
                        docId = (0, uuid_1.v4)();
                        fileSize = getRandomFileSize();
                        fakeDocument = (0, loanDocumentStructure_1.createDocument)({
                            id: docId,
                            loanId: loanId,
                            docType: docType.docType,
                            filename: "SAMPLE_".concat(docType.docType, "-").concat(Math.floor(Math.random() * 10000), ".html"),
                            category: docType.category,
                            section: docType.section,
                            subsection: docType.subsection || '',
                            // Use a random status from the allowed fake status list
                            status: FAKE_DOCUMENT_STATUSES[Math.floor(Math.random() * FAKE_DOCUMENT_STATUSES.length)],
                            dateUploaded: new Date().toISOString(),
                            fileType: '.html', // Standardize on HTML for simpler development
                            fileSize: fileSize,
                            content: generateDocumentContent(docType.docType, loan),
                            isRequired: true,
                            version: 1
                        });
                        // Add to the fake documents array
                        fakeDocuments.push(fakeDocument);
                        // Save to localStorage if enabled
                        if (USE_LOCAL_STORAGE) {
                            allExistingDocs = exports.loanDocumentService.getAllDocuments();
                            allExistingDocs.push(fakeDocument);
                            localStorage.setItem(LOAN_DOCUMENTS_STORAGE_KEY, JSON.stringify(allExistingDocs));
                        }
                    }
                    if (!(isServer && USE_DATABASE)) return [3 /*break*/, 4];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, initializeDatabase()];
                case 2:
                    dbInitialized = _a.sent();
                    if (dbInitialized && documentDatabaseService) {
                        insertedCount = documentDatabaseService.bulkInsertDocuments(fakeDocuments);
                        console.log("Saved ".concat(insertedCount, " documents to SQLite database"));
                    }
                    else {
                        console.log('Database not available for storing documents');
                    }
                    return [3 /*break*/, 4];
                case 3:
                    dbError_5 = _a.sent();
                    console.error('Error saving documents to database:', dbError_5);
                    return [3 /*break*/, 4];
                case 4:
                    console.log("Generated and stored ".concat(fakeDocuments.length, " fake documents for loan ").concat(loanId));
                    return [2 /*return*/, fakeDocuments];
                case 5:
                    error_10 = _a.sent();
                    console.error("Error generating fake documents for loan ".concat(loanId, ":"), error_10);
                    return [2 /*return*/, []];
                case 6: return [2 /*return*/];
            }
        });
    }); },
    // Generate fake documents using simpleDocumentService
    generateFakeDocumentsUsingSimpleService: function (loanId_1, loanType_1) {
        var args_1 = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args_1[_i - 2] = arguments[_i];
        }
        return __awaiter(void 0, __spreadArray([loanId_1, loanType_1], args_1, true), void 0, function (loanId, loanType, existingFakeDocs) {
            var requiredDocTypes, existingSimpleDocs;
            if (existingFakeDocs === void 0) { existingFakeDocs = []; }
            return __generator(this, function (_a) {
                try {
                    console.log('Generating fake documents using simpleDocumentService');
                    requiredDocTypes = (0, loanDocumentStructure_1.getRequiredDocuments)(loanType);
                    existingSimpleDocs = simplifiedDocumentService_1.simpleDocumentService.getDocumentsForLoan(loanId);
                    console.log("Found ".concat(existingSimpleDocs.length, " existing documents"));
                    // Implementation to be added
                    return [2 /*return*/, existingFakeDocs];
                }
                catch (error) {
                    console.error('Error generating documents:', error);
                    return [2 /*return*/, existingFakeDocs];
                }
                return [2 /*return*/];
            });
        });
    },
    // Generate fake documents for all loans
    generateFakeDocumentsForAllLoans: function () { return __awaiter(void 0, void 0, void 0, function () {
        var loans, totalDocumentsGenerated, _i, loans_1, loan, fakeDocuments, error_11;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    loans = loanDatabase_1.loanDatabase.getLoans();
                    totalDocumentsGenerated = 0;
                    _i = 0, loans_1 = loans;
                    _a.label = 1;
                case 1:
                    if (!(_i < loans_1.length)) return [3 /*break*/, 4];
                    loan = loans_1[_i];
                    return [4 /*yield*/, exports.loanDocumentService.generateFakeDocuments(loan.id, loan.loanType)];
                case 2:
                    fakeDocuments = _a.sent();
                    totalDocumentsGenerated += fakeDocuments.length;
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, totalDocumentsGenerated];
                case 5:
                    error_11 = _a.sent();
                    console.error('Error generating fake documents for all loans:', error_11);
                    return [2 /*return*/, 0];
                case 6: return [2 /*return*/];
            }
        });
    }); },
    // Clear all documents (for testing and reset)
    clearAllDocuments: function () {
        localStorage.removeItem(LOAN_DOCUMENTS_STORAGE_KEY);
    },
    // Get documents for a specific loan - no longer deduplicates
    deduplicateLoanDocuments: function (loanId) {
        try {
            console.log("Getting documents for loan ".concat(loanId, " (deduplication removed)"));
            // Get all documents from localStorage
            var storedDocs = localStorage.getItem('loan_documents') || '[]';
            var allDocuments = JSON.parse(storedDocs);
            // Filter for the specific loan
            var loanDocuments = allDocuments.filter(function (doc) { return doc.loanId === loanId; });
            // Return without deduplication
            return loanDocuments;
        }
        catch (error) {
            console.error('Error getting loan documents:', error);
            return [];
        }
    }
};
// Run deduplication on all loans when this module loads
if (typeof window !== 'undefined') {
    // Set a timeout to allow the app to load first
    setTimeout(function () {
        try {
            // Get unique loan IDs from documents
            var allDocs = localStorage.getItem(LOAN_DOCUMENTS_STORAGE_KEY);
            if (allDocs) {
                var documents = JSON.parse(allDocs);
                var loanIds = new Set(documents.map(function (doc) { return doc.loanId; }));
                console.log("Running initial deduplication for ".concat(loanIds.size, " loans..."));
                // Deduplicate each loan's documents
                loanIds.forEach(function (loanId) {
                    exports.loanDocumentService.deduplicateLoanDocuments(loanId);
                });
            }
        }
        catch (error) {
            console.error('Error during initial document deduplication:', error);
        }
    }, 2000);
}
