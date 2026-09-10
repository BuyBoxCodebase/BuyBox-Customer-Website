"use client";

import ProductRail from "./ProductRail";
import { Category } from "@/types/category";

interface HomeRecommendationsProps {
  categories: Category[];
  /** How many category rails to render for visitors we cannot personalise for */
  maxCategoryRails?: number;
}

export default function HomeRecommendations({
  categories,
  maxCategoryRails = 6,
}: HomeRecommendationsProps) {
  return (
    <div className="container mx-auto px-2 md:px-4 lg:px-4">
      {categories.slice(0, maxCategoryRails).map((category) => (
        <ProductRail
          key={category.id}
          title={`Popular in ${category.name}`}
          seeAllHref={`/category/${category.id}`}
          categoryId={category.id}
        />
      ))}
    </div>
  );
}
