"use client";
import CategorySection from "@/components/Landing/CategorySection";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { usePageTracking } from "@/hooks/analytics";
import useGetAllCategory from "@/hooks/category/useGetAllCategory";
import { Suspense } from "react";

function MarketPageContent() {
  const { categories, loading } = useGetAllCategory();
  usePageTracking();
  return (
    <div className='flex flex-col gap-8 container mx-auto px-4 py-8'>
      {categories.map((category) => (
        <CategorySection key={category.id} category={category} />
      ))}
    </div>
  );
}

export default function MarketPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <MarketPageContent />
    </Suspense>
  );
}
