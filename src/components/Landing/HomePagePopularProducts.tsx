"use client";

import React from "react";
import { Product } from "@/types/product";
import usePopularProducts from "@/hooks/products/usePopularProducts";
import { MasonryProductCard } from "@/components/ui/MasonryProductCard";
import { MasonryGrid } from "@/components/ui/MasonryGrid";
import { MasonrySkeleton } from "@/components/ui/MasonrySkeleton";
import { SearchPlaceholder, ExplorePlaceholder } from "@/components/ui/MasonryPlaceholders";

export default function HomePagePopularProducts() {
  const { popularProducts, loading } = usePopularProducts(null, null, 20);

  // Extract products from the popular product snapshots
  const trendingProducts = popularProducts.map(s => s.product).filter(Boolean) as Product[];

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-12">
        <div className="flex flex-wrap justify-between items-center mb-4 pr-4">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse ml-2 lg:ml-4" />
        </div>
        <MasonrySkeleton />
      </section>
    );
  }

  if (!trendingProducts || trendingProducts.length === 0) {
    return null;
  }

  return (
    <section id="for-you" className="container mx-auto px-2 md:px-4 py-4">
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h2 className="w-full whitespace-normal break-words md:w-auto text-xl md:text-2xl lg:text-2xl font-bold pl-2 lg:pl-0 text-black">
          For You
        </h2>
      </div>

      {/* Masonry Grid with Dynamic Placeholders */}
      <MasonryGrid
        items={trendingProducts}
        distributeLeftToRight={true}
        renderItem={(product) => (
          <MasonryProductCard key={product.id} product={product} />
        )}
        placeholders={[
          <SearchPlaceholder key="p1" />,
          <ExplorePlaceholder key="p2" />
        ]}
      />
    </section>
  );
}




