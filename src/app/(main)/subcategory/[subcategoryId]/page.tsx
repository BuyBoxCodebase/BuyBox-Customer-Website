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
  const data = await getProducts(categoryId, subCategoryName);

  // Format the subcategory name for display
  const formattedSubCategoryName = subCategoryName
    ? subCategoryName
      .trim()
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
    : "";

  useEffect(() => {
    if (!loading) {
      setIsLoading(false);
    }
  }, [loading]);

  // Animation variants for content transitions
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 24,
      },
    },
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Check if the products object is empty
  if (Object.keys(products).length === 0) {
    return (
      <motion.div
        className="container mx-auto px-4 py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}>
        <motion.h1 className="text-3xl font-bold mb-8" variants={itemVariants}>
          {formattedSubCategoryName}
        </motion.h1>
        <motion.div
          className="bg-gray-50 rounded-xl p-8 text-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}>
          <p className="text-gray-600 text-lg">
            No products available in this category.
          </p>
        </motion.div>
      </motion.div>
    );
  }

  // Find products that match the subcategory
  const filteredProductGroups = Object.entries(products)
    .map(([groupName, productArray]) => {
      // Filter products based on the subCategory.name property instead of direct subCategory value
      const filteredProducts = productArray.filter(
        (product: any) => product.subCategory?.name === subCategoryName
      );

      return {
        groupName,
        products: filteredProducts,
      };
    })
    .filter((group) => group.products.length > 0);

  const hasMatchingProducts = filteredProductGroups.length > 0;

  // console.log(filteredProductGroups);

  if (!hasMatchingProducts) {
    return (
      <motion.div
        className="container mx-auto px-4 py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}>
        <motion.h1 className="text-3xl font-bold mb-8" variants={itemVariants}>
          {formattedSubCategoryName}
        </motion.h1>
        <motion.div
          className="bg-gray-50 rounded-xl p-8 text-center shadow-sm"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}>
          <p className="text-gray-600 text-lg">
            No products available in this subcategory.
          </p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="container mx-auto px-0 py-24"
      variants={containerVariants}
      initial="hidden"
      animate="visible">
      <motion.div className="mb-8 pl-4" variants={itemVariants}>
        <h1 className="text-3xl font-bold">{formattedSubCategoryName}</h1>
        <p className="text-gray-600 mt-2">
          Browse our selection of {formattedSubCategoryName} products
        </p>
      </motion.div>

      {filteredProductGroups.map(
        ({ groupName, products: filteredProducts }, groupIndex) => {
          // Sort products by inventory quantity (highest first)
          const sortedProducts = [...filteredProducts].sort((a, b) => {
            const aQty = a.inventory?.quantity || 0;
            const bQty = b.inventory?.quantity || 0;
            return bQty - aQty;
          });

          return (
            <motion.div
              key={groupName}
              className="mb-12"
              variants={itemVariants}
              transition={{ delay: 0.1 * groupIndex }}>
              {groupName !== subCategoryName && (
                <motion.h2
                  className="text-2xl font-bold mb-6 pl-2"
                  variants={itemVariants}>
                  {groupName}
                </motion.h2>
              )}

              <div className="grid grid-cols-1 gap-0">
                {sortedProducts.map((product: Product, index) => (
                  <motion.div
                    key={product.id}
                    variants={itemVariants}
                    custom={index}
                    transition={{ delay: 0.05 * index }}>
                    <ProductCard product={product} layout="list" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );
        }
      )}
    </motion.div>
  );
}

export default function SubcategoryPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <SubcategoryPageClient
        data={data}
        formattedSubCategoryName={formattedSubCategoryName}
      />
    </Suspense>
  );
}
