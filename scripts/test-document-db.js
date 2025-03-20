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
// scripts/test-document-db.ts
var uuid_1 = require("uuid");
var databaseService_1 = require("../services/databaseService");
var documentDatabaseService_1 = require("../services/documentDatabaseService");
// Create a sample document for testing
function createSampleDocument() {
    return {
        id: (0, uuid_1.v4)(),
        loanId: 'test-loan-' + Math.floor(Math.random() * 1000),
        filename: 'SAMPLE_test-document.html',
        docType: 'loan_application',
        category: 'borrower',
        section: 'personal_information',
        subsection: 'Personal Information',
        status: 'pending',
        dateUploaded: new Date().toISOString(),
        fileType: '.html',
        fileSize: 1024,
        isRequired: true,
        version: 1,
        content: '<html><body><h1>Test Document</h1><p>This is a test document content.</p></body></html>',
        notes: 'Test document notes'
    };
}
// Test the document database service
function testDocumentDatabaseService() {
    return __awaiter(this, void 0, void 0, function () {
        var sampleDoc1, sampleDoc2, sampleDoc3, docId1, count, retrievedDoc, loanDocs, docCount, updateResult, updatedDoc, deleteResult, deletedDoc, docCountAfterDelete, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Testing document database service...');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    // Initialize the database
                    return [4 /*yield*/, databaseService_1.databaseService.initialize()];
                case 2:
                    // Initialize the database
                    _a.sent();
                    console.log('Database initialized successfully');
                    sampleDoc1 = createSampleDocument();
                    sampleDoc2 = createSampleDocument();
                    sampleDoc3 = createSampleDocument();
                    sampleDoc3.loanId = sampleDoc2.loanId; // Same loan ID for testing retrieval
                    // Test insert document
                    console.log('\nInserting sample document 1...');
                    docId1 = documentDatabaseService_1.documentDatabaseService.insertDocument(sampleDoc1);
                    console.log("Document inserted with ID: ".concat(docId1));
                    // Test bulk insert documents
                    console.log('\nBulk inserting sample documents 2 and 3...');
                    count = documentDatabaseService_1.documentDatabaseService.bulkInsertDocuments([sampleDoc2, sampleDoc3]);
                    console.log("".concat(count, " documents inserted"));
                    // Test get document by ID
                    console.log('\nRetrieving document by ID...');
                    retrievedDoc = documentDatabaseService_1.documentDatabaseService.getDocumentById(docId1, true);
                    console.log('Retrieved document:');
                    console.log("- ID: ".concat(retrievedDoc === null || retrievedDoc === void 0 ? void 0 : retrievedDoc.id));
                    console.log("- Filename: ".concat(retrievedDoc === null || retrievedDoc === void 0 ? void 0 : retrievedDoc.filename));
                    console.log("- Document Type: ".concat(retrievedDoc === null || retrievedDoc === void 0 ? void 0 : retrievedDoc.docType));
                    console.log("- Has Content: ".concat(!!(retrievedDoc === null || retrievedDoc === void 0 ? void 0 : retrievedDoc.content)));
                    // Test get documents for loan
                    console.log('\nRetrieving documents for loan...');
                    loanDocs = documentDatabaseService_1.documentDatabaseService.getDocumentsForLoan(sampleDoc2.loanId, false);
                    console.log("Found ".concat(loanDocs.length, " documents for loan ").concat(sampleDoc2.loanId));
                    loanDocs.forEach(function (doc, index) {
                        console.log("- Document ".concat(index + 1, ": ").concat(doc.filename, " (").concat(doc.docType, ")"));
                    });
                    // Test count documents for loan
                    console.log('\nCounting documents for loan...');
                    docCount = documentDatabaseService_1.documentDatabaseService.countDocumentsForLoan(sampleDoc2.loanId);
                    console.log("Count: ".concat(docCount, " documents for loan ").concat(sampleDoc2.loanId));
                    // Test update document
                    console.log('\nUpdating document...');
                    updateResult = documentDatabaseService_1.documentDatabaseService.updateDocument({
                        id: docId1,
                        status: 'approved',
                        notes: 'Updated test document notes'
                    });
                    console.log("Update result: ".concat(updateResult));
                    // Verify update
                    console.log('\nVerifying document update...');
                    updatedDoc = documentDatabaseService_1.documentDatabaseService.getDocumentById(docId1);
                    console.log("- Status: ".concat(updatedDoc === null || updatedDoc === void 0 ? void 0 : updatedDoc.status));
                    console.log("- Notes: ".concat(updatedDoc === null || updatedDoc === void 0 ? void 0 : updatedDoc.notes));
                    // Test delete document
                    console.log('\nDeleting document...');
                    deleteResult = documentDatabaseService_1.documentDatabaseService.deleteDocument(sampleDoc3.id);
                    console.log("Delete result: ".concat(deleteResult));
                    // Verify deletion
                    console.log('\nVerifying document deletion...');
                    deletedDoc = documentDatabaseService_1.documentDatabaseService.getDocumentById(sampleDoc3.id);
                    console.log("Document exists: ".concat(!!deletedDoc));
                    docCountAfterDelete = documentDatabaseService_1.documentDatabaseService.countDocumentsForLoan(sampleDoc2.loanId);
                    console.log("Count after deletion: ".concat(docCountAfterDelete, " documents for loan ").concat(sampleDoc2.loanId));
                    // Close the database connection
                    databaseService_1.databaseService.close();
                    console.log('\nDatabase connection closed.');
                    console.log('\nDocument database service test completed successfully!');
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error('Document database service test failed:', error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Run the test
testDocumentDatabaseService();
