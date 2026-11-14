import ProductRail from "./ProductRail";
import { Category } from "@/types/category";
import { getPopularSnapshots } from "@/lib/get-products";

interface HomeRecommendationsProps {
  categories: Category[];
  /** How many category rails to render for visitors we cannot personalise for */
  maxCategoryRails?: number;
}

export default async function HomeRecommendations({
  categories,
  maxCategoryRails = 6,
}: HomeRecommendationsProps) {
  const shown = categories.slice(0, maxCategoryRails);
  const rails = await Promise.all(shown.map((category) => getPopularSnapshots(category.id)));

  return (
    <div className="container mx-auto px-2 md:px-4 lg:px-4">
      {shown.map((category, index) => (
        <ProductRail
          key={category.id}
          title={`Popular in ${category.name}`}
          seeAllHref={`/category/${category.id}`}
          categoryId={category.id}
          snapshots={rails[index]}
        />
      ))}
    </div>
  );
}
