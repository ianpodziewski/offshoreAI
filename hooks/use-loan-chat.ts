import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LoanData } from "@/utilities/loanGenerator";
import { simpleDocumentService } from "@/utilities/simplifiedDocumentService";

// Define message type for the loan-specific chat
interface LoanChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Storage key for loan documents
const LOAN_DOCUMENTS_STORAGE_KEY = 'loan_documents';

// Atlas Capital's underwriting guidelines
const ATLAS_CAPITAL_GUIDELINES = `
ATLAS CAPITAL PARTNERS UNDERWRITING GUIDELINES

COMPANY OVERVIEW
Atlas Capital Partners is a private money lender specializing in asset-based lending solutions for real estate investors. We provide short-term financing for residential and commercial investment properties with a focus on value-add opportunities.

LOAN PRODUCTS
Fix-and-Flip Program
- Loan Amount: $100,000 - $2,500,000
- LTV: Up to 75% of purchase price, 75% ARV
- Term: 6-24 months
- Interest Rate: Starting at 9.75%
- Points: 2-3 points
- Minimum Credit Score: 650

Rental/BRRRR Program
- Loan Amount: $100,000 - $3,000,000
- LTV: Up to 75% of purchase price or appraised value
- Term: 12-36 months
- Interest Rate: Starting at 8.75%
- Points: 1.5-2.5 points
- Minimum Credit Score: 680
- Minimum DSCR: 1.25

Bridge Loan Program
- Loan Amount: $250,000 - $5,000,000
- LTV: Up to 70% of current value
- Term: 3-18 months
- Interest Rate: Starting at 9.25%
- Points: 2-3 points
- Minimum Credit Score: 660

Construction Loan Program
- Loan Amount: $500,000 - $7,500,000
- LTV: Up to 65% of completed value
- LTC: Up to 80% of construction costs
- Term: 12-24 months
- Interest Rate: Starting at 10.25%
- Points: 2.5-3.5 points
- Minimum Credit Score: 680
- Construction Reserve: Required

Commercial Property Program
- Loan Amount: $250,000 - $10,000,000
- LTV: Up to 65% of purchase price or appraised value
- Term: 12-36 months
- Interest Rate: Starting at 9.5%
- Points: 2-3 points
- Minimum Credit Score: 680
- Minimum DSCR: 1.3

UNDERWRITING PROCESS
1. Initial Application & Pre-Qualification (24-48 hours)
2. Property Evaluation (3-5 business days)
3. Borrower Financial Analysis (2-3 business days)
4. Exit Strategy Validation (1-2 business days)
5. Final Underwriting & Approval (5-7 business days)
6. Closing Process (7-10 business days)

RISK TIER ADJUSTMENTS
- Tier 1: Experienced Investors (5+ successful similar projects)
- Tier 2: Intermediate Investors (2-4 successful similar projects)
- Tier 3: Novice Investors (0-1 successful similar projects)

PROPERTY TYPES
Acceptable: Single-family residences, Multi-family (2-4 units), Multi-family (5+ units), Mixed-use, Retail, Office, Industrial/warehouse, Self-storage, Hotel/motel (case by case)

Restricted: Owner-occupied primary residences, Properties under 500 square feet, Mobile or manufactured homes, Properties with environmental issues, Properties with severe structural damage, Condotels, Time-shares, Working farms/ranches, Gas stations, Properties with legal non-conforming use issues
`;

