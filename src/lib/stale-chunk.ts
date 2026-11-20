// After a deploy, a tab that still runs the old build asks for JavaScript files that no longer exist.
// Reloading once fetches the new build. The timestamp stops a reload loop if the problem is something else.
const RELOAD_KEY = "stale-chunk-reload-at";
const RELOAD_COOLDOWN_MS = 30_000;

export function isStaleChunkError(error: unknown): boolean {
  const err = error as { name?: string; message?: string } | null;
  const text = `${err?.name ?? ""} ${err?.message ?? ""}`;
  return /ChunkLoadError|Loading chunk [\w-]+ failed|Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed/i.test(
    text,
  );
}

// Returns true when a reload was started, so the caller can skip showing/reporting an error.
export function reloadIfStaleChunk(error: unknown): boolean {
  if (typeof window === "undefined" || !isStaleChunkError(error)) return false;
  try {
    const last = Number(window.sessionStorage.getItem(RELOAD_KEY) ?? 0);
    if (Date.now() - last < RELOAD_COOLDOWN_MS) return false;
    window.sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    return false; // storage blocked: don't risk a reload loop
  }
  window.location.reload();
  return true;
}
