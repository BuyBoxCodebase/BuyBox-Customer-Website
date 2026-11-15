// Keeps the last few console messages in memory so that when the error page appears we can
// send what the shopper's browser was logging at that moment, together with the error.

interface ConsoleEntry {
  level: string;
  time: string;
  message: string;
}

const MAX_ENTRIES = 60;
const MAX_MESSAGE = 1000;
const buffer: ConsoleEntry[] = [];
let installed = false;
let lastReport = { key: "", at: 0 };

function redact(text: string) {
  return text
    .replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, "Bearer [REDACTED]")
    .replace(/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]*/g, "[REDACTED_JWT]");
}

function stringify(value: unknown): string {
  if (value instanceof Error) return `${value.name}: ${value.message}\n${value.stack ?? ""}`;
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function push(level: string, args: unknown[]) {
  try {
    const message = redact(args.map(stringify).join(" ")).slice(0, MAX_MESSAGE);
    buffer.push({ level, time: new Date().toISOString(), message });
    if (buffer.length > MAX_ENTRIES) buffer.shift();
  } catch {
    // never let logging break the app
  }
}

export function installConsoleCapture() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  (["log", "info", "warn", "error"] as const).forEach((level) => {
    const original = console[level].bind(console);
    console[level] = (...args: unknown[]) => {
      push(level, args);
      original(...args);
    };
  });

  window.addEventListener("error", (event) =>
    push("window-error", [event.message, event.filename && `${event.filename}:${event.lineno}`])
  );
  window.addEventListener("unhandledrejection", (event) => push("unhandled-rejection", [event.reason]));
}

export function reportClientError(error: unknown, trigger: "render-error" | "global-error") {
  try {
    const e = error as any;
    const message = String(e?.message ?? stringify(error));

    // The same failure often triggers several reports (retries, re-renders): send it once.
    const key = `${trigger}:${message}:${e?.digest ?? ""}`;
    const now = Date.now();
    if (lastReport.key === key && now - lastReport.at < 10_000) return;
    lastReport = { key, at: now };

    const backend = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backend) return;

    const payload = {
      app: "customer-web",
      trigger,
      name: e?.name,
      message,
      stack: e?.stack,
      // Production builds hide server-component error text; the digest still matches the server log.
      code: e?.digest,
      pageUrl: window.location.href,
      referrer: document.referrer,
      appVersion: process.env.NODE_ENV,
      console: buffer,
    };

    // keepalive lets the request finish even if the page navigates right after.
    void fetch(`${backend}/error-log/client`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // reporting must never cause another error
  }
}
