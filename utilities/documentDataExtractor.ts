import pdfParse from 'pdf-parse';
import { SimpleDocument } from './simplifiedDocumentService';

// Regex patterns for different field types
const EXTRACTION_PATTERNS = {
  principal_amount: [
    /principal(?:\s+amount)?(?:\s+of)?\s+\$?([\d,]+(?:\.\d{2})?)/i,
    /(?:loan|note)(?:\s+amount)?(?:\s+of)?\s+\$?([\d,]+(?:\.\d{2})?)/i
  ],
  interest_rate: [
    /interest(?:\s+rate)?(?:\s+of)?\s+(\d+(?:\.\d+)?)(?:\s*%)/i,
    /(\d+(?:\.\d+)?)(?:\s*%)(?:\s+per\s+annum)?/i
  ],
  maturity_date: [
    /maturity\s+date\s+(?:of\s+)?([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i,
    /due\s+(?:on|by)?\s+([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i
  ],
  borrower_name: [
    /borrower(?:'s|\(s\))?(?:\s+name)?[:\s]+([A-Za-z\s]+)(?:,|\.|and)/i,
    /undersigned(?:,)?\s+([A-Za-z\s]+)(?:,|\.|and)/i
  ],
  property_address: [
    /property\s+(?:located\s+at|address)[:\s]+([0-9A-Za-z\s\.,]+)(?:\n|,|\.|;)/i,
    /real\s+property\s+(?:located\s+at)?[:\s]+([0-9A-Za-z\s\.,]+)(?:\n|,|\.|;)/i
  ],
  legal_description: [
    /legal\s+description[:\s]+([A-Za-z0-9\s\.,;()\-"']+?)(?:\n\n|\n[A-Z])/i
  ],
  trustee_name: [
    /trustee[:\s]+([A-Za-z\s]+)(?:,|\.|and)/i
  ],
  credit_score: [
    /credit\s+score[:\s]+(\d{3})/i,
    /fico[:\s]+(\d{3})/i,
    /score[:\s]+(\d{3})/i
  ],
  report_date: [
    /report\s+date[:\s]+([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i,
    /date\s+(?:of\s+)?report[:\s]+([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i
  ],
  loan_amount: [
    /loan\s+amount[:\s]+\$?([\d,]+(?:\.\d{2})?)/i
  ],
  monthly_payment: [
    /monthly\s+payment[:\s]+\$?([\d,]+(?:\.\d{2})?)/i,
    /payment[:\s]+\$?([\d,]+(?:\.\d{2})?)\s+(?:per\s+month|monthly)/i
  ],
  closing_costs: [
    /closing\s+costs?[:\s]+\$?([\d,]+(?:\.\d{2})?)/i,
    /total\s+closing\s+costs?[:\s]+\$?([\d,]+(?:\.\d{2})?)/i
  ],
  property_value: [
    /(?:appraised|market)\s+value[:\s]+\$?([\d,]+(?:\.\d{2})?)/i,
    /property\s+value[:\s]+\$?([\d,]+(?:\.\d{2})?)/i
  ],
  appraisal_date: [
    /appraisal\s+date[:\s]+([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i,
    /date\s+(?:of\s+)?appraisal[:\s]+([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i
  ],
  appraiser_name: [
    /appraiser[:\s]+([A-Za-z\s]+)(?:,|\.|and)/i,
    /appraiser(?:'s)?\s+name[:\s]+([A-Za-z\s]+)(?:,|\.|and)/i
  ],
  income_amount: [
    /(?:annual|monthly)\s+income[:\s]+\$?([\d,]+(?:\.\d{2})?)/i,
    /income[:\s]+\$?([\d,]+(?:\.\d{2})?)\s+(?:per\s+(?:year|month)|annually|monthly)/i
  ],
  employer_name: [
    /employer[:\s]+([A-Za-z\s\.,]+)(?:,|\.|and)/i,
    /employer(?:'s)?\s+name[:\s]+([A-Za-z\s\.,]+)(?:,|\.|and)/i
  ],
  verification_date: [
    /verification\s+date[:\s]+([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i,
    /date\s+(?:of\s+)?verification[:\s]+([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i
  ],
  policy_number: [
    /policy\s+(?:number|#)[:\s]+([A-Za-z0-9\-]+)/i
  ],
  coverage_amount: [
    /coverage(?:\s+amount)?[:\s]+\$?([\d,]+(?:\.\d{2})?)/i
  ],
  premium_amount: [
    /premium(?:\s+amount)?[:\s]+\$?([\d,]+(?:\.\d{2})?)/i
  ],
  effective_date: [
    /effective\s+date[:\s]+([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i
  ],
  purchase_price: [
    /purchase\s+price[:\s]+\$?([\d,]+(?:\.\d{2})?)/i,
    /(?:agreed|contract)\s+price[:\s]+\$?([\d,]+(?:\.\d{2})?)/i
  ],
  buyer_name: [
    /buyer(?:'s|\(s\))?(?:\s+name)?[:\s]+([A-Za-z\s]+)(?:,|\.|and)/i,
    /purchaser(?:'s|\(s\))?(?:\s+name)?[:\s]+([A-Za-z\s]+)(?:,|\.|and)/i
  ],
  seller_name: [
    /seller(?:'s|\(s\))?(?:\s+name)?[:\s]+([A-Za-z\s]+)(?:,|\.|and)/i
  ],
  closing_date: [
    /closing\s+date[:\s]+([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i,
    /settlement\s+date[:\s]+([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i
  ]
};

export async function extractDataFromDocument(
  document: SimpleDocument, 
  extractionFields: string[]
): Promise<Record<string, string>> {
  const extractedData: Record<string, string> = {};
  
  try {
    // Parse PDF content if it's base64 encoded
    let text = '';
    if (document.content.startsWith('data:application/pdf;base64,')) {
      const base64Data = document.content.replace(/^data:application\/pdf;base64,/, '');
      const pdfBuffer = Buffer.from(base64Data, 'base64');
      const pdfData = await pdfParse(pdfBuffer);
      text = pdfData.text;
    } else {
      // If it's already text content
      text = document.content;
    }
    
    // Extract data for each requested field
    for (const field of extractionFields) {
      if (field in EXTRACTION_PATTERNS) {
        const patterns = EXTRACTION_PATTERNS[field as keyof typeof EXTRACTION_PATTERNS];
        
        // Try each pattern until we find a match
        for (const pattern of patterns) {
          const match = text.match(pattern);
          if (match && match[1]) {
            extractedData[field] = match[1].trim();
            break;
          }
        }
      }
    }
    
    return extractedData;
  } catch (error) {
    console.error('Error extracting data from document:', error);
    return {};
  }
}

// Function to clean extracted data (remove commas from numbers, standardize dates, etc.)
export function cleanExtractedData(data: Record<string, string>): Record<string, string | number> {
  const cleanedData: Record<string, string | number> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (!value) continue;
    
    // Clean numeric values
    if (key.includes('amount') || key.includes('price') || key.includes('value')) {
      // Remove commas and convert to number
      const numericValue = parseFloat(value.replace(/,/g, ''));
      if (!isNaN(numericValue)) {
        cleanedData[key] = numericValue;
        continue;
      }
    }
    
    // Clean percentage values
    if (key.includes('rate')) {
      const percentValue = parseFloat(value.replace(/%/g, ''));
      if (!isNaN(percentValue)) {
        cleanedData[key] = percentValue;
        continue;
      }
    }
    
    // For other fields, just use the string value
    cleanedData[key] = value;
  }
  
  return cleanedData;
} 