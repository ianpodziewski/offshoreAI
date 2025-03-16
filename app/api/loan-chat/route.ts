import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    const { message, loanContext } = body;
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }
    
    // Create system message with loan context
    const systemMessage = `You are a loan underwriting assistant. Your task is to help with loan analysis and provide information about the specific loan. 
    
Here is the context about the current loan:
${loanContext || 'No loan context provided.'}

When analyzing loan documents:
1. Pay special attention to interest rates, terms, and conditions in promissory notes
2. Look for specific details in legal documents that might be relevant to the user's question
3. If you find conflicting information between the loan data and documents, highlight this discrepancy
4. If document content is incomplete or unclear, acknowledge this limitation

Respond only to questions related to this loan or general loan underwriting questions. If asked about other topics, politely redirect the conversation back to loan-related topics.`;
    
    // Create the messages array for the OpenAI API
    const messages = [
      { role: 'system', content: systemMessage },
      { role: 'user', content: message }
    ];
    
    console.log('Sending to OpenAI with system message:', systemMessage.substring(0, 200) + '...');
    
    // Call the OpenAI API with increased max_tokens
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 4000,
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