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
var loanDocumentService_1 = require("../utilities/loanDocumentService");
var databaseService_1 = require("../services/databaseService");
var uuid_1 = require("uuid");
// Test constants
var TEST_LOAN_ID = "test-loan-".concat(Math.floor(Math.random() * 100));
var TEST_DOC_TYPE = 'loan_application';
// Create a sample document
function createSampleDocument() {
    return {
        id: (0, uuid_1.v4)(),
        loanId: TEST_LOAN_ID,
        filename: "SAMPLE_document-".concat(Math.floor(Math.random() * 10000), ".html"),
        docType: TEST_DOC_TYPE,
        status: 'pending',
        dateUploaded: new Date().toISOString(),
        isRequired: true,
        version: 1,
        category: 'borrower',
        section: 'personal_information',
        subsection: '',
        fileType: 'html',
        fileSize: 1024,
        content: "<html><body><h1>Sample Document</h1><p>This is a test document for loan ".concat(TEST_LOAN_ID, "</p></body></html>")
    };
}
// Test the loanDocumentService with database integration
function testLoanDocumentServiceWithDB() {
    return __awaiter(this, void 0, void 0, function () {
        var sampleDoc, addedDoc, retrievedDoc, loanDocs, updatedDoc, verifyDoc, deleteResult, deletedDoc, finalLoanDocs, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('=======================================================');
                    console.log('TESTING LOAN DOCUMENT SERVICE WITH DATABASE INTEGRATION');
                    console.log('=======================================================');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    // Step 1: Initialize the database
                    console.log('\n1. Initializing database...');
                    return [4 /*yield*/, databaseService_1.databaseService.initialize()];
                case 2:
                    _a.sent();
                    console.log('Database initialized successfully.');
                    // Step 2: Add a document using the loan document service
                    console.log('\n2. Adding a document using loanDocumentService...');
                    sampleDoc = createSampleDocument();
                    addedDoc = loanDocumentService_1.loanDocumentService.addDocument(sampleDoc);
                    console.log("Document added with ID: ".concat(addedDoc.id));
                    // Step 3: Retrieve the document by ID
                    console.log('\n3. Retrieving document by ID...');
                    retrievedDoc = loanDocumentService_1.loanDocumentService.getDocumentById(addedDoc.id, true);
                    if (retrievedDoc) {
                        console.log("Retrieved document: ".concat(retrievedDoc.id));
                        console.log("Filename: ".concat(retrievedDoc.filename));
                        console.log("DocType: ".concat(retrievedDoc.docType));
                        console.log("Content exists: ".concat(!!retrievedDoc.content));
                    }
                    else {
                        console.error('Failed to retrieve document!');
                    }
                    // Step 4: Get documents for loan
                    console.log('\n4. Getting documents for loan...');
                    loanDocs = loanDocumentService_1.loanDocumentService.getDocumentsForLoan(TEST_LOAN_ID);
                    console.log("Found ".concat(loanDocs.length, " documents for loan ").concat(TEST_LOAN_ID));
                    loanDocs.forEach(function (doc) {
                        console.log("- ".concat(doc.id, ": ").concat(doc.filename, " (").concat(doc.docType, ")"));
                    });
                    // Step 5: Update a document
                    console.log('\n5. Updating document status...');
                    return [4 /*yield*/, loanDocumentService_1.loanDocumentService.updateDocumentStatus(addedDoc.id, 'approved')];
                case 3:
                    updatedDoc = _a.sent();
                    if (updatedDoc) {
                        console.log("Updated document status: ".concat(updatedDoc.status));
                    }
                    else {
                        console.error('Failed to update document!');
                    }
                    // Step 6: Verify the update
                    console.log('\n6. Verifying document update...');
                    verifyDoc = loanDocumentService_1.loanDocumentService.getDocumentById(addedDoc.id);
                    if (verifyDoc) {
                        console.log("Verified document status: ".concat(verifyDoc.status));
                    }
                    else {
                        console.error('Failed to verify document update!');
                    }
                    // Step 7: Delete the document
                    console.log('\n7. Deleting document...');
                    deleteResult = loanDocumentService_1.loanDocumentService.deleteDocument(addedDoc.id);
                    console.log("Document deletion ".concat(deleteResult ? 'succeeded' : 'failed'));
                    // Step 8: Verify the deletion
                    console.log('\n8. Verifying document deletion...');
                    deletedDoc = loanDocumentService_1.loanDocumentService.getDocumentById(addedDoc.id);
                    console.log("Document exists after deletion: ".concat(!!deletedDoc));
                    // Step 9: Check documents for loan again
                    console.log('\n9. Getting documents for loan after deletion...');
                    finalLoanDocs = loanDocumentService_1.loanDocumentService.getDocumentsForLoan(TEST_LOAN_ID);
                    console.log("Found ".concat(finalLoanDocs.length, " documents for loan ").concat(TEST_LOAN_ID));
                    console.log('\n10. Closing database connection...');
                    databaseService_1.databaseService.close();
                    console.log('Database connection closed.');
                    console.log('\nTEST COMPLETED SUCCESSFULLY!');
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.error('Error during test:', error_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// Run the test
testLoanDocumentServiceWithDB();
