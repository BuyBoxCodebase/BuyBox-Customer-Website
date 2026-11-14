import { Suspense } from "react";
import SubcategoryPageClient from "./SubcategoryPageClient";
import { getPopularSnapshots, getSubcategoryProductsPage, readPage } from "@/lib/get-products";
import { MasonrySkeleton } from "@/components/ui/MasonrySkeleton";


export default async function SubcategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ subcategoryId: string | string[] }>;
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const resolvedParams = await params;
  const subcategoryParam = Array.isArray(resolvedParams.subcategoryId)
    ? resolvedParams.subcategoryId[0]
    : resolvedParams.subcategoryId;

  const decodedParam = subcategoryParam ? decodeURIComponent(subcategoryParam) : "";
  const [categoryId, subCategoryName] = decodedParam.split("/");
  const page = readPage((await searchParams).page);

  return (
    <Suspense key={`${decodedParam}:${page}`} fallback={<MasonrySkeleton />}>
      <SubcategoryProducts categoryId={categoryId} subCategoryName={subCategoryName} page={page} />
    </Suspense>
  );
}

async function SubcategoryProducts({
  categoryId,
  subCategoryName,
  page,
}: {
  categoryId: string;
  subCategoryName: string;
  page: number;
}) {
  const [result, popular] = await Promise.all([
    getSubcategoryProductsPage(categoryId, subCategoryName, page),
    getPopularSnapshots(categoryId),
  ]);

  // Format the subcategory name for display
  const formattedSubCategoryName = subCategoryName
    ? subCategoryName
      .trim()
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
    : "";

  return (
    <SubcategoryPageClient
      products={result?.products ?? null}
      page={page}
      hasMore={result?.hasMore ?? false}
      formattedSubCategoryName={formattedSubCategoryName}
      categoryId={categoryId}
      popular={popular}
    />
  );
}
