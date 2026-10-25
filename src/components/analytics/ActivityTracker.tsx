"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { currentPath, handleDocumentChange, handleDocumentClick, heartbeat, trackActivity } from "@/lib/activity/tracker";

function PageViews() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    const path = currentPath();
    if (path === lastPath.current) return;
    lastPath.current = path;
    trackActivity("PAGE_VIEW", { title: document.title });
  }, [pathname, searchParams]);

  return null;
}

export default function ActivityTracker() {
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") heartbeat();
    };
    document.addEventListener("click", handleDocumentClick, true);
    document.addEventListener("change", handleDocumentChange, true);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", heartbeat);
    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
      document.removeEventListener("change", handleDocumentChange, true);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", heartbeat);
    };
  }, []);

  return (
    <Suspense fallback={null}>
      <PageViews />
    </Suspense>
  );
}
