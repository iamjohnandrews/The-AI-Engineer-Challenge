import { ChatRequest, ChatResponse } from '../types/chat';

/**
 * Sends a chat message to the backend API via Next.js API route
 * This uses the Next.js API route handler which proxies requests server-side,
 * avoiding CORS issues and providing better error handling
 * @param message - The user's message to send
 * @returns Promise resolving to the AI's reply
 * @throws Error if the API request fails
 */
export async function sendChatMessage(message: string): Promise<string> {
  const requestBody: ChatRequest = { message };
  
  try {
    // Use relative URL to call Next.js API route with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.detail || errorMessage;
      } catch {
        // If response isn't JSON, use the status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data: ChatResponse = await response.json();
    return data.reply;
  } catch (error) {
    // Provide more specific error messages with details
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. The server took too long to respond. Please try again.');
      }
      if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        // More detailed error for debugging
        const detailedError = `Network error: ${error.message}. This usually means the API route is not deployed or not accessible. Check Vercel Functions tab to see if /api/chat exists.`;
        console.error('Fetch error details:', error);
        throw new Error(detailedError);
      }
      throw error;
    }
    throw new Error('Failed to send message. Please try again.');
  }
}

