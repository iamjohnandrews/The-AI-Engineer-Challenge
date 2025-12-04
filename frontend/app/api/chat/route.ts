import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Ensure this route is always treated as a serverless function
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 10;

interface ChatRequest {
  message: string;
}

interface ChatResponse {
  reply: string;
}

export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'Chat API is working. Use POST to send messages.' 
  });
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    
    if (!body.message || typeof body.message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request: message is required' },
        { status: 400 }
      );
    }
    
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY not configured. Please set it in Vercel environment variables.' },
        { status: 500 }
      );
    }

    const client = new OpenAI({ 
      apiKey,
      baseURL: 'https://api.openai.com/v1'
    });

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a supportive mental coach.' },
        { role: 'user', content: body.message },
      ],
    });

    const reply = response.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    
    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    
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
