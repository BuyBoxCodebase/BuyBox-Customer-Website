"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  page: number;
  hasMore: boolean;
}

export default function PaginationControls({ page, hasMore }: PaginationControlsProps) {
  const pathname = usePathname();
  if (page <= 1 && !hasMore) return null;

  const hrefFor = (target: number) => (target <= 1 ? pathname : `${pathname}?page=${target}`);
  const linkClass =
    "inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100";
  const disabledClass =
    "inline-flex items-center gap-1 rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-400 cursor-not-allowed";

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-4 py-8">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={linkClass} scroll>
          <ChevronLeft className="h-4 w-4" /> Previous
        </Link>
      ) : (
        <span className={disabledClass} aria-disabled="true">
          <ChevronLeft className="h-4 w-4" /> Previous
        </span>
      )}
      <span className="text-sm text-gray-600">Page {page}</span>
      {hasMore ? (
        <Link href={hrefFor(page + 1)} className={linkClass} scroll>
          Next <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className={disabledClass} aria-disabled="true">
          Next <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
