import { Suspense } from "react";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import SubcategoryPageClient from "./SubcategoryPageClient";

async function getProducts(categoryId: string, subCategoryName: string) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    const url = `${backendUrl}/product/get-by-subcategory?categoryId=${encodeURIComponent(categoryId)}&subCategoryName=${encodeURIComponent(subCategoryName)}`;

    // We use Next.js tags to allow on-demand revalidation when products change
    // We also set a TTL (revalidate) of 1 hour (3600 seconds) as a fallback
    const res = await fetch(url, {
      next: {
        tags: ['subcategory-products'],
        revalidate: 3600
      }
    });

    if (!res.ok) {
      console.error("Failed to fetch subcategory products", res.status);
      return null;
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching subcategory products", error);
    return null;
  }
}

export default async function SubcategoryPage({ params }: { params: Promise<{ subcategoryId: string | string[] }> }) {
  const resolvedParams = await params;
  const subcategoryParam = Array.isArray(resolvedParams.subcategoryId)
    ? resolvedParams.subcategoryId[0]
    : resolvedParams.subcategoryId;

  const decodedParam = subcategoryParam ? decodeURIComponent(subcategoryParam) : "";
  const [categoryId, subCategoryName] = decodedParam.split("/");

  // Fetch data on the server
  const rawData = await getProducts(categoryId, subCategoryName);

  // Format the subcategory name for display
  const formattedSubCategoryName = subCategoryName
    ? subCategoryName
      .trim()
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
    : "";

  // Process data to match what SubcategoryPageClient expects
  let allProducts: any[] = [];
  if (rawData && typeof rawData === 'object') {
    Object.entries(rawData).forEach(([groupName, productArray]: [string, any]) => {
      if (Array.isArray(productArray)) {
        const filteredProducts = productArray.filter(
          (product: any) => product.subCategory?.name === subCategoryName
        );
        allProducts = [...allProducts, ...filteredProducts];
      }
    });
    
    // Sort products by inventory quantity (highest first)
    allProducts.sort((a, b) => {
      const aQty = a.inventory?.quantity || 0;
      const bQty = b.inventory?.quantity || 0;
      return bQty - aQty;
    });
  }

  const processedData = {
    groupName: formattedSubCategoryName,
    products: allProducts
  };

  return (
    <Suspense fallback={<LoadingScreen />}>
      <SubcategoryPageClient 
        data={processedData} 
        formattedSubCategoryName={formattedSubCategoryName} 
        categoryId={categoryId}
      />
    </Suspense>
  );
}
