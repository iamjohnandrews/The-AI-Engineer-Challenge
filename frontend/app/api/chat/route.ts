import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Ensure this route is always treated as a serverless function
// VERSION: 2025-12-04 - Direct OpenAI call, no proxy
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
  console.log('[API] POST /api/chat called - Direct OpenAI call (no proxy)');
  console.log('[API] Request method:', request.method);
  console.log('[API] Request URL:', request.url);
  try {
    const body: ChatRequest = await request.json();
    console.log('[API] Request body parsed:', { hasMessage: !!body.message });
    
    if (!body.message || typeof body.message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request: message is required' },
        { status: 400 }
      );
    }
    
    // Debug: Check all environment variables
    console.log('[API] Environment check:');
    console.log('[API] All process.env keys:', Object.keys(process.env).filter(k => k.includes('OPENAI') || k.includes('NEXT')));
    console.log('[API] process.env.OPENAI_API_KEY exists:', 'OPENAI_API_KEY' in process.env);
    
    const apiKey = process.env.OPENAI_API_KEY;
    console.log('[API] API key check:', { 
      hasKey: !!apiKey, 
      keyLength: apiKey?.length || 0,
      keyType: typeof apiKey,
      keyFirstChars: apiKey ? `${apiKey.substring(0, 10)}...` : 'N/A'
    });
    
    // Also check NEXT_PUBLIC_ prefixed version (though it shouldn't be needed for server-side)
    const publicApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    console.log('[API] NEXT_PUBLIC_OPENAI_API_KEY check:', { 
      hasKey: !!publicApiKey, 
      keyLength: publicApiKey?.length || 0 
    });
    
    if (!apiKey) {
      console.error('[API] OPENAI_API_KEY is missing!');
      console.error('[API] Available env vars:', Object.keys(process.env).slice(0, 50));
      return NextResponse.json(
        { error: 'OPENAI_API_KEY not configured. Please set it in Vercel environment variables.' },
        { status: 500 }
      );
    }

    console.log('[API] Initializing OpenAI client...');
    const client = new OpenAI({ 
      apiKey,
      baseURL: 'https://api.openai.com/v1'
    });

    console.log('[API] Calling OpenAI API...');
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a supportive mental coach.' },
        { role: 'user', content: body.message },
      ],
    });

    const reply = response.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    console.log('[API] OpenAI response received, reply length:', reply.length);
    
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
