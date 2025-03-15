import { PDFDocument } from 'pdf-lib';
import pdfParse from 'pdf-parse';
import { SimpleDocument } from './simplifiedDocumentService';

// Enhanced document types with more specific patterns and metadata
export const ENHANCED_DOCUMENT_TYPES = [
  {
    type: 'promissory_note',
    category: 'loan' as const,
    patterns: [
      'promissory note', 
      'promise to pay', 
      'loan note',
      'for value received',
      'the undersigned promises to pay',
      'payable without offset'
    ],
    extractFields: ['principal_amount', 'interest_rate', 'maturity_date', 'borrower_name'],
    title: 'Promissory Note'
  },
  {
    type: 'deed_of_trust',
    category: 'legal' as const,
    patterns: [
      'deed of trust', 
      'security instrument', 
      'mortgage deed',
      'grants and conveys',
      'power of sale',
      'substitution of trustee'
    ],
    extractFields: ['property_address', 'legal_description', 'borrower_name', 'trustee_name'],
    title: 'Deed of Trust'
  },
  {
    type: 'credit_report',
    category: 'financial' as const,
    patterns: [
      'credit report',
      'credit score',
      'fico',
      'transunion',
      'experian',
      'equifax',
      'inquiries',
      'payment history'
    ],
    extractFields: ['credit_score', 'borrower_name', 'report_date'],
    title: 'Credit Report'
  },
  {
    type: 'closing_disclosure',
    category: 'financial' as const,
    patterns: [
      'closing disclosure',
      'settlement statement',
      'closing statement',
      'loan terms',
      'projected payments',
      'closing cost details'
    ],
    extractFields: ['loan_amount', 'interest_rate', 'monthly_payment', 'closing_costs'],
    title: 'Closing Disclosure'
  },
  {
    type: 'property_appraisal',
    category: 'property' as const,
    patterns: [
      'appraisal report',
      'property valuation',
      'market value',
      'comparable sales',
      'subject property',
      'appraised value'
    ],
    extractFields: ['property_value', 'property_address', 'appraisal_date', 'appraiser_name'],
    title: 'Property Appraisal'
  },
  {
    type: 'income_verification',
    category: 'financial' as const,
    patterns: [
      'income verification',
      'employment verification',
      'pay stub',
      'w-2',
      'tax return',
      'profit and loss',
      'bank statement'
    ],
    extractFields: ['borrower_name', 'income_amount', 'employer_name', 'verification_date'],
    title: 'Income Verification'
  },
  {
    type: 'insurance_policy',
    category: 'legal' as const,
    patterns: [
      'insurance policy',
      'hazard insurance',
      'property insurance',
      'coverage amount',
      'policy number',
      'premium amount'
    ],
    extractFields: ['policy_number', 'coverage_amount', 'premium_amount', 'effective_date'],
    title: 'Insurance Policy'
  },
  {
    type: 'purchase_agreement',
    category: 'legal' as const,
    patterns: [
      'purchase agreement',
      'purchase contract',
      'real estate contract',
      'offer to purchase',
      'buyer and seller',
      'purchase price'
    ],
    extractFields: ['purchase_price', 'property_address', 'buyer_name', 'seller_name', 'closing_date'],
    title: 'Purchase Agreement'
  }
];

// Use machine learning-inspired confidence scoring
export async function classifyDocument(pdfBuffer: ArrayBuffer): Promise<{
  docType: string;
  category: 'loan' | 'legal' | 'financial' | 'property' | 'misc';
  title: string;
  confidence: number;
  extractionFields: string[];
}> {
  // Parse the PDF to extract text
  const pdfData = await pdfParse(Buffer.from(pdfBuffer));
  const text = pdfData.text.toLowerCase();
  
  // Calculate confidence scores for each document type
  const scores = ENHANCED_DOCUMENT_TYPES.map(docType => {
    // Count pattern matches
    const matchCount = docType.patterns.reduce((count, pattern) => {
      const regex = new RegExp(pattern, 'gi');
      const matches = text.match(regex);
      return count + (matches ? matches.length : 0);
    }, 0);
    
    // Calculate confidence (normalized score)
    const totalPatterns = docType.patterns.length;
    const confidence = Math.min(matchCount / (totalPatterns * 0.7), 1); 
    
    return {
      docType: docType.type,
      category: docType.category,
      title: docType.title,
      confidence,
      extractionFields: docType.extractFields
    };
  });
  
  // Sort by confidence score and return the highest
  scores.sort((a, b) => b.confidence - a.confidence);
  
  // If no good match, return a generic document type
  if (scores[0].confidence < 0.3) {
    return {
      docType: 'generic_document',
      category: 'misc' as const,
      title: 'Unclassified Document',
      confidence: 0.1,
      extractionFields: []
    };
  }
  
  return scores[0];
} 