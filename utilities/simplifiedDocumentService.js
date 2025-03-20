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
exports.simpleDocumentService = void 0;
// utilities/simplifiedDocumentService.ts
var uuid_1 = require("uuid");
var clientDocumentService_1 = require("@/services/clientDocumentService");
// Constants for storage keys
var STORAGE_KEY = 'simple_documents';
var DB_NAME = 'offshoreAI_DocumentDB';
var CONTENT_STORE = 'documentContents';
var DB_VERSION = 1;
// IndexedDB setup and helper functions
var dbPromise = null;
var getDB = function () {
    if (dbPromise)
        return dbPromise;
    dbPromise = new Promise(function (resolve, reject) {
        if (!window.indexedDB) {
            console.error('This browser doesn\'t support IndexedDB');
            reject(new Error('IndexedDB not supported'));
            return;
        }
        var request = window.indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = function (event) {
            console.error('Error opening IndexedDB', event);
            reject(new Error('Error opening IndexedDB'));
        };
        request.onsuccess = function (event) {
            var db = event.target.result;
            resolve(db);
        };
        request.onupgradeneeded = function (event) {
            var db = event.target.result;
            // Create object store for document contents
            if (!db.objectStoreNames.contains(CONTENT_STORE)) {
                db.createObjectStore(CONTENT_STORE, { keyPath: 'id' });
                console.log('Created document content store');
            }
        };
    });
    return dbPromise;
};
// Store document content in IndexedDB
var storeContentInIndexedDB = function (id, content) { return __awaiter(void 0, void 0, void 0, function () {
    var db, transaction, store_1, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, getDB()];
            case 1:
                db = _a.sent();
                transaction = db.transaction([CONTENT_STORE], 'readwrite');
                store_1 = transaction.objectStore(CONTENT_STORE);
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var request = store_1.put({ id: id, content: content });
                        request.onsuccess = function () {
                            resolve();
                        };
                        request.onerror = function (event) {
                            console.error('Error storing content in IndexedDB', event);
                            reject(new Error('Failed to store content in IndexedDB'));
                        };
                    })];
            case 2:
                error_1 = _a.sent();
                console.error('Error accessing IndexedDB:', error_1);
                throw error_1;
            case 3: return [2 /*return*/];
        }
    });
}); };
// Get document content from IndexedDB
var getContentFromIndexedDB = function (id) { return __awaiter(void 0, void 0, void 0, function () {
    var db, transaction, store_2, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, getDB()];
            case 1:
                db = _a.sent();
                transaction = db.transaction([CONTENT_STORE], 'readonly');
                store_2 = transaction.objectStore(CONTENT_STORE);
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var request = store_2.get(id);
                        request.onsuccess = function () {
                            if (request.result) {
                                resolve(request.result.content);
                            }
                            else {
                                resolve(null);
                            }
                        };
                        request.onerror = function (event) {
                            console.error('Error retrieving content from IndexedDB', event);
                            reject(new Error('Failed to retrieve content from IndexedDB'));
                        };
                    })];
            case 2:
                error_2 = _a.sent();
                console.error('Error accessing IndexedDB:', error_2);
                return [2 /*return*/, null];
            case 3: return [2 /*return*/];
        }
    });
}); };
// Delete document content from IndexedDB
var deleteContentFromIndexedDB = function (id) { return __awaiter(void 0, void 0, void 0, function () {
    var db, transaction, store_3, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, getDB()];
            case 1:
                db = _a.sent();
                transaction = db.transaction([CONTENT_STORE], 'readwrite');
                store_3 = transaction.objectStore(CONTENT_STORE);
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var request = store_3.delete(id);
                        request.onsuccess = function () {
                            resolve();
                        };
                        request.onerror = function (event) {
                            console.error('Error deleting content from IndexedDB', event);
                            reject(new Error('Failed to delete content from IndexedDB'));
                        };
                    })];
            case 2:
                error_3 = _a.sent();
                console.error('Error accessing IndexedDB:', error_3);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
