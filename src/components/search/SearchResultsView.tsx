"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, MessageSquare, SlidersHorizontal, X } from "lucide-react";
import { MasonryGrid } from "@/components/ui/MasonryGrid";
import { MasonryProductCard } from "@/components/ui/MasonryProductCard";
import { SearchPlaceholder, ExplorePlaceholder } from "@/components/ui/MasonryPlaceholders";
import { trackEvent } from "@/lib/analytics/core";
import { UserEventType } from "@/lib/analytics/constants";
import { usePageTracking } from "@/hooks/analytics";
import {
  describeFilter,
  FILTER_LABELS,
  FilterName,
  refineSearch,
  SearchParams,
  SearchProduct,
  SearchResponse,
  searchProducts,
  SORT_OPTIONS,
  SortOption,
} from "@/lib/search";
import { SearchFacets } from "./SearchFacets";
import { toCardProduct } from "./toCardProduct";

export default function SearchResultsView({
  params,
  initialResult,
}: {
  params: SearchParams;
  initialResult: SearchResponse | null;
}) {
  usePageTracking();
  const router = useRouter();
  const [products, setProducts] = useState<SearchProduct[]>(initialResult?.products ?? []);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialResult?.hasMore ?? false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    if (!params.q && !initialResult) return;
    trackEvent({
      type: UserEventType.SEARCH,
      metadata: { query: params.q, total: initialResult?.total ?? null, tookMs: initialResult?.tookMs ?? null },
    });
  }, [params.q, initialResult]);

  if (!initialResult) {
    return (
      <div className="pt-12 px-4 text-center">
        <p className="text-gray-700">Search isn&apos;t working right now.</p>
        <button onClick={() => router.refresh()} className="mt-3 text-sm font-medium underline">
          Try again
        </button>
      </div>
    );
  }

  const result = initialResult;
  const sort = params.sort;
  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const next = await searchProducts(params, page + 1);
      setProducts((current) => [...current, ...next.products]);
      setPage(page + 1);
      setHasMore(next.hasMore);
    } catch (error) {
      console.error("Failed to load more results", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const appliedFilters = (Object.entries(result.filters) as [FilterName, string | number][]).filter(
    ([, value]) => value !== undefined && value !== null,
  );
  const askLinoHref = `/?ask=${encodeURIComponent(params.q || appliedFilters.map(([n, v]) => describeFilter(n, v)).join(" "))}`;

  return (
    <div className="pt-4 px-2 md:px-6 pb-12">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-3">
        <div>
          <h1 className="text-2xl font-bold">{params.q ? <>Results for &ldquo;{params.q}&rdquo;</> : "Search"}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {result.total} {result.total === 1 ? "product" : "products"} in stock
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={askLinoHref}
            className="flex items-center gap-1.5 h-9 px-4 rounded-md bg-black text-white text-sm font-medium hover:bg-black/80"
          >
            <MessageSquare className="w-4 h-4" /> Ask Treides
          </Link>
          <button
            onClick={() => setFiltersOpen((open) => !open)}
            className="md:hidden flex items-center gap-1.5 h-9 px-3 rounded-md border border-gray-300 text-sm"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
          <label className="sr-only" htmlFor="search-sort">Sort by</label>
          <select
            id="search-sort"
            value={sort ?? "relevance"}
            onChange={(e) => router.push(refineSearch(result, e.target.value as SortOption, {}))}
            className="h-9 rounded-md border border-gray-300 bg-white px-2 text-sm"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      {appliedFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {appliedFilters.map(([name, value]) => (
            <Link
              key={name}
              href={refineSearch(result, sort, { [name]: undefined })}
              aria-label={`Remove ${FILTER_LABELS[name]} filter`}
              className="flex items-center gap-1 h-8 pl-3 pr-2 rounded-full bg-black text-white text-sm hover:bg-black/80"
            >
              {describeFilter(name, value)} <X className="w-3.5 h-3.5" />
            </Link>
          ))}
          {appliedFilters.length > 1 && (
            <Link href={refineSearch(result, sort, clearAll(appliedFilters))} className="text-sm underline text-gray-600">
              Clear all
            </Link>
          )}
        </div>
      )}

      {result.relaxed && <RelaxedNotice result={result} />}

      <div className="flex gap-6">
        <aside className={`${filtersOpen ? "block" : "hidden"} md:block w-full md:w-56 shrink-0`}>
          <SearchFacets result={result} sort={sort} />
        </aside>

        <div className={`${filtersOpen ? "hidden md:block" : "block"} flex-1 min-w-0`}>
          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-700">No products in stock match your search.</p>
              <p className="text-sm text-gray-500 mt-2">Try removing a filter, or tell Lino what you need.</p>
            </div>
          ) : (
            <>
              <MasonryGrid
                items={products}
                distributeLeftToRight={true}
                renderItem={(product) => (
                  <div key={product.id} className="w-full">
                    <MasonryProductCard product={toCardProduct(product)} hideBadge={true} showAddToCart={true} />
                  </div>
                )}
                placeholders={[<SearchPlaceholder key="p1" />, <ExplorePlaceholder key="p2" />]}
              />

              {hasMore && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="flex items-center gap-2 h-10 px-5 rounded-full border border-gray-300 bg-white text-sm font-medium disabled:opacity-60"
                  >
                    {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />} Show more
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function RelaxedNotice({ result }: { result: SearchResponse }) {
  const { droppedFilters, widenedPrice } = result.relaxed!;
  const dropped = droppedFilters
    .map((name) => {
      const value = result.requestedFilters[name];
      return value === undefined ? null : describeFilter(name, value);
    })
    .filter(Boolean);

  const parts: string[] = [];
  if (dropped.length > 0) parts.push(`without ${dropped.join(", ")}`);
  if (widenedPrice) {
    const range = [
      widenedPrice.minPrice !== undefined && `from $${widenedPrice.minPrice}`,
      widenedPrice.maxPrice !== undefined && `up to $${widenedPrice.maxPrice}`,
    ].filter(Boolean);
    parts.push(`with prices ${range.join(" ")}`);
  }

  return (
    <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      Nothing in stock matched everything you asked for, so these are the closest matches {parts.join(" and ")}.
    </div>
  );
}

function clearAll(applied: [FilterName, unknown][]): Record<string, undefined> {
  return Object.fromEntries(applied.map(([name]) => [name, undefined]));
}
