"use client";
import useGetAllCategory from "@/hooks/category/useGetAllCategory";
import React from "react";
import SubCatSection from "./SubCatSection";
import LandingPageSkeleton from "../Skeleton/LandingSkeleton";

const LandingPage = () => {
  const { categories, loading } = useGetAllCategory();

  if (loading) {
    return (
      <div className="container mx-auto px-4 pt-8">
        <LandingPageSkeleton />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 md:px-4 lg:px-4">
      {categories.map((category) => (
        <SubCatSection
          key={category.id}
          categoryTitle={category.name}
          subcategories={category.subCategories}
          isLast={category.id === categories[categories.length - 1].id}
        />
      ))}
    </div>
  );
};

export default LandingPage;