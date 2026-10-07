import { v4 as uuidv4 } from "uuid";
import { parseDevice, parsePlatform } from "@/lib/analytics/userAgent";

export type ActivityEventType =
  | "PAGE_VIEW"
  | "CLICK"
  | "SEARCH"
  | "ADD_TO_CART"
  | "CHECKOUT_STARTED"
  | "LOGIN"
  | "LOGOUT";

interface QueuedEvent {
  sessionId: string;
  type: ActivityEventType;
  seq: number;
  ts: number;
  path: string;
  title?: string;
  label?: string;
  productId?: string;
  metadata?: Record<string, unknown>;
}

interface StoredSession {
  id: string;
  lastActivity: number;
  seq: number;
}

const VISITOR_KEY = "buybox_visitor_id";
const SESSION_KEY = "buybox_activity_session";
const IDENTIFIED_KEY = "buybox_identified_customer";
const SESSION_IDLE_MS = 3 * 24 * 60 * 60 * 1000;
const FLUSH_INTERVAL_MS = 5000;
const FLUSH_AT = 20;

const ACTION_SELECTOR = 'button, a[href], [role="button"], [data-track]';
const SENSITIVE_PARAM = /token|code|otp|password|secret|email|phone/i;

let queue: QueuedEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
const memoryFallback: { visitorId?: string; session?: StoredSession } = {};

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // private mode / storage disabled: memoryFallback keeps the tab working
  }
}

function removeStorage(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

function backendUrl(): string {
  return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
}

function authToken(): string | null {
  return readStorage("accessToken") ?? readStorage("token");
}

export function getVisitorId(): string {
  let id = readStorage(VISITOR_KEY) ?? memoryFallback.visitorId;
  if (!id) {
    id = uuidv4();
    writeStorage(VISITOR_KEY, id);
    memoryFallback.visitorId = id;
  }
  return id;
}

function loadSession(): StoredSession | null {
  const raw = readStorage(SESSION_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as StoredSession;
    } catch {
      return null;
    }
  }
  return memoryFallback.session ?? null;
}

function saveSession(session: StoredSession) {
  writeStorage(SESSION_KEY, JSON.stringify(session));
  memoryFallback.session = session;
}

function touchSession(now: number): StoredSession {
  const existing = loadSession();
  const session =
    existing && now - existing.lastActivity < SESSION_IDLE_MS
      ? { ...existing, lastActivity: now, seq: existing.seq + 1 }
      : { id: uuidv4(), lastActivity: now, seq: 1 };
  saveSession(session);
  return session;
}

export function currentPath(): string {
  const params = new URLSearchParams(window.location.search);
  for (const key of Array.from(params.keys())) {
    if (SENSITIVE_PARAM.test(key)) params.delete(key);
  }
  const query = params.toString();
  return window.location.pathname + (query ? `?${query}` : "");
}

export function trackActivity(
  type: ActivityEventType,
  data: Partial<Pick<QueuedEvent, "label" | "productId" | "metadata" | "title">> = {},
) {
  if (typeof window === "undefined") return;

  const now = Date.now();
  const session = touchSession(now);

  queue.push({
    sessionId: session.id,
    type,
    seq: session.seq,
    ts: now,
    path: currentPath(),
    title: data.title,
    label: data.label,
    productId: data.productId,
    metadata: data.metadata,
  });

  if (queue.length >= FLUSH_AT) {
    flush();
  } else if (!flushTimer) {
    flushTimer = setTimeout(flush, FLUSH_INTERVAL_MS);
  }
}

