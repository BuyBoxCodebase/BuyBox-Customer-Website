import ProductPageContent from "@/components/pages/ProductPage/ProductPageContent";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { Suspense } from "react";

export default function ProductPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ProductPageContent />
    </Suspense>
  );
}