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

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: messages,
      temperature: 0.7,
      max_tokens: 1500,
    });

    // Extract the assistant's message
    const assistantMessage = response.choices[0]?.message?.content || 'No response generated.';

    // Return the response
    return NextResponse.json({
      message: assistantMessage,
      usage: response.usage,
    });
  } catch (error) {
    console.error('Error in loan-specific chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 