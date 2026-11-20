"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { reportClientError } from "@/lib/client-error-reporter";
import { reloadIfStaleChunk } from "@/lib/stale-chunk";

// Shown when a page crashes while rendering. The layout (navbar etc.) stays in place.
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    if (reloadIfStaleChunk(error)) return; // old tab after a deploy: reload to get the new build
    reportClientError(error, "render-error");
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-10 text-center">
      <h1 className="text-5xl font-bold">500</h1>
      <p className="font-medium">Oops! Something went wrong</p>
      <p className="text-muted-foreground">We apologize for the inconvenience. Please try again.</p>
      <div className="mt-4 flex gap-3">
        <Button variant="outline" onClick={reset}>
          Try again
        </Button>
        <Button asChild variant="orange">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}
