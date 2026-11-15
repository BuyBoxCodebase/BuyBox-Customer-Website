"use client";

import { installConsoleCapture } from "@/lib/client-error-reporter";

// Starts recording console output as early as the browser bundle loads, so it is
// available if the error page needs to report it. Renders nothing.
if (typeof window !== "undefined") installConsoleCapture();

export default function ConsoleCapture() {
  return null;
}
