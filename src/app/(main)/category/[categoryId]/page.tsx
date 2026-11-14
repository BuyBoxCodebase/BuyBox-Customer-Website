import { Suspense } from "react";
import { getCategories } from "@/lib/get-category";
import { getCategoryProductsPage, readPage } from "@/lib/get-products";
import { MasonrySkeleton } from "@/components/ui/MasonrySkeleton";
import CategoryPageClient from "./CategoryPageClient";

function CategorySkeleton() {
  return (
    <div className="container mx-auto p-4">
      <MasonrySkeleton />
    </div>
  );
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ categoryId: string | string[] }>;
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const { categoryId: raw } = await params;
  const categoryId = decodeURIComponent(Array.isArray(raw) ? raw[0] : raw);
  const page = readPage((await searchParams).page);

  return (
    <Suspense key={`${categoryId}:${page}`} fallback={<CategorySkeleton />}>
      <CategoryProducts categoryId={categoryId} page={page} />
    </Suspense>
  );
}

async function CategoryProducts({ categoryId, page }: { categoryId: string; page: number }) {
  const [result, categories] = await Promise.all([getCategoryProductsPage(categoryId, page), getCategories()]);
  const categoryTitle =
    categories.find((category) => category.id.toLowerCase() === categoryId.toLowerCase())?.name ??
    result?.products[0]?.category?.name ??
    "Category";

  return (
    <CategoryPageClient
      categoryId={categoryId}
      categoryTitle={categoryTitle}
      products={result?.products ?? null}
      page={page}
      hasMore={result?.hasMore ?? false}
    />
  );
}