// Clear all contents from IndexedDB
var clearAllContentsFromIndexedDB = function () { return __awaiter(void 0, void 0, void 0, function () {
    var db, transaction, store_4, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, getDB()];
            case 1:
                db = _a.sent();
                transaction = db.transaction([CONTENT_STORE], 'readwrite');
                store_4 = transaction.objectStore(CONTENT_STORE);
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var request = store_4.clear();
                        request.onsuccess = function () {
                            console.log('All document contents cleared from IndexedDB');
                            resolve();
                        };
                        request.onerror = function (event) {
                            console.error('Error clearing contents from IndexedDB', event);
                            reject(new Error('Failed to clear contents from IndexedDB'));
                        };
                    })];
            case 2:
                error_4 = _a.sent();
                console.error('Error accessing IndexedDB:', error_4);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
// Old compressContent utility function - now we store full content in IndexedDB
// and just keep a placeholder in localStorage
var compressContent = function (content) {
    // Just store a placeholder in localStorage now that we use IndexedDB
    return '[Content stored in IndexedDB]';
};
// Helper function for document type classification
function classifyDocument(filename) {
    var lowerName = filename.toLowerCase();
    // Check if it's a chat document first
    if (lowerName.includes('hud') || lowerName.includes('example')) {
        return { docType: 'chat_document', category: 'chat' };
    }
    // Borrower Profile
    if (lowerName.includes('application') || lowerName.includes('form')) {
        return {
            docType: 'application_form',
            category: 'borrower',
            section: 'borrower_profile',
            subsection: 'borrower_information'
        };
    }
    if (lowerName.includes('id') || lowerName.includes('license') || lowerName.includes('passport')) {
        return {
            docType: 'government_id',
            category: 'borrower',
            section: 'borrower_profile',
            subsection: 'borrower_information'
        };
    }
    if (lowerName.includes('tax') && lowerName.includes('return')) {
        return {
            docType: 'tax_returns',
            category: 'financial',
            section: 'borrower_profile',
            subsection: 'financial_documentation'
        };
    }
    if (lowerName.includes('bank') && lowerName.includes('statement')) {
        return {
            docType: 'bank_statements',
            category: 'financial',
            section: 'borrower_profile',
            subsection: 'financial_documentation'
        };
    }
    // Property File
    if (lowerName.includes('appraisal')) {
        return {
            docType: 'appraisal_report',
            category: 'property',
            section: 'property_file',
            subsection: 'valuation'
        };
    }
    if (lowerName.includes('inspection')) {
        return {
            docType: 'inspection_report',
            category: 'property',
            section: 'property_file',
            subsection: 'property_condition'
        };
    }
    if (lowerName.includes('purchase') && lowerName.includes('contract')) {
        return {
            docType: 'purchase_contract',
            category: 'property',
            section: 'property_file',
            subsection: 'property_information'
        };
    }
    // Loan Documents
    if (lowerName.includes('note') || lowerName.includes('promissory')) {
        return {
            docType: 'promissory_note',
            category: 'loan',
            section: 'loan_documents',
            subsection: 'loan_agreement'
        };
    }
    if (lowerName.includes('deed') || lowerName.includes('trust') || lowerName.includes('mortgage')) {
        return {
            docType: 'deed_of_trust',
            category: 'legal',
            section: 'loan_documents',
            subsection: 'loan_agreement'
        };
    }
    if (lowerName.includes('disclosure') || lowerName.includes('closing')) {
        return {
            docType: 'closing_disclosure',
            category: 'loan',
            section: 'loan_documents',
            subsection: 'closing_documents'
        };
    }
    if (lowerName.includes('insurance')) {
        return {
            docType: 'insurance_certificates',
            category: 'loan',
            section: 'loan_documents',
            subsection: 'closing_documents'
        };
    }
    // Project Documentation
    if (lowerName.includes('budget') || lowerName.includes('renovation') || lowerName.includes('construction')) {
        return {
            docType: 'renovation_budget',
            category: 'project',
            section: 'project_documentation',
            subsection: 'fix_and_flip'
        };
    }
    if (lowerName.includes('lease') || lowerName.includes('rental')) {
        return {
            docType: 'lease_agreements',
            category: 'project',
            section: 'project_documentation',
            subsection: 'rental_commercial'
        };
    }
    // Default fallback
    return {
        docType: 'misc_document',
        category: 'misc'
    };
}
// Helper function to read file as base64
function readFileAsBase64(file) {
    return new Promise(function (resolve, reject) {
        var reader = new FileReader();
        reader.onload = function () {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
            }
            else {
                reject(new Error('Failed to convert file to base64'));
            }
        };
        reader.onerror = function () { return reject(reader.error); };
        // Use readAsDataURL instead of readAsArrayBuffer for PDFs
        reader.readAsDataURL(file);
    });
}
// Export the simplified document service that uses the client service
exports.simpleDocumentService = {
    // Get all documents
    getAllDocuments: function () {
        return clientDocumentService_1.clientDocumentService.getAllDocumentsSync();
    },
    // Get documents for a specific loan
    getDocumentsForLoan: function (loanId) {
        return clientDocumentService_1.clientDocumentService.getDocumentsForLoanSync(loanId);
    },
    // Get a document by ID
    getDocument: function (docId) {
        return clientDocumentService_1.clientDocumentService.getDocumentSync(docId);
    },
    // Save a document
    saveDocument: function (document) {
        return clientDocumentService_1.clientDocumentService.saveDocumentSync(document);
    },
    // Delete a document
    deleteDocument: function (docId) {
        try {
            console.log("Attempting to delete document: ".concat(docId));
            // Also try to delete content from IndexedDB if available
            try {
                deleteContentFromIndexedDB(docId)
                    .then(function () { return console.log("Deleted document content from IndexedDB: ".concat(docId)); })
                    .catch(function (err) { return console.warn("Could not delete content from IndexedDB: ".concat(err)); });
            }
            catch (err) {
                console.warn("Error attempting to delete from IndexedDB: ".concat(err));
            }
            // Delete from client service
            return clientDocumentService_1.clientDocumentService.deleteDocumentSync(docId);
        }
        catch (error) {
            console.error("Error deleting document ".concat(docId, ":"), error);
            return false;
        }
    },
    // Get chat documents
    getChatDocuments: function () {
        try {
            var allDocs = exports.simpleDocumentService.getAllDocuments();
            return allDocs.filter(function (doc) { return doc.category === 'chat'; });
        }
        catch (error) {
            console.error('Error getting chat documents:', error);
            return [];
        }
    },
    // Get document by ID with full content
    getDocumentById: function (docId) { return __awaiter(void 0, void 0, void 0, function () {
        var allDocs, doc, fullContent, indexedDBError_1, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    allDocs = exports.simpleDocumentService.getAllDocuments();
                    doc = allDocs.find(function (doc) { return doc.id === docId; });
                    if (!doc)
                        return [2 /*return*/, null];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, getContentFromIndexedDB(docId)];
                case 2:
                    fullContent = _a.sent();
                    if (fullContent) {
                        return [2 /*return*/, __assign(__assign({}, doc), { content: fullContent })];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    indexedDBError_1 = _a.sent();
                    console.warn('Failed to retrieve content from IndexedDB, using stored content');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, doc];
                case 5:
                    error_5 = _a.sent();
                    console.error('Error getting document by ID:', error_5);
                    return [2 /*return*/, null];
                case 6: return [2 /*return*/];
            }
        });
    }); },
    // Add a dedicated method for loan documents - no longer deduplicates, just returns documents
    deduplicateLoanDocuments: function (loanId) { return __awaiter(void 0, void 0, void 0, function () {
        var allDocs, loanDocs;
        return __generator(this, function (_a) {
            try {
                console.log("Getting documents for loan ".concat(loanId, " (deduplication removed)"));
                allDocs = exports.simpleDocumentService.getAllDocuments();
                loanDocs = allDocs.filter(function (doc) { return doc.loanId === loanId; });
                // Return all documents without deduplication
                return [2 /*return*/, loanDocs];
            }
            catch (error) {
                console.error('Error getting loan documents:', error);
                return [2 /*return*/, []];
            }
            return [2 /*return*/];
        });
    }); },
    // Function to sync documents from server storage to localStorage
    syncDocumentsFromServer: function (loanId) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            console.log("Starting document sync from server for loan ".concat(loanId || 'all', "..."));
            return [2 /*return*/, {
                    success: false,
                    message: "Server storage functionality has been removed. Using localStorage only.",
                    syncedCount: 0,
                    errorCount: 0
                }];
        });
    }); },
    // Modified addDocumentDirectly to use localStorage only
    addDocumentDirectly: function (document) { return __awaiter(void 0, void 0, void 0, function () {
        var existingDocs, duplicates, docId, _i, duplicates_1, dup, error_6, indexedDBSuccess, indexedDBError_2, storageDoc, dedupedDocs, trimmedDocs, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 11, , 12]);
                    existingDocs = exports.simpleDocumentService.getAllDocuments();
                    duplicates = existingDocs.filter(function (doc) {
                        return doc.loanId === document.loanId &&
                            doc.docType === document.docType;
                    });
                    docId = document.id || (0, uuid_1.v4)();
                    console.log("".concat(duplicates.length > 0 ? 'Replacing' : 'Creating new', " document for loanId=").concat(document.loanId, ", docType=").concat(document.docType, ", id=").concat(docId));
                    _i = 0, duplicates_1 = duplicates;
                    _a.label = 1;
                case 1:
                    if (!(_i < duplicates_1.length)) return [3 /*break*/, 6];
                    dup = duplicates_1[_i];
                    console.log("Removing existing document ".concat(dup.id, " of type ").concat(document.docType, " before creating new one"));
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, deleteContentFromIndexedDB(dup.id)];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_6 = _a.sent();
                    console.warn("Could not delete content from IndexedDB for document ".concat(dup.id, ":"), error_6);
                    return [3 /*break*/, 5];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6:
                    indexedDBSuccess = false;
                    _a.label = 7;
                case 7:
                    _a.trys.push([7, 9, , 10]);
                    return [4 /*yield*/, storeContentInIndexedDB(docId, document.content)];
                case 8:
                    _a.sent();
                    console.log("\u2705 Stored document content in IndexedDB: ".concat(docId));
                    indexedDBSuccess = true;
                    return [3 /*break*/, 10];
                case 9:
                    indexedDBError_2 = _a.sent();
                    console.error('Failed to store content in IndexedDB, falling back to compressed content', indexedDBError_2);
                    return [3 /*break*/, 10];
                case 10:
                    storageDoc = __assign(__assign({}, document), { id: docId, content: indexedDBSuccess
                            ? "[Content stored in IndexedDB - ID: ".concat(docId, "]")
                            : compressContent(document.content) });
                    dedupedDocs = existingDocs.filter(function (doc) {
                        return !(doc.loanId === document.loanId && doc.docType === document.docType);
                    });
                    // Add the new document
                    dedupedDocs.push(storageDoc);
                    // Save back to storage with robust error handling
                    try {
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(dedupedDocs));
                        console.log("\u2705 Added document to localStorage: ".concat(document.filename, " (ID: ").concat(docId, ")"));
                    }
                    catch (storageError) {
                        console.error('❌ localStorage issue during add, implementing cleanup', storageError);
                        try {
                            trimmedDocs = dedupedDocs.slice(Math.max(Math.floor(dedupedDocs.length / 3), dedupedDocs.length - 20));
                            localStorage.setItem(STORAGE_KEY, JSON.stringify(__spreadArray(__spreadArray([], trimmedDocs, true), [storageDoc], false)));
                            console.log("Trimmed documents to ".concat(trimmedDocs.length + 1, " and saved"));
                        }
                        catch (finalError) {
                            console.error('Failed to save document even after trimming:', finalError);
                            // As a last resort, just save this document
                            try {
                                localStorage.setItem(STORAGE_KEY, JSON.stringify([storageDoc]));
                            }
                            catch (lastError) {
                                console.error('All attempts to save to localStorage failed:', lastError);
                            }
                        }
                    }
                    // Return the original document with full content but update the ID to match what we stored
                    return [2 /*return*/, __assign(__assign({}, document), { id: docId, content: document.content // Return original with full content
                         })];
                case 11:
                    error_7 = _a.sent();
                    console.error('Error adding document directly:', error_7);
                    // Still return the document even if we couldn't save it
                    return [2 /*return*/, document];
                case 12: return [2 /*return*/];
            }
        });
    }); },
    // Modified addDocument to use localStorage only
    addDocument: function (file, loanId, classification) { return __awaiter(void 0, void 0, void 0, function () {
        var content, formattedContent, docType_1, category, section, subsection, autoClassification, allDocs, existingDocs, docId, _i, existingDocs_1, existingDoc, error_8, indexedDBError_3, newDoc, dedupedDocs, error_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 11, , 12]);
                    return [4 /*yield*/, readFileAsBase64(file)];
                case 1:
                    content = _a.sent();
                    formattedContent = content;
                    if (!content.startsWith('data:application/pdf')) {
                        // If FileReader didn't add the correct prefix, add it
                        formattedContent = "data:application/pdf;base64,".concat(content.replace(/^data:.*?;base64,/, ''));
                    }
                    docType_1 = 'misc_document';
                    category = 'misc';
                    section = undefined;
                    subsection = undefined;
                    if (loanId === 'chat-uploads') {
                        docType_1 = 'chat_document';
                        category = 'chat';
                    }
                    else if (classification) {
                        docType_1 = classification.docType;
                        category = classification.category;
                        section = classification.section;
                        subsection = classification.subsection;
                    }
                    else {
                        autoClassification = classifyDocument(file.name);
                        docType_1 = autoClassification.docType;
                        category = autoClassification.category;
                        section = autoClassification.section;
                        subsection = autoClassification.subsection;
                    }
                    allDocs = exports.simpleDocumentService.getAllDocuments();
                    existingDocs = loanId === 'chat-uploads'
                        ? [] // Empty array for chat uploads to keep all previous uploads
                        : allDocs.filter(function (doc) {
                            return doc.loanId === loanId &&
                                (doc.docType === docType_1 || doc.filename === file.name);
                        });
                    docId = (0, uuid_1.v4)();
                    _i = 0, existingDocs_1 = existingDocs;
                    _a.label = 2;
                case 2:
                    if (!(_i < existingDocs_1.length)) return [3 /*break*/, 7];
                    existingDoc = existingDocs_1[_i];
                    console.log("Removing existing document ".concat(existingDoc.id, " (").concat(existingDoc.filename, ") before adding new one"));
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, deleteContentFromIndexedDB(existingDoc.id)];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 5:
                    error_8 = _a.sent();
                    console.warn("Could not delete content from IndexedDB for document ".concat(existingDoc.id, ":"), error_8);
                    return [3 /*break*/, 6];
                case 6:
                    _i++;
                    return [3 /*break*/, 2];
                case 7:
                    _a.trys.push([7, 9, , 10]);
                    return [4 /*yield*/, storeContentInIndexedDB(docId, formattedContent)];
                case 8:
                    _a.sent();
                    console.log("\u2705 Stored document content in IndexedDB: ".concat(docId));
                    return [3 /*break*/, 10];
                case 9:
                    indexedDBError_3 = _a.sent();
                    console.error('Failed to store content in IndexedDB, falling back to compressed content', indexedDBError_3);
                    return [3 /*break*/, 10];
                case 10:
                    newDoc = {
                        id: docId,
                        loanId: loanId,
                        filename: file.name,
                        fileType: file.type || 'application/pdf',
                        fileSize: file.size,
                        dateUploaded: new Date().toISOString(),
                        category: category,
                        docType: docType_1,
                        status: 'pending',
                        content: compressContent(formattedContent), // Store placeholder in localStorage
                        section: section,
                        subsection: subsection
                    };
                    dedupedDocs = allDocs.filter(function (doc) {
                        return !(doc.loanId === loanId && (doc.docType === docType_1 || doc.filename === file.name));
                    });
                    // Add the new document
                    dedupedDocs.push(newDoc);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(dedupedDocs));
                    console.log("Document added successfully: ".concat(newDoc.filename, " (ID: ").concat(newDoc.id, ", Category: ").concat(newDoc.category, ")"));
                    return [2 /*return*/, __assign(__assign({}, newDoc), { content: formattedContent })];
                case 11:
                    error_9 = _a.sent();
                    console.error('Error adding document:', error_9);
                    return [2 /*return*/, null];
                case 12: return [2 /*return*/];
            }
        });
    }); },
    // Clear all documents (for testing)
    clearAllDocuments: function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_10;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    localStorage.removeItem(STORAGE_KEY);
                    // Also remove legacy document storage to prevent duplicates
                    localStorage.removeItem('simulated_loan_documents');
                    localStorage.removeItem('loan_documents');
                    localStorage.removeItem('extracted_document_data');
                    console.log('Cleared all document storage, including legacy storage');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, clearAllContentsFromIndexedDB()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_10 = _a.sent();
                    console.error('Error clearing IndexedDB contents:', error_10);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); },
    // Update document status
    updateDocumentStatus: function (docId, status, notes, assignedTo) { return __awaiter(void 0, void 0, void 0, function () {
        var allDocs, docIndex;
        return __generator(this, function (_a) {
            try {
                allDocs = exports.simpleDocumentService.getAllDocuments();
                docIndex = allDocs.findIndex(function (doc) { return doc.id === docId; });
                if (docIndex === -1)
                    return [2 /*return*/, null];
                allDocs[docIndex] = __assign(__assign({}, allDocs[docIndex]), { status: status, notes: notes || allDocs[docIndex].notes, assignedTo: assignedTo || allDocs[docIndex].assignedTo });
                localStorage.setItem(STORAGE_KEY, JSON.stringify(allDocs));
                return [2 /*return*/, allDocs[docIndex]];
            }
            catch (error) {
                console.error('Error updating document status:', error);
                return [2 /*return*/, null];
            }
            return [2 /*return*/];
        });
    }); },
    // Transfer documents from temporary loan ID to actual loan ID
    transferDocumentsToLoan: function (tempLoanId, actualLoanId) { return __awaiter(void 0, void 0, void 0, function () {
        var allDocs_1, transferredDocs_1, docsToTransfer;
        return __generator(this, function (_a) {
            try {
                allDocs_1 = exports.simpleDocumentService.getAllDocuments();
                transferredDocs_1 = [];
                docsToTransfer = allDocs_1.filter(function (doc) { return doc.loanId === tempLoanId; });
                if (docsToTransfer.length === 0) {
                    return [2 /*return*/, []];
                }
                // Update the loan ID for each document
                docsToTransfer.forEach(function (doc) {
                    var index = allDocs_1.findIndex(function (d) { return d.id === doc.id; });
                    if (index !== -1) {
                        allDocs_1[index] = __assign(__assign({}, allDocs_1[index]), { loanId: actualLoanId });
                        transferredDocs_1.push(allDocs_1[index]);
                    }
                });
                // Save the updated documents
                localStorage.setItem(STORAGE_KEY, JSON.stringify(allDocs_1));
                return [2 /*return*/, transferredDocs_1];
            }
            catch (error) {
                console.error('Error transferring documents:', error);
                return [2 /*return*/, []];
            }
            return [2 /*return*/];
        });
    }); },
    // Get document statistics for a loan
    getDocumentStats: function (loanId) {
        try {
            var loanDocs = exports.simpleDocumentService.getDocumentsForLoan(loanId);
            var stats_1 = {
                total: loanDocs.length,
                approved: loanDocs.filter(function (doc) { return doc.status === 'approved'; }).length,
                rejected: loanDocs.filter(function (doc) { return doc.status === 'rejected'; }).length,
                pending: loanDocs.filter(function (doc) { return doc.status === 'pending'; }).length,
                byCategory: {},
                byType: {}
            };
            // Count by category
            loanDocs.forEach(function (doc) {
                stats_1.byCategory[doc.category] = (stats_1.byCategory[doc.category] || 0) + 1;
                stats_1.byType[doc.docType] = (stats_1.byType[doc.docType] || 0) + 1;
            });
            return stats_1;
        }
        catch (error) {
            console.error('Error getting document stats:', error);
            return {
                total: 0,
                approved: 0,
                rejected: 0,
                pending: 0,
                byCategory: {},
                byType: {}
            };
        }
    },
    // Clear only chat documents
    clearChatDocuments: function () { return __awaiter(void 0, void 0, void 0, function () {
        var allDocs, nonChatDocs, chatDocs, _i, chatDocs_1, doc, error_11, error_12;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 8]);
                    allDocs = exports.simpleDocumentService.getAllDocuments();
                    nonChatDocs = allDocs.filter(function (doc) { return doc.category !== 'chat'; });
                    // Save the filtered documents back to localStorage
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(nonChatDocs));
                    chatDocs = allDocs.filter(function (doc) { return doc.category === 'chat'; });
                    _i = 0, chatDocs_1 = chatDocs;
                    _a.label = 1;
                case 1:
                    if (!(_i < chatDocs_1.length)) return [3 /*break*/, 6];
                    doc = chatDocs_1[_i];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, deleteContentFromIndexedDB(doc.id)];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_11 = _a.sent();
                    console.warn("Could not delete content from IndexedDB for document ".concat(doc.id, ":"), error_11);
                    return [3 /*break*/, 5];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6:
                    console.log("Cleared ".concat(chatDocs.length, " chat documents"));
                    return [3 /*break*/, 8];
                case 7:
                    error_12 = _a.sent();
                    console.error('Error clearing chat documents:', error_12);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    }); },
    // Update a document directly
    updateDocument: function (document) { return __awaiter(void 0, void 0, void 0, function () {
        var allDocs, index;
        return __generator(this, function (_a) {
            try {
                allDocs = exports.simpleDocumentService.getAllDocuments();
                index = allDocs.findIndex(function (d) { return d.id === document.id; });
                if (index !== -1) {
                    allDocs[index] = document;
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(allDocs));
                }
            }
            catch (error) {
                console.error('Error updating document:', error);
            }
            return [2 /*return*/];
        });
    }); },
    // Sync loan documents with the chat
    syncLoanDocumentsWithChat: function (loanId) { return __awaiter(void 0, void 0, void 0, function () {
        var allDocs_2, loanDocs;
        return __generator(this, function (_a) {
            try {
                allDocs_2 = exports.simpleDocumentService.getAllDocuments();
                loanDocs = allDocs_2.filter(function (doc) { return doc.loanId === loanId; });
                // Ensure each loan document is properly tagged for the chat
                loanDocs.forEach(function (doc) {
                    // Make sure the document has the correct loanId
                    doc.loanId = loanId;
                    // Update the document in storage
                    var index = allDocs_2.findIndex(function (d) { return d.id === doc.id; });
                    if (index !== -1) {
                        allDocs_2[index] = doc;
                    }
                });
                // Save all updates at once
                localStorage.setItem(STORAGE_KEY, JSON.stringify(allDocs_2));
                return [2 /*return*/, loanDocs];
            }
            catch (error) {
                console.error('Error syncing loan documents with chat:', error);
                return [2 /*return*/, []];
            }
            return [2 /*return*/];
        });
    }); },
    // Migration function
    migrateExistingDocuments: function () { return __awaiter(void 0, void 0, void 0, function () {
        var isMigrated, allDocs, metadataDocs;
        return __generator(this, function (_a) {
            try {
                isMigrated = localStorage.getItem('documents_migrated') === 'true';
                if (isMigrated) {
                    console.log('Documents have already been migrated, skipping migration.');
                    return [2 /*return*/, true];
                }
                console.log('Starting document migration...');
                allDocs = exports.simpleDocumentService.getAllDocuments();
                if (allDocs.length === 0) {
                    console.log('No documents found to migrate.');
                    localStorage.setItem('documents_migrated', 'true');
                    return [2 /*return*/, true];
                }
                console.log("Found ".concat(allDocs.length, " documents to process."));
                // No deduplication, just keep all documents
                console.log("Migration complete. Kept all ".concat(allDocs.length, " documents."));
                metadataDocs = allDocs.map(function (doc) { return (__assign(__assign({}, doc), { content: doc.content.length > 1000 ? doc.content.substring(0, 1000) + '...' : doc.content })); });
                // Store documents in localStorage
                localStorage.setItem(STORAGE_KEY, JSON.stringify(metadataDocs));
                localStorage.setItem('documents_migrated', 'true');
                return [2 /*return*/, true];
            }
            catch (error) {
                console.error('Error during document migration:', error);
                return [2 /*return*/, false];
            }
            return [2 /*return*/];
        });
    }); },
    // Initialize storage
    initializeStorage: function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_13;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    // Initialize IndexedDB
                    return [4 /*yield*/, getDB()];
                case 1:
                    // Initialize IndexedDB
                    _a.sent();
                    // Migrate existing documents if needed
                    return [4 /*yield*/, exports.simpleDocumentService.migrateExistingDocuments()];
                case 2:
                    // Migrate existing documents if needed
                    _a.sent();
                    console.log('Document storage initialized');
                    return [3 /*break*/, 4];
                case 3:
                    error_13 = _a.sent();
                    console.error('Error initializing document storage:', error_13);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); },
};
// Try to migrate existing documents when the module is loaded
if (typeof window !== 'undefined') {
    // Check if migration has been done
    if (!localStorage.getItem('indexeddb_migration_done')) {
        // Set a timeout to allow the app to load first
        setTimeout(function () {
            exports.simpleDocumentService.migrateExistingDocuments()
                .then(function () {
                localStorage.setItem('indexeddb_migration_done', 'true');
                console.log('Document migration completed and marked as done');
            })
                .catch(function (error) {
                console.error('Error completing document migration:', error);
            });
        }, 3000);
    }
    // Initialize storage when the application loads
    exports.simpleDocumentService.initializeStorage()
        .then(function () {
        console.log('Document storage initialized successfully');
    })
        .catch(function (error) {
        console.error('Failed to initialize document storage:', error);
    });
}
// Update document methods that need both storage types
// ... existing methods with minor adjustments as needed
