"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import useGetAllProducts from "@/hooks/products/useGetAllProducts";
import { useSearchProducts } from "@/hooks/products/useSearchProducts";
import { useSearchParams } from "next/navigation";
import { MasonryProductCard } from "@/components/ui/MasonryProductCard";
import { MasonryGrid } from "@/components/ui/MasonryGrid";
import { MasonrySkeleton } from "@/components/ui/MasonrySkeleton";
import { SearchPlaceholder, ExplorePlaceholder } from "@/components/ui/MasonryPlaceholders";
import { Loader2 } from "lucide-react";
import { usePageTracking } from "@/hooks/analytics";
import { Product } from "@/types/product";

// Variants for container and items
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

function SearchResults() {
  usePageTracking();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const { products, loading } = useGetAllProducts();
  const { searchResults } = useSearchProducts(products, query);

  // Sort search results by availability
  const sortedSearchResults = [...searchResults].sort((a, b) => {
    const getQuantity = (product: Product): number => {
      // Access inventory properly based on your Product type structure
      return product.inventory?.quantity ?? 0;
    };

    const quantityA = getQuantity(a);
    const quantityB = getQuantity(b);

    if (quantityA > 0 && quantityB === 0) return -1;
    if (quantityA === 0 && quantityB > 0) return 1;

    if (quantityA > 0 && quantityB > 0) {
      return quantityB - quantityA;
    }

    return 0;
  });

  if (loading) {
    return <SearchPageLoading query={query} />;
  }

  return (
    <div className="pt-4 px-6">
      <h1 className="text-2xl font-bold mb-4">
        Search Results for "{query}"
      </h1>
      {sortedSearchResults.length === 0 ? (
        <div className="text-center py-8 ">
          <p className="text-gray-600">
            No products found matching your search.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Try searching with different keywords or browse our categories.
          </p>
        </div>
      ) : (
        <>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show">
            <MasonryGrid
              items={sortedSearchResults}
              distributeLeftToRight={true}
              renderItem={(product) => (
                <motion.div key={product.id} variants={itemVariants} className="w-full">
                  <MasonryProductCard product={product} hideBadge={true} showAddToCart={true} dynamicBackground={true} />
                </motion.div>
              )}
              placeholders={[
                <SearchPlaceholder key="p1" />,
                <ExplorePlaceholder key="p2" />
              ]}
            />
          </motion.div>
        </>
      )}
    </div>
  );
}

function SearchPageLoading({ query }: { query: string }) {
  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold">Searching for "{query}"</h1>
        <Loader2 className="w-5 h-5 animate-spin text-gray-800" />
      </div>

      {/* Animated grid loading using framer-motion */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <MasonrySkeleton />
      </motion.div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageLoading query="" />}>
      <SearchResults />
    </Suspense>
  );
}
