import { NextRequest, NextResponse } from 'next/server';
import { ChatRequest, ChatResponse } from '@/types/chat';
import OpenAI from 'openai';

/**
 * Next.js API route handler that directly calls OpenAI
 * This runs as a Vercel serverless function - no separate backend needed!
 */

// Runtime configuration for Vercel
// Use Node.js runtime for OpenAI SDK compatibility
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Note: Vercel free tier has 10s timeout, Pro has up to 60s
// If you're on free tier and getting timeouts, consider upgrading or optimizing the prompt
export const maxDuration = 10;

// GET handler for testing
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'Chat API is working. Use POST to send messages.' 
  });
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    
    // Validate request body
    if (!body.message || typeof body.message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request: message is required' },
        { status: 400 }
      );
    }
    
    // Get OpenAI API key from environment variable
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error('OPENAI_API_KEY is not set in environment variables');
      return NextResponse.json(
        { error: 'OPENAI_API_KEY not configured. Please set it in Vercel environment variables.' },
        { status: 500 }
      );
    }

    // Initialize OpenAI client
    const client = new OpenAI({ apiKey });

    // Call OpenAI API directly
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a supportive mental coach.' },
        { role: 'user', content: body.message },
      ],
    });

    const reply = response.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    
    return NextResponse.json({ reply } as ChatResponse);
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    
    // Provide helpful error messages
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'Invalid OpenAI API key. Please check your Vercel environment variables.' },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { error: `Error: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to process request. Please try again.' },
      { status: 500 }
    );
  }
}

