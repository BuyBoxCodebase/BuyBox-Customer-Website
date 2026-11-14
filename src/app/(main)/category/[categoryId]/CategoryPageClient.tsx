"use client";

import { useEffect } from "react";
import { Product } from "@/types/product";
import { MasonryGrid } from "@/components/ui/MasonryGrid";
import { MasonryProductCard } from "@/components/ui/MasonryProductCard";
import { SearchPlaceholder, ExplorePlaceholder } from "@/components/ui/MasonryPlaceholders";
import PaginationControls from "@/components/ui/PaginationControls";
import { motion } from "framer-motion";
import { usePageTracking } from "@/hooks/analytics";
import { trackEvent } from "@/lib/analytics/core";
import { UserEventType } from "@/lib/analytics/constants";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

interface CategoryPageClientProps {
  categoryId: string;
  categoryTitle: string;
  /** This page's products, fetched and cached on the server. null = the fetch failed. */
  products: Product[] | null;
  page: number;
  hasMore: boolean;
}

export default function CategoryPageClient({ categoryId, categoryTitle, products, page, hasMore }: CategoryPageClientProps) {
  usePageTracking();

  useEffect(() => {
    trackEvent({ type: UserEventType.CATEGORY_VIEW, categoryId });
  }, [categoryId]);

  if (products === null) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8 text-red-500">
          Error loading products. Please try again later.
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">{categoryTitle}</h1>
        <div className="text-center py-8">
          No products available in this category.
        </div>
        <PaginationControls page={page} hasMore={hasMore} />
      </div>
    );
  }

  return (
    <div className="pt-4 px-2 md:px-6">
      <h1 className="text-2xl font-bold mb-4">{categoryTitle}</h1>
      <motion.div
        key={page}
        variants={containerVariants}
        initial="hidden"
        animate="show">
        <MasonryGrid
          items={products}
          distributeLeftToRight={true}
          renderItem={(product) => (
            <motion.div key={product.id} variants={itemVariants} className="w-full relative group">
              <MasonryProductCard product={product} hideBadge={true} showAddToCart={true} dynamicBackground={false} />
              {(product.inventory?.quantity === 0 ||
                product.inventory?.quantity === undefined) && (
                <span className="absolute top-2 right-2 bg-red-500 text-white font-bold px-2 py-1 text-xs z-10 rounded shadow-md">
                  Sold Out
                </span>
              )}
            </motion.div>
          )}
          placeholders={[
            <SearchPlaceholder key="p1" />,
            <ExplorePlaceholder key="p2" />
          ]}
        />
      </motion.div>
      <PaginationControls page={page} hasMore={hasMore} />
    </div>
  );
}
