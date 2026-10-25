"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Product } from "@/types/product";
import { MasonryGrid } from "@/components/ui/MasonryGrid";
import { MasonryProductCard } from "@/components/ui/MasonryProductCard";
import { MasonrySkeleton } from "@/components/ui/MasonrySkeleton";
import Link from "next/link";

interface ProductGridProps {
  title: string;
  endpoint: string;
  authenticated?: boolean;
  seeAllHref?: string;
  minItems?: number;
  onResult?: (visible: boolean) => void;
  placeholders?: React.ReactNode[];
}

export default function ProductGrid({
  title,
  endpoint,
  authenticated = false,
  seeAllHref,
  minItems = 4,
  onResult,
  placeholders,
}: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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
        setProducts(list.map(({ _score, _reasons, ...p }: any) => p));
        report(list.length);
      } catch {
        if (!cancelled) { setProducts([]); report(0); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [endpoint, authenticated, minItems]);

  if (loading) {
    return (
      <section className="mb-8 px-2 md:px-4 lg:px-4">
        <div className="flex flex-wrap items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl lg:text-2xl font-bold">{title}</h2>
        </div>
        <MasonrySkeleton />
      </section>
    );
  }
  
  if (products.length < minItems) return null;

  return (
    <section className="mb-8 px-2 md:px-4 lg:px-4">
      <div className="flex flex-wrap items-center justify-between mb-4">
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

      <MasonryGrid
        items={products}
        distributeLeftToRight={true}
        renderItem={(product) => (
          <MasonryProductCard key={product.id} product={product} />
        )}
        placeholders={placeholders}
      />
    </section>
  );
}
