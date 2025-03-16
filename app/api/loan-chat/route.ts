import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request format. Messages array is required.' },
        { status: 400 }
      );
    }

    // Log the incoming request for debugging
    console.log('Loan-specific chat request received:', {
      messageCount: messages.length,
      firstFewMessages: messages.slice(0, 2).map(m => ({ role: m.role, contentPreview: m.content.substring(0, 50) }))
    });

    // Check if we have a system message with document content
    const hasDocumentContent = messages.some(m => 
      m.role === 'system' && 
      (m.content.includes('Content:') || m.content.includes('Extracted Data:'))
    );

    console.log(`Request ${hasDocumentContent ? 'includes' : 'does not include'} document content`);

    // Prepare system instructions to help the model process document content
    const enhancedMessages = [...messages];
    
    if (hasDocumentContent) {
      // Add specific instructions for handling document content
      enhancedMessages.unshift({
        role: 'system',
        content: `You are a loan document assistant with access to loan details and document content. 
        When answering questions about specific document content:
        1. Focus on providing precise information from the documents.
        2. If you see interest rate information in the documents, prioritize that in your answers.
        3. When comparing loan details to document content, be explicit about what you find.
        4. If the document content is truncated or incomplete, acknowledge this limitation.
        5. Quote relevant sections from documents when appropriate.`
      });
    }

    // Call OpenAI API with appropriate model based on content
    const response = await openai.chat.completions.create({
      model: hasDocumentContent ? 'gpt-4-turbo' : 'gpt-3.5-turbo',
      messages: enhancedMessages,
      temperature: 0.5, // Lower temperature for more precise answers
      max_tokens: 2000, // Increased token limit for more detailed responses
    });

    // Extract the assistant's message
    const assistantMessage = response.choices[0]?.message?.content || 'No response generated.';

    // Return the response
    return NextResponse.json({
      message: assistantMessage,
      usage: response.usage,
      modelUsed: hasDocumentContent ? 'gpt-4-turbo' : 'gpt-3.5-turbo'
    });
  } catch (error) {
    console.error('Error in loan-specific chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 