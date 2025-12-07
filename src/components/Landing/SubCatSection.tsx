"use client";
import { HoverEffect } from "../ui/card-hover-effect";
import { SubCategory } from "@/types/category";

interface SubCatSectionProps {
  subcategories: SubCategory[];
  categoryTitle: string;
  isLast?: boolean;
}

export default function SubCatSection({
  categoryTitle,
  subcategories,
  isLast = false, 
}: SubCatSectionProps) {
  // If no subcategories exist, don't render the section
  if (!subcategories || subcategories.length === 0) {
    return null;
  }

  // Transform subcategories into the format expected by HoverEffect
  const formattedItems = subcategories.map((subCategory) => ({
    title: subCategory.name,
    // link: `/subcategory/${subCategory.categoryId}%2F${subCategory.name}`,
    link: `/subcategory/${subCategory.id}`,
    image: subCategory.imageUrl,
  }));

  return (
    <>
      <section className="mb-8">
        <div className="flex flex-wrap justify-between items-center mb-4">
          <h2 className="w-full whitespace-normal break-words md:w-auto text-xl md:text-2xl lg:text-2xl font-bold pl-2 lg:pl-4">
            {categoryTitle}
          </h2>
        </div>
        <HoverEffect items={formattedItems} />
      </section>

      {/* Page break - only show if not the last category */}
      {!isLast && <hr className="border-t border-gray-200 my-8" />}
    </>
  );
}