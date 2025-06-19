"use client";

import { Product } from "@/types/product";
import useGetAllProducts from "@/hooks/products/useGetAllProducts";
import { ProductCard } from "@/components/ui/ProductCard";
import { ProductsSkeleton } from "@/components/Skeleton/Product";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Category } from "@/types/category";

interface CategorySectionProps {
  category: Category;
  deals?: boolean;
}

export default function CategorySection({
  category,
  deals,
}: CategorySectionProps) {
  const { products, loading } = useGetAllProducts();
  const [productsToShow, setProductsToShow] = useState(6);

  // Determine number of products to show based on screen width
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1024) {
        setProductsToShow(6);
      } else if (width >= 768) {
        setProductsToShow(4);
      } else if (width >= 640) {
        setProductsToShow(3);
      } else {
        setProductsToShow(2);
      }
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (loading) {
    return (
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{category.name}</h2>
          <Link
            href={`/category/${encodeURIComponent(category.id)}`}
            className="text-gray-800 hover:text-orange-600">
            View All
          </Link>
        </div>
        <ProductsSkeleton columns={productsToShow} />
      </section>
    );
  }

  // Filter products based on matching category id
  const categoryProducts: Product[] = Object.values(products)
    .flat()
    .filter(
      (product: Product) =>
        product.category?.id.toLowerCase() === category.id.toLowerCase()
    );

  // Sort products so that in-stock items (inventory > 0) are listed first.
  const sortedProducts = [...categoryProducts].sort((a, b) => {
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

  // Slice only the products that fit the screen
  const displayProducts = sortedProducts.slice(0, productsToShow);
  if (displayProducts.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">
          {deals ? <>Deals on {category.name}</> : <>{category.name}</>}
        </h2>
        <Link
          href={`/category/${category.id}`}
          className="text-gray-800 hover:text-orange-600">
          View All
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {displayProducts.map((product) => (
          <div key={product.id} className="relative">
            <ProductCard product={product} />
            {product.inventory?.quantity === 0 && (
              <div className="absolute top-2 right-2 bg-red-500 text-black px-2 py-1 rounded text-xs">
                Sold Out
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
