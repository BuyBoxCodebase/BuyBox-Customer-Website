"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product";
import usePopularProducts from "@/hooks/products/usePopularProducts";
import { MasonryProductCard } from "@/components/ui/MasonryProductCard";

export default function HomePagePopularProducts() {
  const { popularProducts, loading } = usePopularProducts(null, null, 20);

  // Extract products from the popular product snapshots
  const trendingProducts = popularProducts.map(s => s.product).filter(Boolean) as Product[];

  if (loading) {
    return <MasonrySkeleton />;
  }

  if (!trendingProducts || trendingProducts.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto px-2 md:px-4 py-4">
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h2 className="w-full whitespace-normal break-words md:w-auto text-xl md:text-2xl lg:text-2xl font-bold pl-2 lg:pl-0 text-black">
          Trending Now
        </h2>
      </div>

      {/* Tailwind CSS Columns for Masonry Layout */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {trendingProducts.map((product) => (
          <MasonryProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

function MasonrySkeleton() {
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="flex flex-wrap justify-between items-center mb-4 pr-4">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse ml-2 lg:ml-4" />
      </div>

      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {[250, 300, 200, 350, 280, 220, 310, 270].map((height, i) => (
          <div key={i} className="break-inside-avoid rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm">
            <div 
              className="w-full bg-gray-200 animate-pulse" 
              style={{ height: `${height}px` }} 
            />
            <div className="p-3">
              <div className="h-4 w-full bg-gray-200 animate-pulse rounded mb-2" />
              <div className="h-3 w-3/4 bg-gray-200 animate-pulse rounded mb-3" />
              <div className="h-5 w-1/3 bg-gray-200 animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
