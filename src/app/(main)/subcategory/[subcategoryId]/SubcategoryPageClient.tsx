"use client";
import { ProductCard } from "@/components/ui/ProductCard";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { usePageTracking } from "@/hooks/analytics";
import { Product } from "@/types/product";
import PopularProducts from "@/components/recommendation/PopularProducts";
import { MasonryGrid } from "@/components/ui/MasonryGrid";
import { MasonryProductCard } from "@/components/ui/MasonryProductCard";
import { SearchPlaceholder, ExplorePlaceholder } from "@/components/ui/MasonryPlaceholders";
interface SubcategoryPageClientProps {
  data: { groupName: string; products: Product[] } | null;
  formattedSubCategoryName: string;
  categoryId: string;
}

export default function SubcategoryPageClient({ data, formattedSubCategoryName, categoryId }: SubcategoryPageClientProps) {
  usePageTracking();
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Animation variants for content transitions
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 24,
      },
    },
  };

  // We need to wait for client hydration to avoid hydration mismatch with framer-motion
  if (!isClient) {
    return <LoadingScreen />;
  }

  // Check if the products array is empty
  if (!data || !data.products || data.products.length === 0) {
    return (
      <motion.div
        className="container mx-auto px-4 py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}>
        <motion.h1 className="text-3xl font-bold mb-8" variants={itemVariants}>
          {formattedSubCategoryName}
        </motion.h1>
        <motion.div
          className="bg-gray-50 rounded-xl p-8 text-center shadow-sm"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}>
          <p className="text-gray-600 text-lg">
            No products available in this subcategory.
          </p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="container mx-auto px-0 pt-5"
      variants={containerVariants}
      initial="hidden"
      animate="visible">
      <motion.div className="mb-8 pl-4" variants={itemVariants}>
        <h1 className="text-3xl font-bold">{formattedSubCategoryName}</h1>
        <p className="text-gray-600 text-sm">
          Browse our selection of {formattedSubCategoryName} products
        </p>
      </motion.div>
      <PopularProducts categoryId={categoryId} />
      <motion.div
        className="mb-12 px-2 md:px-4"
        variants={itemVariants}
        transition={{ delay: 0.1 }}>
        <h2 className="text-2xl font-bold mb-6 text-gray-900">All Products</h2>
        <MasonryGrid
          items={data.products}
          distributeLeftToRight={true}
          renderItem={(product) => (
            <motion.div key={product.id} variants={itemVariants} className="w-full relative group">
              <MasonryProductCard product={product} hideBadge={true} showAddToCart={true} dynamicBackground={true} />
            </motion.div>
          )}
          placeholders={[
            <SearchPlaceholder key="p1" />,
            <ExplorePlaceholder key="p2" />
          ]}
        />
      </motion.div>
    </motion.div>
  );
}
