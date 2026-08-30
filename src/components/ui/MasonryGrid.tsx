"use client";

import React, { useEffect, useState } from "react";

interface MasonryGridProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  /**
   * If true, uses Javascript to strictly distribute items row-by-row (left to right)
   * into vertical Flexbox columns. This fixes search result sorting and stops flickering.
   * If false, falls back to native CSS columns (top-to-bottom).
   */
  distributeLeftToRight?: boolean;
  /**
   * Optional placeholder elements to fill empty grid spots when items don't perfectly fill columns.
   */
  placeholders?: React.ReactNode[];
}

export function MasonryGrid<T>({ items, renderItem, distributeLeftToRight = false, placeholders }: MasonryGridProps<T>) {
  const [columns, setColumns] = useState(4);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!distributeLeftToRight) return;

    const updateColumns = () => {
      if (window.innerWidth < 768) {
        setColumns(2);
      } else if (window.innerWidth < 1024) {
        setColumns(3);
      } else {
        setColumns(4);
      }
    };

    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, [distributeLeftToRight]);

  // If the flag is disabled, or before hydration completes for JS mode, 
  // render the native CSS columns layout.
  if (!distributeLeftToRight || !mounted) {
    return (
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {items.map((item, index) => (
          <div key={index} className="break-inside-avoid">
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    );
  }

  // JS Layout: Create columns array
  const columnData: React.ReactNode[][] = Array.from({ length: columns }, () => []);
  
  // Distribute items left-to-right (Row by Row)
  items.forEach((item, index) => {
    columnData[index % columns].push(
      <React.Fragment key={index}>
        {renderItem(item, index)}
      </React.Fragment>
    );
  });

  // Inject placeholders into empty spots at the end of the grid
  const emptySpots = items.length % columns === 0 ? 0 : columns - (items.length % columns);
  if (placeholders && emptySpots > 0) {
    for (let i = 0; i < Math.min(emptySpots, placeholders.length); i++) {
      columnData[(items.length + i) % columns].push(
        <React.Fragment key={`placeholder-${i}`}>
          {placeholders[i]}
        </React.Fragment>
      );
    }
  }

  return (
    <div 
      className="grid gap-4 items-start w-full"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {columnData.map((col, colIndex) => (
        <div key={colIndex} className="flex flex-col gap-4">
          {col.map((content, itemIndex) => (
            <React.Fragment key={itemIndex}>
              {content}
            </React.Fragment>
          ))}
        </div>
      ))}
    </div>
  );
}
