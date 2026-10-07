import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { UserEventType } from './constants';
import { trackActivity, type ActivityEventType } from '@/lib/activity/tracker';
import { parseDevice, parsePlatform } from './userAgent';

const SESSION_KEY = 'buybox_session_id';

export function getSessionId(): string {
  if (typeof window === 'undefined') return 'server-session';
  
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = uuidv4();
    sessionStorage.setItem(SESSION_KEY, sessionId);
    setTimeout(() => {
      trackEvent({ type: UserEventType.SESSION_STARTED }).catch(console.error);
    }, 0);
  }
  return sessionId;
}

interface TrackEventPayload {
  type: UserEventType;
  productId?: string;
  categoryId?: string;
  subCategoryId?: string;
  metadata?: any;
}

const TIMELINE_EVENTS: Partial<Record<UserEventType, ActivityEventType>> = {
  [UserEventType.SEARCH]: 'SEARCH',
  [UserEventType.CART_ADD]: 'ADD_TO_CART',
  [UserEventType.CHECKOUT_STARTED]: 'CHECKOUT_STARTED',
};

export async function trackEvent(payload: TrackEventPayload): Promise<void> {
  if (typeof window === 'undefined') return;

  const timelineType = TIMELINE_EVENTS[payload.type];
  if (timelineType) {
    trackActivity(timelineType, { productId: payload.productId, metadata: payload.metadata });
  }

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
