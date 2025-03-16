import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Storage for loan documents
const LOAN_DOCUMENTS_STORAGE_KEY = 'loan_documents';

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    const { message, loanContext, loanId } = body;
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }
    
    // Get loan documents from storage
    let documentContents = '';
    if (loanId) {
      try {
        const loanDocumentsRaw = localStorage.getItem(LOAN_DOCUMENTS_STORAGE_KEY);
        if (loanDocumentsRaw) {
          const loanDocuments = JSON.parse(loanDocumentsRaw);
          const documentsForLoan = loanDocuments.filter((doc: any) => doc.loanId === loanId);
          
          if (documentsForLoan.length > 0) {
            console.log(`Found ${documentsForLoan.length} documents for loan ${loanId}`);
            
            // Extract content from each document
            documentContents = documentsForLoan.map((doc: any) => {
              try {
                // For simplicity, we're just using the filename and docType
                // In a real implementation, you would extract and process the actual content
                return `Document: ${doc.fileName}, Type: ${doc.docType}`;
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
    
    // Create system message with loan context and document contents
    const systemMessage = `You are a loan underwriting assistant. Your task is to help with loan analysis and provide information about the specific loan. 
    
Here is the context about the current loan:
${loanContext || 'No loan context provided.'}

${documentContents ? `Here are the documents associated with this loan:\n${documentContents}` : ''}

Respond only to questions related to this loan or general loan underwriting questions. If asked about other topics, politely redirect the conversation back to loan-related topics.`;
    
    // Create the messages array for the OpenAI API
    const messages = [
      { role: 'system', content: systemMessage },
      { role: 'user', content: message }
    ];
    
    console.log('Sending to OpenAI with system message:', systemMessage.substring(0, 200) + '...');
    
    // Call the OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 2000,
    });
    
    // Extract the assistant's response
    const assistantMessage = completion.choices[0]?.message?.content || 
      "I'm sorry, I couldn't generate a response.";
    
    // Return the response
    return NextResponse.json({
      message: assistantMessage
    });
  } catch (error) {
    console.error('Error in loan-chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 