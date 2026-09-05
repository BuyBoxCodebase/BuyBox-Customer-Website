"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import useGetAllProducts from "@/hooks/products/useGetAllProducts";
import { ProductCard } from "@/components/ui/ProductCard";
import { Product } from "@/types/product";
import { ProductsSkeleton } from "@/components/Skeleton/Product";
import { MasonryGrid } from "@/components/ui/MasonryGrid";
import { MasonryProductCard } from "@/components/ui/MasonryProductCard";
import { MasonrySkeleton } from "@/components/ui/MasonrySkeleton";
import { SearchPlaceholder, ExplorePlaceholder } from "@/components/ui/MasonryPlaceholders";
import { motion } from "framer-motion";
import { usePageTracking } from "@/hooks/analytics";
import { trackEvent } from "@/lib/analytics/core";
import { ProductEventType } from "@/lib/analytics/constants";

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

function CategoryPageContent() {
  const params = useParams();
  usePageTracking();
  const { products, loading: productsLoading, error } = useGetAllProducts();
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [categoryTitle, setCategoryTitle] = useState("Category");
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);

  // Set categoryId from params
  useEffect(() => {
    if (params?.categoryId) {
      const decodedId =
        typeof params.categoryId === "string"
          ? decodeURIComponent(params.categoryId)
          : decodeURIComponent(params.categoryId[0]);
      setCategoryId(decodedId);
      
      trackEvent({
        type: ProductEventType.CATEGORY_VIEW,
        categoryId: decodedId
      });
    } else {
      setCategoryId(null);
    }
  }, [params?.categoryId]);
  // console.log(categoryId)
  // console.log(products)

  // Filter and sort products when data changes
  useEffect(() => {
    // if (!Array.isArray(products) || !categoryId) return;

    // Filter products by category id
    // const filteredProducts = products.filter(product =>
    //   product?.category?.id?.toLowerCase() === categoryId.toLowerCase()
    // );

    const filteredProducts: Product[] = Object.values(products)
      .flat()
      .filter(
        (product: Product) =>
          product.category?.id.toLowerCase() === categoryId?.toLowerCase()
      );
    // console.log(filteredProducts)

    // Sort products so that in-stock items (inventory > 0) are listed first.
    const sortedProducts = [...filteredProducts].sort((a, b) => {
      const getQuantity = (product: Product): number =>
        product.inventory?.quantity ?? 0;
      const quantityA = getQuantity(a);
      const quantityB = getQuantity(b);

      if (quantityA > 0 && quantityB === 0) return -1;
      if (quantityA === 0 && quantityB > 0) return 1;
      if (quantityA > 0 && quantityB > 0) {
        return quantityB - quantityA;
      }
      return 0;
    });

    // Set category title
    if (filteredProducts.length > 0 && filteredProducts[0].category) {
      setCategoryTitle(filteredProducts[0].category.name);
    }

    setCategoryProducts(sortedProducts);
  }, [products, categoryId]);

  // Render loading state
  if (productsLoading || categoryId === null) {
    return (
      <div className="container mx-auto p-4">
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

  // Render error state
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8 text-red-500">
          Error loading products. Please try again later.
        </div>
      </div>
    );
  }

  // Render empty state
  if (categoryProducts.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">{categoryTitle}</h1>
        <div className="text-center py-8">
          No products available in this category.
        </div>
      </div>
    );
  }

  // Render normal state with all products in a grid
  return (
    <div className="pt-4 px-6">
      <h1 className="text-2xl font-bold mb-4">{categoryTitle}</h1>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show">
        <MasonryGrid
          items={categoryProducts}
          distributeLeftToRight={true}
          renderItem={(product) => (
            <motion.div key={product.id} variants={itemVariants} className="w-full relative group">
              <MasonryProductCard product={product} hideBadge={true} showAddToCart={true} dynamicBackground={true} />
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
    </div>
  );
}

export default function CategoryPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto p-4">
        <MasonrySkeleton />
      </div>
    }>
      <CategoryPageContent />
    </Suspense>
  );
}
