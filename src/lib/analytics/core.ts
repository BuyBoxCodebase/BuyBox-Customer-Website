import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { ProductEventType } from './constants';

const SESSION_KEY = 'buybox_session_id';

export function getSessionId(): string {
  if (typeof window === 'undefined') return 'server-session';
  
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = uuidv4();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

function parseDevice(userAgent: string): string {
  if (/mobile/i.test(userAgent)) return 'Mobile';
  if (/tablet/i.test(userAgent)) return 'Tablet';
  return 'Desktop';
}

function parsePlatform(userAgent: string): string {
  if (/windows/i.test(userAgent)) return 'Windows';
  if (/mac/i.test(userAgent)) return 'MacOS';
  if (/linux/i.test(userAgent)) return 'Linux';
  if (/android/i.test(userAgent)) return 'Android';
  if (/iphone|ipad|ipod/i.test(userAgent)) return 'iOS';
  return 'Unknown';
}

interface TrackEventPayload {
  type: ProductEventType;
  productId?: string;
  categoryId?: string;
  metadata?: any;
}

export async function trackEvent(payload: TrackEventPayload): Promise<void> {
  if (typeof window === 'undefined') return;

  const sessionId = getSessionId();
  const userAgent = navigator.userAgent;
  const device = parseDevice(userAgent);
  const platform = parsePlatform(userAgent);
  const source = document.referrer || undefined;

  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // If user is authenticated, passing the token maps the event to their customerId
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    await axios.post(`${backendUrl}/events/product`, {
      sessionId,
      device,
      platform,
      source,
      ...payload
    }, { headers });
  } catch (error) {
    // Fail silently so tracking errors don't interrupt the user experience
    console.error('Failed to track event:', error);
  }
}
