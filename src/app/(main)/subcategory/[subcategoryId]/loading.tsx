import { MasonrySkeleton } from "@/components/ui/MasonrySkeleton";

// Next.js shows this instantly on navigation while the subcategory page fetches its products on the server.
export default function SubcategoryLoading() {
  return <MasonrySkeleton />;
}
