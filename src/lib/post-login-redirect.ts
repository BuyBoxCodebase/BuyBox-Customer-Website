// Carries "where to go after login" across the Google round trip (site -> backend -> Google -> /customer),
// which can't keep the ?redirect= query on its own. Same origin throughout, so localStorage survives it.

const KEY = "postLoginRedirect";
const MAX_AGE_MS = 15 * 60 * 1000;

// Only same-site paths: "https://..." or "//evil.com" would turn login into an open redirect.
export function safeRedirectPath(value: string | null | undefined): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return null;
  return value;
}

export function rememberPostLoginRedirect(path: string | null) {
  try {
    if (path) localStorage.setItem(KEY, JSON.stringify({ path, at: Date.now() }));
    else localStorage.removeItem(KEY);
  } catch {
    // Storage blocked: they land on the homepage after signing in instead.
  }
}

export function takePostLoginRedirect(): string | null {
  try {
    const raw = localStorage.getItem(KEY);
    localStorage.removeItem(KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as { path?: string; at?: number };
    if (!saved.at || Date.now() - saved.at > MAX_AGE_MS) return null;
    return safeRedirectPath(saved.path);
  } catch {
    return null;
  }
}
