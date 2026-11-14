import ProductPageContent from "@/components/pages/ProductPage/ProductPageContent";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { getPopularSnapshots, getProductForPage } from "@/lib/get-products";
import { Suspense } from "react";


export default async function ProductPage({ params }: { params: Promise<{ id: string | string[] }> }) {
  const { id: raw } = await params;
  const id = decodeURIComponent(Array.isArray(raw) ? raw[0] : raw);

  const initialData = (await getProductForPage(id)) ?? undefined;
  const categoryId = initialData?.product?.categoryId;
  const popular = categoryId ? await getPopularSnapshots(categoryId) : undefined;

  return (
    <Suspense fallback={<LoadingScreen />}>
      <ProductPageContent key={id} initialData={initialData} popular={popular} />
    </Suspense>
  );
}
