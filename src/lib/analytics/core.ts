import { UserEventType } from './constants';
import { trackActivity, trackUserEvent, type ActivityEventType } from '@/lib/activity/tracker';

const SESSION_STARTED_KEY = 'buybox_session_started';

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

function markSessionStarted() {
  try {
    if (sessionStorage.getItem(SESSION_STARTED_KEY)) return;
    sessionStorage.setItem(SESSION_STARTED_KEY, '1');
  } catch {
    return;
  }
  trackUserEvent({ type: UserEventType.SESSION_STARTED });
}

export async function trackEvent(payload: TrackEventPayload): Promise<void> {
  if (typeof window === 'undefined') return;

  markSessionStarted();

  const timelineType = TIMELINE_EVENTS[payload.type];
  if (timelineType) {
    trackActivity(timelineType, { productId: payload.productId, metadata: payload.metadata });
  }

  trackUserEvent(payload);
}
