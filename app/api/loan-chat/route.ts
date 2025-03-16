import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(req: NextRequest) {
  try {
    // Forward the request to the main chat API
    const response = await fetch(`${req.nextUrl.origin}/api/chat`, {
      method: 'POST',
      headers: req.headers,
      body: req.body,
    });
    
    // Return the response from the main chat API
    return response;
  } catch (error) {
    console.error('Error in loan-chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 