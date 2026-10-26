import type { Product } from "@/types/product";
import type { SearchProduct } from "@/lib/search";

// Shapes a search result like the Product the shared card and add-to-cart button expect.
// The default variant is the variant that matched the search (e.g. the size 9 in black), so
// "add to cart" adds exactly what the customer searched for.
export function toCardProduct(product: SearchProduct): Product {
  const images = product.image ? [product.image] : product.variantImages;

  return {
    id: product.id,
    brandId: "",
    name: product.name,
    description: product.summary,
    images,
    categoryId: product.categoryId ?? "",
    subCategoryId: product.subCategoryId,
    basePrice: product.price,
    price: product.price,
    category: { id: product.categoryId ?? "", name: product.category ?? "", imageUrl: "" },
    subCategory: null,
    variants: [],
    defaultVariant: {
      id: product.variantId,
      price: product.price,
      isDefault: true,
      images: product.variantImages.length > 0 ? product.variantImages : images,
      inventory: [{ quantity: product.stock }],
      options: product.variantOptions.map((value, index) => ({ id: String(index), optionValue: { value } })),
    },
    inventory: { quantity: product.stock },
  };
}
