import React from "react";
import SubCatSection from "./SubCatSection";
import { Category } from "@/types/category";

import { getCategories } from "@/lib/get-category";

const HomeCategories = async () => {
  const categories = await getCategories();
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-2 md:px-4 lg:px-4">
      {categories.map((category: Category) => (
        <SubCatSection
          key={category.id}
          // categoryTitle={category.name}
          categoryTitle={"Categories"}
          subcategories={category.subCategories}
          isLast={category.id === categories[categories.length - 1].id}
        />
      ))}
    </div>
  );
};

export default HomeCategories;