export default function useLoanChat(activeLoan: LoanData | null, loanDocuments: any[]) {
  // Independent state for the loan-specific chat
  const [messages, setMessages] = useState<LoanChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loanContext, setLoanContext] = useState<string>('');
  
  // Function to prepare loan context
  const prepareLoanContext = useCallback(() => {
    if (!activeLoan) return '';
    
    console.log(`Preparing context for loan: ${activeLoan.id}`);
    
    // Format loan data into a context string
    const loanContextStr = `
      Active Loan: ${activeLoan.id}
      Borrower: ${activeLoan.borrowerName}
      Loan Amount: $${activeLoan.loanAmount.toLocaleString()}
      Interest Rate: ${activeLoan.interestRate}%
      Property: ${activeLoan.propertyAddress}
      Property Type: ${activeLoan.propertyType.replace(/_/g, ' ')}
      Loan Status: ${activeLoan.status}
      Loan Type: ${activeLoan.loanType.replace(/_/g, ' ')}
      LTV: ${activeLoan.ltv}%
      ARV LTV: ${activeLoan.arv_ltv}%
      Credit Score: ${activeLoan.creditScore || 'Not available'}
      Borrower Experience: ${activeLoan.borrowerExperience || 'Not available'}
      Exit Strategy: ${activeLoan.exitStrategy.replace(/_/g, ' ')}
    `;
    
    // Add document information
    const documentContextStr = loanDocuments && loanDocuments.length > 0
      ? loanDocuments.map(doc => 
          `Document: ${doc.filename || doc.name}, Type: ${doc.docType || doc.type}`
        ).join('\n')
      : 'No documents available for this loan.';
    
    // Add Atlas Capital guidelines
    const fullContext = `${loanContextStr}\n\nDocuments:\n${documentContextStr}\n\nATLAS CAPITAL GUIDELINES:\n${ATLAS_CAPITAL_GUIDELINES}`;
    setLoanContext(fullContext);
    
    console.log('Loan context updated successfully with Atlas Capital guidelines');
    return fullContext;
  }, [activeLoan, loanDocuments]);
  
  // Initialize loan context when component mounts or loan changes
  useEffect(() => {
    if (activeLoan) {
      console.log(`Active loan detected: ${activeLoan.id}`);
      prepareLoanContext();
      
      // Add welcome message when loan changes
      setMessages([{
        role: 'assistant',
        content: `Welcome to the Atlas Capital Partners loan assistant for loan #${activeLoan.id}. I can help you with information about this specific loan and our lending guidelines.`,
        timestamp: new Date()
      }]);
    }
  }, [activeLoan?.id, prepareLoanContext]); 
  
  // Function to handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  }, []);
  
  // Function to store loan documents in localStorage
  const storeLoanDocuments = useCallback(async () => {
    if (!activeLoan || loanDocuments.length === 0) return;
    
    console.log(`Storing ${loanDocuments.length} documents for loan ${activeLoan.id} in localStorage`);
    
    try {
      // Get existing documents from localStorage
      let existingDocs = [];
      const storedDocsRaw = localStorage.getItem(LOAN_DOCUMENTS_STORAGE_KEY);
      if (storedDocsRaw) {
        existingDocs = JSON.parse(storedDocsRaw);
        // Filter out documents for this loan to avoid duplicates
        existingDocs = existingDocs.filter((doc: any) => doc.loanId !== activeLoan.id);
      }
      
      // Prepare documents for storage
      const docsToStore = loanDocuments.map(doc => {
        // Process HTML content to extract text
        let processedContent = doc.content || '';
        
        // If it's HTML content, try to extract the text
        if (typeof processedContent === 'string' && 
            (processedContent.includes('<html') || 
             processedContent.includes('<!DOCTYPE') || 
             processedContent.includes('<body'))) {
          try {
            // Create a DOM parser
            const parser = new DOMParser();
            const htmlDoc = parser.parseFromString(processedContent, 'text/html');
            
            // Extract text content
            processedContent = htmlDoc.body.textContent || '';
            
            // Look for specific sections in promissory notes
            if (doc.docType?.toLowerCase().includes('promissory') || 
                doc.fileName?.toLowerCase().includes('promissory')) {
              // Try to find interest rate information
              const interestRateMatch = processedContent.match(/interest\s+rate\s*(?:of|:)?\s*(\d+\.?\d*)\s*%/i);
              const principalMatch = processedContent.match(/principal\s*(?:amount|sum|:)?\s*(?:of)?\s*\$?\s*(\d+[,\d]*\.?\d*)/i);
              const termMatch = processedContent.match(/(?:term|duration|period)\s*(?:of|:)?\s*(\d+)\s*(?:months|years)/i);
              
              if (interestRateMatch || principalMatch || termMatch) {
                console.log(`Found key information in promissory note: ${doc.fileName}`);
                let keyInfo = "KEY INFORMATION EXTRACTED:\n";
                if (interestRateMatch) keyInfo += `Interest Rate: ${interestRateMatch[1]}%\n`;
                if (principalMatch) keyInfo += `Principal Amount: $${principalMatch[1]}\n`;
                if (termMatch) keyInfo += `Term: ${termMatch[1]} ${processedContent.match(/(\d+)\s*(months|years)/i)?.[2] || 'period'}\n`;
                
                // Add key information at the beginning of the content
                processedContent = keyInfo + "\n\nFULL DOCUMENT TEXT:\n" + processedContent;
              }
            }
          } catch (error) {
            console.error(`Error processing HTML content for ${doc.filename || doc.name}:`, error);
          }
        }
        
        return {
          loanId: activeLoan.id,
          docType: doc.docType || doc.type || 'unknown',
          fileName: doc.filename || doc.name || 'unnamed',
          content: processedContent,
          dateAdded: new Date().toISOString()
        };
      });
      
      // Combine with existing documents and store
      const allDocs = [...existingDocs, ...docsToStore];
      localStorage.setItem(LOAN_DOCUMENTS_STORAGE_KEY, JSON.stringify(allDocs));
      
      console.log(`Successfully stored ${docsToStore.length} documents for loan ${activeLoan.id}`);
    } catch (error) {
      console.error('Error storing loan documents:', error);
    }
  }, [activeLoan, loanDocuments]);
  
  // Function to handle form submission
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message to chat
    const userMessage: LoanChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Get loan documents from localStorage
      let documentContents = '';
      if (activeLoan) {
        try {
          const loanDocumentsRaw = localStorage.getItem(LOAN_DOCUMENTS_STORAGE_KEY);
          if (loanDocumentsRaw) {
            const loanDocuments = JSON.parse(loanDocumentsRaw);
            const documentsForLoan = loanDocuments.filter((doc: any) => doc.loanId === activeLoan.id);
            
            if (documentsForLoan.length > 0) {
              console.log(`Found ${documentsForLoan.length} documents for loan ${activeLoan.id}`);
              
              // Extract content from each document
              documentContents = documentsForLoan.map((doc: any) => {
                try {
                  // Check if this is a promissory note or other important document
                  const isImportantDoc = 
                    (doc.docType?.toLowerCase().includes('promissory') || 
                     doc.docType?.toLowerCase().includes('note') ||
                     doc.docType?.toLowerCase().includes('deed') ||
                     doc.docType?.toLowerCase().includes('agreement') ||
                     doc.fileName?.toLowerCase().includes('promissory') ||
                     doc.fileName?.toLowerCase().includes('note') ||
                     doc.fileName?.toLowerCase().includes('deed') ||
                     doc.fileName?.toLowerCase().includes('agreement'));
                  
                  // For important documents, include more content
                  const contentPreview = doc.content 
                    ? (isImportantDoc 
                        ? doc.content 
                        : doc.content.substring(0, 1000) + '...')
                    : 'No content available';
                  
                  return `Document: ${doc.fileName}, Type: ${doc.docType}\nContent: ${contentPreview}`;
                } catch (error) {
                  console.error(`Error extracting content from document ${doc.fileName}:`, error);
                  return `Document: ${doc.fileName} (content extraction failed)`;
                }
              }).join('\n\n');
            }
          }
        } catch (error) {
          console.error('Error retrieving loan documents:', error);
        }
      }
      
      // Enhance loan context with document contents and Atlas Capital guidelines
      const enhancedContext = documentContents 
        ? `${loanContext}\n\nDocument Contents:\n${documentContents}`
        : loanContext;
      
      // Prepare the API request with the enhanced loan context
      const apiRequestBody = {
        message: userMessage.content,
        loanContext: enhancedContext
      };
      
      // Make API call to your backend
      const response = await fetch('/api/loan-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiRequestBody),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response');
      }
      
      const data = await response.json();
      
      // Add assistant response to chat
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.message || "I'm sorry, I couldn't process your request.",
          timestamp: new Date()
        }
      ]);
    } catch (error) {
      console.error('Error getting response:', error);
      
      // Add error message
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm sorry, I encountered an error while processing your request.",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, loanContext, activeLoan]);
  
  // Function to clear chat messages
  const clearChat = useCallback(() => {
    if (activeLoan) {
      setMessages([{
        role: 'assistant',
        content: `Chat cleared. I'm still here to help with loan #${activeLoan.id}.`,
        timestamp: new Date()
      }]);
      
      // Also clear from localStorage
      localStorage.removeItem(`loanChat_${activeLoan.id}`);
    } else {
      setMessages([]);
    }
  }, [activeLoan]);
  
  // Save messages to localStorage when they change
  useEffect(() => {
    if (activeLoan && messages.length > 0) {
      localStorage.setItem(`loanChat_${activeLoan.id}`, JSON.stringify(messages));
    }
  }, [activeLoan, messages]);
  
  // Load stored messages from localStorage when loan changes
  useEffect(() => {
    if (activeLoan) {
      const storedMessages = localStorage.getItem(`loanChat_${activeLoan.id}`);
      if (storedMessages) {
        try {
          const parsedMessages = JSON.parse(storedMessages);
          if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
            setMessages(parsedMessages);
          }
        } catch (error) {
          console.error("Error parsing stored loan chat messages:", error);
        }
      }
    }
  }, [activeLoan?.id]);
  
  // Store loan documents in localStorage when loan changes
  useEffect(() => {
    if (activeLoan && loanDocuments.length > 0) {
      storeLoanDocuments();
    }
  }, [activeLoan?.id, loanDocuments, storeLoanDocuments]);
  
  return {
    messages,
    input,
    isLoading,
    loanContext,
    handleInputChange,
    handleSubmit,
    clearChat,
    prepareLoanContext
  };
} 