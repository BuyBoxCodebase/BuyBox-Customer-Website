"use client";

import { useEffect } from "react";
import { reportClientError } from "@/lib/client-error-reporter";

// Last resort: used when the root layout itself crashes, so it must render its own <html>/<body>
// and cannot rely on the app's providers or components.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    reportClientError(error, "global-error");
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: "sans-serif", textAlign: "center", padding: "4rem 1rem" }}>
        <h1 style={{ fontSize: "3rem", margin: 0 }}>500</h1>
        <p>Oops! Something went wrong.</p>
        <button onClick={reset} style={{ padding: "0.5rem 1rem", marginTop: "1rem" }}>
          Try again
        </button>
      </body>
    </html>
  );
}
