import React from "react";

export function MasonrySkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 w-full">
      {Array.from({ length: count }).map((_, i) => {
        const height = [250, 300, 200, 350, 280, 220, 310, 270][i % 8];
        return (
          <div key={i} className="break-inside-avoid rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm mb-4">
            <div className="w-full bg-gray-200 animate-pulse" style={{ height: `${height}px` }} />
            <div className="p-3">
              <div className="h-4 w-full bg-gray-200 animate-pulse rounded mb-2" />
              <div className="h-3 w-3/4 bg-gray-200 animate-pulse rounded mb-3" />
              <div className="h-5 w-1/3 bg-gray-200 animate-pulse rounded" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
