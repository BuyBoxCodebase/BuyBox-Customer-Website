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
}

export function MasonryGrid<T>({ items, renderItem, distributeLeftToRight = false }: MasonryGridProps<T>) {
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
  const columnData: T[][] = Array.from({ length: columns }, () => []);
  
  // Distribute items left-to-right (Row by Row)
  items.forEach((item, index) => {
    columnData[index % columns].push(item);
  });

  return (
    <div 
      className="grid gap-4 items-start w-full"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {columnData.map((col, colIndex) => (
        <div key={colIndex} className="flex flex-col gap-4">
          {col.map((item, itemIndex) => (
            <React.Fragment key={itemIndex}>
              {renderItem(item, colIndex + itemIndex * columns)}
            </React.Fragment>
          ))}
        </div>
      ))}
    </div>
  );
}
