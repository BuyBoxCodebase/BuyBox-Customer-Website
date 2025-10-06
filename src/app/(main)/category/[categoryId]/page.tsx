"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import useGetAllProducts from "@/hooks/products/useGetAllProducts";
import { ProductCard } from "@/components/ui/ProductCard";
import { Product } from "@/types/product";
import { ProductsSkeleton } from "@/components/Skeleton/Product";
import { usePageTracking } from "@/hooks/analytics";

// Custom hook for responsive columns (same as before)
const useResponsiveColumns = () => {
  const [columns, setColumns] = useState(2);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1024) setColumns(6);
      else if (width >= 768) setColumns(4);
      else if (width >= 640) setColumns(3);
      else setColumns(2);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return columns;
};

function CategoryPageContent() {
  const params = useParams();
  usePageTracking();
  const columns = useResponsiveColumns();
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

    // // Sort products - in-stock items first
    // const sortedProducts = [...filteredProducts].sort((a, b) => {
    //   const getQuantity = (product: Product): number =>
    //     product.inventory?.quantity ?? 0;

    //   const quantityA = getQuantity(a);
    //   const quantityB = getQuantity(b);

    //   if (quantityA > 0 && quantityB === 0) return -1;
    //   if (quantityA === 0 && quantityB > 0) return 1;
    //   return 0;
    // });

    setCategoryProducts(sortedProducts);
  }, [products, categoryId]);

  // Render loading state
  if (productsLoading || categoryId === null) {
    return <ProductsSkeleton columns={columns} />;
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
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">{categoryTitle}</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {categoryProducts.map((product: Product) => (
          <div key={product.id} className="relative">
            <ProductCard product={product} />
            {(product.inventory?.quantity === 0 ||
              product.inventory?.quantity === undefined) && (
              <span className="absolute top-0 left-0 bg-red-500 text-black px-2 py-1 text-xs">
                Sold Out
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CategoryPage() {
  return (
    <Suspense fallback={<ProductsSkeleton columns={2} />}>
      <CategoryPageContent />
    </Suspense>
  );
}
