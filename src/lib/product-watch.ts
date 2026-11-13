import axios, { AxiosError } from "axios";

// Client for the watch list: "Notify me when available" (backend: /product-watch/*).

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// A Notify me button is for one sold-out product variant (shown on its product page and in the cart).
export type WatchTarget = { variantId: string };

export interface WatchSubscription {
  id: string;
  displayName: string;
  sizeLabel: string | null;
  colourLabel: string | null;
  image: string | null;
  status: "ACTIVE" | "CANCELLED" | "EXPIRED" | "OPTED_OUT";
  sourceVariantId: string | null;
  createdAt: string;
  expiresAt: string;
  notificationCount: number;
  lastNotifiedAt: string | null;
}

export interface WatchSettings {
  phoneNumber: string | null;
  hasValidPhone: boolean;
  expiresAfterDays: number;
}

export function getToken(): string | null {
  try {
    return typeof window === "undefined" ? null : localStorage.getItem("token");
  } catch {
    return null;
  }
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// The error the backend sent ({ code, message }) in a form the UI can switch on.
export function watchError(error: unknown): { code?: string; message: string } {
  const data = (error as AxiosError<{ code?: string; message?: string | string[] }>)?.response?.data;
  const message = Array.isArray(data?.message) ? data?.message.join(", ") : data?.message;
  return { code: data?.code, message: message || "Something went wrong. Please try again." };
}

export async function createWatch(target: WatchTarget) {
  const response = await axios.post<{ created: boolean; subscription: WatchSubscription }>(
    `${BACKEND_URL}/product-watch/subscriptions`,
    { variantId: target.variantId },
    { headers: authHeaders() },
  );
  return response.data;
}

export async function getWatchStatus(target: WatchTarget) {
  const response = await axios.get<{ subscribed: boolean; subscriptionId: string | null }>(
    `${BACKEND_URL}/product-watch/subscriptions/status`,
    { params: { variantId: target.variantId }, headers: authHeaders() },
  );
  return response.data;
}

export async function listWatches() {
  const response = await axios.get<{ subscriptions: WatchSubscription[] }>(`${BACKEND_URL}/product-watch/subscriptions`, {
    headers: authHeaders(),
  });
  return response.data.subscriptions;
}

export async function cancelWatch(id: string) {
  await axios.delete(`${BACKEND_URL}/product-watch/subscriptions/${id}`, { headers: authHeaders() });
}

export async function cancelAllWatches() {
  await axios.post(`${BACKEND_URL}/product-watch/subscriptions/cancel-all`, {}, { headers: authHeaders() });
}

export async function getWatchSettings() {
  const response = await axios.get<WatchSettings>(`${BACKEND_URL}/product-watch/settings`, { headers: authHeaders() });
  return response.data;
}

export async function savePhoneNumber(phoneNumber: string) {
  await axios.patch(`${BACKEND_URL}/customer/profile/update-profile`, { phoneNumber }, { headers: authHeaders() });
}

const PENDING_KEY = "productWatch:pending";

export function targetKey(target: WatchTarget): string {
  return target.variantId;
}

export function rememberPending(target: WatchTarget) {
  try {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify({ target, at: Date.now() }));
  } catch {
    // Private mode: the customer just taps the button again.
  }
}

export function takePending(key: string): { target: WatchTarget } | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const pending = JSON.parse(raw) as { target: WatchTarget; at: number };
    if (targetKey(pending.target) !== key || Date.now() - pending.at > 30 * 60 * 1000) return null;
    sessionStorage.removeItem(PENDING_KEY);
    return pending;
  } catch {
    return null;
  }
}

export function clearPending() {
  try {
    sessionStorage.removeItem(PENDING_KEY);
  } catch {
    // nothing to clear
  }
}
