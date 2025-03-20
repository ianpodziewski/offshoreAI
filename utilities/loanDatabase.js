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
exports.loanDatabase = void 0;
// utilities/loanDatabase.ts
var loanGenerator_1 = require("./loanGenerator");
var loanDocumentService_1 = require("./loanDocumentService");
var STORAGE_KEY = 'simulated_loans_db';
var DEFAULT_LOAN_COUNT = 9;
exports.loanDatabase = {
    generateLoan: loanGenerator_1.generateLoan,
    // Initialize the database with some sample loans
    initialize: function () {
        if (!localStorage.getItem(STORAGE_KEY)) {
            var initialLoans = (0, loanGenerator_1.generateLoans)(DEFAULT_LOAN_COUNT);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(initialLoans));
            // Don't generate documents automatically during initialization
            // initialLoans.forEach(loan => {
            //   loanDocumentService.generateFakeDocuments(loan.id, loan.loanType);
            // });
            console.log("Initialized loan database with ".concat(DEFAULT_LOAN_COUNT, " loans"));
        }
    },
    // Get all loans
    getLoans: function () {
        var loansJson = localStorage.getItem(STORAGE_KEY);
        return loansJson ? JSON.parse(loansJson) : [];
    },
    // Get a specific loan by ID
    getLoanById: function (id) {
        var loans = exports.loanDatabase.getLoans();
        return loans.find(function (loan) { return loan.id === id; }) || null;
    },
    // Add a new loan
    addLoan: function (loanData) {
        var newLoan = (0, loanGenerator_1.generateLoan)(loanData);
        var loans = exports.loanDatabase.getLoans();
        loans.push(newLoan);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(loans));
        // Don't generate documents automatically for new loans
        // loanDocumentService.generateFakeDocuments(newLoan.id, newLoan.loanType);
        return newLoan;
    },
    // Update an existing loan
    updateLoan: function (id, updates) {
        var loans = exports.loanDatabase.getLoans();
        var index = loans.findIndex(function (loan) { return loan.id === id; });
        if (index === -1)
            return null;
        loans[index] = __assign(__assign(__assign({}, loans[index]), updates), { dateModified: new Date().toISOString() });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(loans));
        return loans[index];
    },
    // Delete a loan
    deleteLoan: function (id) {
        var loans = exports.loanDatabase.getLoans();
        var filteredLoans = loans.filter(function (loan) { return loan.id !== id; });
        if (filteredLoans.length === loans.length)
            return false;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredLoans));
        return true;
    },
    // Reset the database (useful for testing)
    reset: function () {
        var args_1 = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args_1[_i] = arguments[_i];
        }
        return __awaiter(void 0, __spreadArray([], args_1, true), void 0, function (count) {
            var clearPromises, simplifiedDocService, clearPromise, error_1, initialLoans;
            if (count === void 0) { count = DEFAULT_LOAN_COUNT; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('Resetting database and clearing all documents...');
                        if (!(typeof localStorage !== 'undefined')) return [3 /*break*/, 4];
                        clearPromises = [];
                        // Clear document database using the loanDocumentService
                        try {
                            loanDocumentService_1.loanDocumentService.clearAllDocuments();
                            console.log('Cleared document service storage');
                        }
                        catch (error) {
                            console.warn('Error clearing document service:', error);
                        }
                        // Clear simplified document service
                        try {
                            simplifiedDocService = require('./simplifiedDocumentService').simpleDocumentService;
                            if (simplifiedDocService && typeof simplifiedDocService.clearAllDocuments === 'function') {
                                clearPromise = simplifiedDocService.clearAllDocuments()
                                    .then(function () {
                                    console.log('Successfully cleared simplified document service including IndexedDB');
                                    // Remove the migration flag to force a clean migration on next load
                                    localStorage.removeItem('indexeddb_migration_done');
                                })
                                    .catch(function (error) {
                                    console.warn('Error during simplified document service clearing:', error);
                                });
                                clearPromises.push(clearPromise);
                            }
                        }
                        catch (error) {
                            console.warn('Could not clear simplified document service:', error);
                        }
                        // Ensure all document-related localStorage keys are removed
                        try {
                            localStorage.removeItem('loan_documents');
                            localStorage.removeItem('simple_documents');
                            localStorage.removeItem('extracted_document_data');
                            localStorage.removeItem('indexeddb_migration_done');
                            console.log('Removed all document-related localStorage keys');
                        }
                        catch (error) {
                            console.warn('Error clearing localStorage keys:', error);
                        }
                        if (!(clearPromises.length > 0)) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, Promise.all(clearPromises)];
                    case 2:
                        _a.sent();
                        console.log('All document clearing operations completed');
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.warn('Error waiting for document clearing operations:', error_1);
                        return [3 /*break*/, 4];
                    case 4:
                        initialLoans = (0, loanGenerator_1.generateLoans)(count);
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialLoans));
                        console.log("Generated ".concat(count, " new loans"));
                        // Don't generate documents automatically during reset
                        // initialLoans.forEach(loan => {
                        //   loanDocumentService.generateFakeDocuments(loan.id, loan.loanType);
                        // });
                        console.log('Database reset complete');
                        return [2 /*return*/, initialLoans];
                }
            });
        });
    }
};