function parseBrowser(ua: string): string {
  if (/edg\//i.test(ua)) return "Edge";
  if (/opr\/|opera/i.test(ua)) return "Opera";
  if (/samsungbrowser/i.test(ua)) return "Samsung Internet";
  if (/chrome|crios/i.test(ua)) return "Chrome";
  if (/firefox|fxios/i.test(ua)) return "Firefox";
  if (/safari/i.test(ua)) return "Safari";
  return "Unknown";
}

function externalReferrer(): string | undefined {
  try {
    if (!document.referrer) return undefined;
    const ref = new URL(document.referrer);
    return ref.host === window.location.host ? undefined : ref.origin + ref.pathname;
  } catch {
    return undefined;
  }
}

function send(sessionId: string, events: Omit<QueuedEvent, "sessionId">[]) {
  const ua = navigator.userAgent;
  const body = JSON.stringify({
    sessionId,
    visitorId: getVisitorId(),
    context: {
      referrer: externalReferrer(),
      device: parseDevice(ua),
      platform: parsePlatform(ua),
      browser: parseBrowser(ua),
    },
    events,
  });

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = authToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  fetch(`${backendUrl()}/analytics/activity/batch`, {
    method: "POST",
    headers,
    body,
    keepalive: true,
  }).catch(() => {
    // Tracking must never break the site.
  });
}

export function flush() {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  if (!queue.length) return;

  const pending = queue;
  queue = [];

  const bySession = new Map<string, Omit<QueuedEvent, "sessionId">[]>();
  for (const { sessionId, ...event } of pending) {
    if (!bySession.has(sessionId)) bySession.set(sessionId, []);
    bySession.get(sessionId)!.push(event);
  }
  bySession.forEach((events, sessionId) => send(sessionId, events));
}

export function heartbeat() {
  if (queue.length) {
    flush();
    return;
  }
  const session = loadSession();
  if (session && Date.now() - session.lastActivity < SESSION_IDLE_MS) {
    send(session.id, []);
  }
}

function cleanText(text: string | null | undefined): string | undefined {
  const cleaned = text?.replace(/\s+/g, " ").trim();
  return cleaned ? cleaned.slice(0, 60) : undefined;
}

export function handleDocumentClick(event: MouseEvent) {
  const target = event.target as Element | null;
  const el = target?.closest?.(ACTION_SELECTOR) as HTMLElement | null;
  if (!el || el.closest("[data-track-ignore]")) return;
  if ((el as HTMLButtonElement).disabled || el.getAttribute("aria-disabled") === "true") return;

  const label =
    cleanText(el.getAttribute("data-track")) ??
    cleanText(el.getAttribute("aria-label")) ??
    cleanText(el.innerText) ??
    cleanText(el.getAttribute("title")) ??
    cleanText(el.querySelector("img")?.getAttribute("alt"));

  const productId =
    el.closest("[data-track-product-id]")?.getAttribute("data-track-product-id") ?? undefined;

  const metadata: Record<string, unknown> = { element: el.tagName.toLowerCase() };
  if (el instanceof HTMLAnchorElement && el.href) {
    try {
      const url = new URL(el.href);
      metadata.href = url.host === window.location.host ? url.pathname : url.origin + url.pathname;
    } catch {
      // ignore malformed hrefs
    }
  }

  trackActivity("CLICK", { label: label ?? el.tagName.toLowerCase(), productId, metadata });
}

export function identifyVisitor(customerId: string) {
  if (typeof window === "undefined") return;
  const token = authToken();
  if (!token) return;

  const previous = readStorage(IDENTIFIED_KEY);
  if (previous !== customerId) {
    if (previous) startNewVisitor();
    writeStorage(IDENTIFIED_KEY, customerId);
    trackActivity("LOGIN", { label: "Logged in" });
  }
}

export function resetVisitorOnLogout() {
  if (typeof window === "undefined") return;
  trackActivity("LOGOUT", { label: "Logged out" });
  startNewVisitor();
}

function startNewVisitor() {
  flush();
  removeStorage(VISITOR_KEY);
  removeStorage(SESSION_KEY);
  removeStorage(IDENTIFIED_KEY);
  delete memoryFallback.visitorId;
  delete memoryFallback.session;
}
