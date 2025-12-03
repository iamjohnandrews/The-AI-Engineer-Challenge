import { NextRequest, NextResponse } from 'next/server';
import { ChatRequest, ChatResponse } from '@/types/chat';

/**
 * Next.js API route handler that proxies chat requests to the FastAPI backend
 * This avoids CORS issues by making the request server-side
 */
export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    
    // Get the backend URL from environment variable or default to localhost
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    // Forward the request to the FastAPI backend
    const response = await fetch(`${backendUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      return NextResponse.json(
        { error: errorData.detail || `HTTP error! status: ${response.status}` },
        { status: response.status }
      );
    }

    const data: ChatResponse = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying chat request:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process request' },
      { status: 500 }
    );
  }
}

