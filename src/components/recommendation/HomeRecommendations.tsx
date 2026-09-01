"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import ProductRail from "./ProductRail";
import { Category } from "@/types/category";

interface HomeRecommendationsProps {
  categories: Category[];
  /** How many category rails to render for visitors we cannot personalise for */
  maxCategoryRails?: number;
}

/**
 * Signed-in shoppers get their interest feed and nothing else — generic
 * popularity rails underneath it drown the personalised one and were the
 * reason the homepage read as a trending page.
 *
 * The generic rails are the fallback, not the default: they come back only
 * when "More for you" has nothing to show (no interests picked yet, or too
 * few in-stock products in them), so the page is never left empty.
 */
export default function HomeRecommendations({
  categories,
  maxCategoryRails = 6,
}: HomeRecommendationsProps) {
  const { isAuthenticated } = useAuth();
  const [forYou, setForYou] = useState<"pending" | "shown" | "empty">("pending");
  const [prevAuth, setPrevAuth] = useState(isAuthenticated);

  // Synchronously reset state when authentication changes to prevent race conditions 
  // with child component fetches triggering before a useEffect runs.
  if (prevAuth !== isAuthenticated) {
    setPrevAuth(isAuthenticated);
    setForYou("pending");
  }

  // while a signed-in user's feed is still resolving we show nothing generic,
  // otherwise the rails would flash in and get pulled out from under them

  return (
    <div className="container mx-auto px-2 md:px-4 lg:px-4">
      {isAuthenticated ? (
        <ProductRail
          title="More for you"
          endpoint="/recommendation/for-you?limit=12"
          authenticated
          seeAllHref="/for-you"
          onResult={(visible) => setForYou(visible ? "shown" : "empty")}
        />
      ) : (
        <ProductRail
          title="More for you"
          endpoint="/recommendation/trending?limit=12"
          seeAllHref="/market"
        />
      )}

      {categories.slice(0, maxCategoryRails).map((category) => (
        <ProductRail
          key={category.id}
          title={`Popular in ${category.name}`}
          endpoint={`/recommendation/trending?categoryId=${category.id}&limit=12`}
          seeAllHref={`/category/${category.id}`}
        />
      ))}
    </div>
  );
}
