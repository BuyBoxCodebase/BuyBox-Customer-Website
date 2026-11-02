"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link, { useLinkStatus } from "next/link";
import { Loader2 } from "lucide-react";

export interface CarouselCategory {
  name: string;
  path: string;
  image?: string | null;
}

const SPEED_PX_PER_SEC = 30;
// After the customer swipes / scrolls / presses, wait this long before drifting again.
const RESUME_AFTER_MS = 2500;

// Must render inside a <Link>: covers the tile with a spinner as soon as it's tapped,
// so slow networks get feedback before the next page (or its loading.tsx) arrives.
function TilePendingOverlay() {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
      <Loader2 className="h-5 w-5 animate-spin text-white" />
    </div>
  );
}

/**
 * One row of subcategories (circles below md, square tiles from md up) that drifts
 * sideways forever. The list is repeated until one "period" is at least as wide as the
 * row, and two periods are rendered; the scroll position jumps back one period whenever
 * it passes it, so it loops in both directions. Customers can swipe / trackpad-scroll it,
 * which pauses the drift for a moment.
 */
export function SubcategoryCarousel({
  categories,
  hidden,
}: {
  categories: CarouselCategory[];
  hidden: boolean;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  // How many copies of the list make up one period.
  const [repeats, setRepeats] = useState(1);
  // Drift is paused until this time (performance.now()); a deadline can't get stuck.
  const pausedUntil = useRef(0);
  const keyboardFocus = useRef(false);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const list = listRef.current;
    if (!scroller || !list) return;
    const measure = () => {
      const listWidth = list.offsetWidth;
      if (listWidth > 0) setRepeats(Math.max(1, Math.ceil(scroller.clientWidth / listWidth)));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(scroller);
    observer.observe(list);
    return () => observer.disconnect();
  }, [categories]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const list = listRef.current;
    if (hidden || !scroller || !list || categories.length === 0) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let pos = scroller.scrollLeft;
    let last = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const period = list.offsetWidth * repeats;
      const dt = Math.min(now - last, 100);
      last = now;

      // The customer scrolled it themselves: carry on from there after a pause.
      if (Math.abs(scroller.scrollLeft - pos) > 2) {
        pos = scroller.scrollLeft;
        pausedUntil.current = now + RESUME_AFTER_MS;
      }
      const paused = reduceMotion || keyboardFocus.current || now < pausedUntil.current;
      if (!paused) pos += (SPEED_PX_PER_SEC * dt) / 1000;

      if (period > 0) {
        if (pos >= period) pos -= period;
        else if (pos < 0) pos += period;
      }
      if (Math.abs(scroller.scrollLeft - pos) >= 0.5) scroller.scrollLeft = pos;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [hidden, repeats, categories.length]);

  const holdOn = () => {
    pausedUntil.current = performance.now() + RESUME_AFTER_MS;
  };

  const renderList = (copyIndex: number) => (
    <div
      key={copyIndex}
      ref={copyIndex === 0 ? listRef : undefined}
      aria-hidden={copyIndex > 0 || undefined}
      // The trailing padding equals the gap, so a copy's width is exactly its share of the period.
      className="flex shrink-0 gap-4 pr-4 md:gap-3 md:pr-3"
    >
      {categories.map((cat) => (
        <Link
          key={cat.name}
          href={cat.path}
          tabIndex={hidden || copyIndex > 0 ? -1 : undefined}
          draggable={false}
          className="flex w-16 min-[450px]:w-[4.5rem] md:w-44 shrink-0 flex-col items-center md:items-stretch gap-2 md:gap-1.5 group"
        >
          {/* Below md: ringed circles. md and up: square tiles. */}
          <div className="w-14 h-14 min-[450px]:w-16 min-[450px]:h-16 shrink-0 rounded-full border border-gray-300 sys-dark:border-white/30 p-1 transition-colors group-hover:border-gray-400 sys-dark:group-hover:border-white/60 md:w-full md:h-auto md:aspect-square md:rounded-lg md:border-0 md:p-0">
            <div className="relative w-full h-full overflow-hidden rounded-full md:rounded-lg bg-gray-50 sys-dark:bg-white/5">
              {cat.image ? (
                <Image
                  src={cat.image}
                  alt={copyIndex > 0 ? "" : cat.name}
                  fill
                  sizes="(min-width: 768px) 176px, 64px"
                  draggable={false}
                  className="object-cover group-hover:scale-110 md:group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-400 sys-dark:text-gray-500 text-[10px] md:text-xs">No img</span>
                </div>
              )}
              <TilePendingOverlay />
            </div>
          </div>
          <span className="w-full truncate text-center text-xs min-[450px]:text-sm md:text-base text-black sys-dark:text-white">
            {cat.name}
          </span>
        </Link>
      ))}
    </div>
  );

  return (
    <div
      ref={scrollerRef}
      onPointerDown={holdOn}
      onTouchStart={holdOn}
      onTouchMove={holdOn}
      onWheel={holdOn}
      // Only keyboard focus holds it still, so a clicked/tapped tile can't leave it paused.
      onFocus={(e) => (keyboardFocus.current = (e.target as HTMLElement).matches(":focus-visible"))}
      onBlur={() => (keyboardFocus.current = false)}
      className="flex overflow-x-auto scrollbar-hide [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
    >
      {Array.from({ length: repeats * 2 }, (_, i) => renderList(i))}
    </div>
  );
}
