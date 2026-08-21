"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { ProductCard } from "@/components/ui/ProductCard";
import { Product } from "@/types/product";

interface ProductRailProps {
  /** Section heading, e.g. "Trending now" */
  title: string;
  /** Path on the backend, e.g. "/recommendation/trending?limit=12" */
  endpoint: string;
  /** Send the customer's bearer token — required for /for-you */
  authenticated?: boolean;
  /** Optional "See all" destination */
  seeAllHref?: string;
  /**
   * Hide the whole rail below this many products. A two-card rail reads
   * as broken, and several categories genuinely have that few in stock.
   */
  minItems?: number;
  /**
   * Fired once the rail knows whether it has anything to show. Lets a parent
   * decide what to render in its place when this rail comes back empty.
   */
  onResult?: (visible: boolean) => void;
}

export default function ProductRail({
  title,
  endpoint,
  authenticated = false,
  seeAllHref,
  minItems = 4,
  onResult,
}: ProductRailProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // kept in a ref so an inline arrow from the parent cannot re-trigger the fetch
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  useEffect(() => {
    let cancelled = false;
    const report = (count: number) => onResultRef.current?.(count >= minItems);

    (async () => {
      try {
        const token = authenticated ? localStorage.getItem("token") : null;
        if (authenticated && !token) {
          if (!cancelled) { setProducts([]); setLoading(false); report(0); }
          return;
        }

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}${endpoint}`,
          token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
        );

        if (cancelled) return;
        const list = Array.isArray(res.data?.products) ? res.data.products : [];
        // _score / _reasons are debug fields from the scorer — never render them
        setProducts(list.map(({ _score, _reasons, ...p }: any) => p));
        report(list.length);
      } catch {
        // a rail is supplementary — if it fails, the page carries on without it
        if (!cancelled) { setProducts([]); report(0); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [endpoint, authenticated, minItems]);

  if (loading) return <RailSkeleton title={title} />;
  if (products.length < minItems) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4 pl-2 lg:pl-4 pr-2 lg:pr-4">
        <h2 className="text-xl md:text-2xl lg:text-2xl font-bold">{title}</h2>
        {seeAllHref && (
          <Link
            href={seeAllHref}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 whitespace-nowrap"
          >
            See all &rarr;
          </Link>
        )}
      </div>

      <div className="flex gap-3 md:gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth px-2 lg:px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[160px] md:w-[200px] shrink-0 snap-start"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}

function RailSkeleton({ title }: { title: string }) {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4 pl-2 lg:pl-4 pr-2 lg:pr-4">
        <h2 className="text-xl md:text-2xl lg:text-2xl font-bold">{title}</h2>
      </div>
      <div className="flex gap-3 md:gap-4 overflow-hidden px-2 lg:px-4 pb-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="w-[160px] md:w-[200px] shrink-0">
            <div className="aspect-square w-full rounded-lg bg-gray-200 animate-pulse" />
            <div className="mt-2 h-4 w-3/4 rounded bg-gray-200 animate-pulse" />
            <div className="mt-2 h-4 w-1/3 rounded bg-gray-200 animate-pulse" />
          </div>
        ))}
      </div>
    </section>
  );
}
