import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

export const askLinoUrl = (query: string) => `/?ask=${encodeURIComponent(query.trim())}`;

export interface LinoStreamHandlers {
  onStatus?: (message: string) => void;
  onProducts?: (products: any[]) => void;
  onText?: (chunk: string) => void;
}

// Streams a reply: products arrive as soon as Lino's search returns, then the text word by word.
// Uses fetch (axios can't read a stream in the browser) with the auth header AuthContext sets on axios;
// logged-in users are identified by it, guests send none.
export const streamLinoMessage = async (sessionId: string, message: string, handlers: LinoStreamHandlers) => {
  const authorization = axios.defaults.headers.common["Authorization"];
  const response = await fetch(`${BACKEND_URL}/lino/chat-stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authorization ? { Authorization: String(authorization) } : {}),
    },
    body: JSON.stringify({ sessionId, message }),
  });
  if (!response.ok || !response.body) throw new Error('Lino is currently unavailable. Please try again later.');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // Server-sent events are separated by a blank line.
    let boundary = buffer.indexOf('\n\n');
    while (boundary !== -1) {
      const raw = buffer.slice(0, boundary).trim();
      buffer = buffer.slice(boundary + 2);
      boundary = buffer.indexOf('\n\n');
      if (!raw.startsWith('data:')) continue;

      const event = JSON.parse(raw.slice(5).trim());
      if (event.type === 'status') handlers.onStatus?.(event.message);
      else if (event.type === 'products') handlers.onProducts?.(event.products);
      else if (event.type === 'text') handlers.onText?.(event.chunk);
      else if (event.type === 'error') throw new Error(event.message);
      else if (event.type === 'done') return;
    }
  }
};

export const fetchLinoHistory = async (sessionId: string) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/lino/history/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching Lino history:', error);
    return null;
  }
};

/** Fetches all past sessions for the currently authenticated user (for the side panel). */
export const fetchUserChats = async (token: string) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/lino/user/sessions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data as Array<{
      sessionId: string;
      title: string | null;
      updatedAt: string;
      createdAt: string;
      messages: Array<{ content: string; role: string }>;
    }>;
  } catch (error) {
    console.error('Error fetching user chats:', error);
    return [];
  }
};
