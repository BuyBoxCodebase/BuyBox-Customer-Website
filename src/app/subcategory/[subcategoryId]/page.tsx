"use client";
import { ProductCard } from "@/components/ui/ProductCard";
import useGetAllProducts from "@/hooks/products/useGetAllProducts";
import { useParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { usePageTracking } from "@/hooks/analytics";
import { Product } from "@/types/product";

function SubcategoryPageContent() {
  const params = useParams();
  usePageTracking();
  const [isLoading, setIsLoading] = useState(true);
  const subcategoryParam = Array.isArray(params.subcategoryId)
    ? params.subcategoryId[0]
    : params.subcategoryId;

  // Decode the parameter and split it into categoryId and subCategoryName.
  const decodedParam = subcategoryParam
    ? decodeURIComponent(subcategoryParam)
    : "";
  const [categoryId, subCategoryName] = decodedParam.split("/");

  // Fetch products using the categoryId
  const { products, loading } = useGetAllProducts(categoryId);

  // Format the subcategory name for display (replace hyphens with spaces, capitalize)
  const formattedSubCategoryName = subCategoryName
    ? subCategoryName
        .trim()
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
    : "";

  useEffect(() => {
    if (!loading) {
      setIsLoading(false);
    }
  }, [loading]);

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
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Check if the products object is empty
  if (Object.keys(products).length === 0) {
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
          className="bg-gray-50 rounded-xl p-8 text-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}>
          <p className="text-gray-600 text-lg">
            No products available in this category.
          </p>
        </motion.div>
      </motion.div>
    );
  }

  // Find products that match the subcategory
  const filteredProductGroups = Object.entries(products)
    .map(([groupName, productArray]) => {
      // Filter products based on the subCategory.name property instead of direct subCategory value
      const filteredProducts = productArray.filter(
        (product: any) => product.subCategory?.name === subCategoryName
      );

      return {
        groupName,
        products: filteredProducts,
      };
    })
    .filter((group) => group.products.length > 0);

  const hasMatchingProducts = filteredProductGroups.length > 0;

  // console.log(filteredProductGroups);

  if (!hasMatchingProducts) {
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
      className="container mx-auto px-0 py-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible">
      <motion.div className="mb-8 pl-4" variants={itemVariants}>
        <h1 className="text-3xl font-bold">{formattedSubCategoryName}</h1>
        <p className="text-gray-600 mt-2">
          Browse our selection of {formattedSubCategoryName} products
        </p>
      </motion.div>

      {filteredProductGroups.map(
        ({ groupName, products: filteredProducts }, groupIndex) => {
          // Sort products by inventory quantity (highest first)
          const sortedProducts = [...filteredProducts].sort((a, b) => {
            const aQty = a.inventory?.quantity || 0;
            const bQty = b.inventory?.quantity || 0;
            return bQty - aQty;
          });

          return (
            <motion.div
              key={groupName}
              className="mb-12"
              variants={itemVariants}
              transition={{ delay: 0.1 * groupIndex }}>
              {groupName !== subCategoryName && (
                <motion.h2
                  className="text-2xl font-bold mb-6 pl-2"
                  variants={itemVariants}>
                  {groupName}
                </motion.h2>
              )}

              <div className="grid grid-cols-1 gap-0">
                {sortedProducts.map((product: Product, index) => (
                  <motion.div
                    key={product.id}
                    variants={itemVariants}
                    custom={index}
                    transition={{ delay: 0.05 * index }}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );
        }
      )}
    </motion.div>
  );
}

export default function SubcategoryPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <SubcategoryPageContent />
    </Suspense>
  );
}
