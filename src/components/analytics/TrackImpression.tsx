"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics/core";
import { ProductEventType } from "@/lib/analytics/constants";

interface TrackImpressionProps {
  productId: string;
  categoryId?: string;
  children: React.ReactNode;
}

export function TrackImpression({ productId, categoryId, children }: TrackImpressionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const tracked = useRef(false);

  useEffect(() => {
    if (!ref.current || tracked.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !tracked.current) {
          tracked.current = true;
          trackEvent({
            type: ProductEventType.IMPRESSION,
            productId,
            categoryId,
          });
          observer.disconnect();
        }
      },
      {
        threshold: 0.5, // trigger when 50% of the card is visible
      }
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [productId, categoryId]);

  return <div ref={ref} className="h-full w-full">{children}</div>;
}
