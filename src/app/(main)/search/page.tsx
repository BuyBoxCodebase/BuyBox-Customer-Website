"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import useGetAllProducts from "@/hooks/products/useGetAllProducts";
import { useSearchProducts } from "@/hooks/products/useSearchProducts";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/ui/ProductCard";
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

// Loading Skeleton for a single product card
function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Image skeleton */}
      <div className="aspect-square bg-gray-200 animate-pulse relative overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
          style={{
            transform: "translateX(-100%)",
            animation: "shimmer 2s infinite",
          }}
        />
      </div>

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title skeleton */}
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />

        {/* Category skeleton */}
        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />

        {/* Price skeleton */}
        <div className="h-5 bg-gray-200 rounded animate-pulse w-1/4" />

        {/* Button skeleton */}
        <div className="h-10 bg-gray-200 rounded animate-pulse w-full mt-4" />
      </div>
    </div>
  );
}

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
    <div className="pt-4">
      <h1 className="text-2xl font-bold mb-4 pl-2">
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
          <p className="text-gray-600 mb-4 pl-2">
            Found {sortedSearchResults.length} results for "{query}"
          </p>
          <motion.div
            className="grid grid-cols-1 gap-0"
            variants={containerVariants}
            initial="hidden"
            animate="show">
            {sortedSearchResults.map((product) => (
              <motion.div key={product.id} variants={itemVariants}>
                <ProductCard product={product} />
              </motion.div>
            ))}
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
        className="grid grid-cols-1 gap-0"
        variants={containerVariants}
        initial="hidden"
        animate="show">
        {[...Array(8)].map((_, index) => (
          <motion.div key={index} variants={itemVariants}>
            <ProductCardSkeleton />
          </motion.div>
        ))}
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
