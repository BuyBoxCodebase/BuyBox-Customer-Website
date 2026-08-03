import { getCategories } from "@/lib/get-category";
import type { MetadataRoute } from "next";
import axios from "axios";
import { Product } from "@/types/product";
import { Category, SubCategory } from "@/types/category";

const BASE_URL = "https://www.buyboxie.com";

async function getProducts(): Promise<Product[]> {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/product/get-all-product/`
    );
    return Object.values(res.data).flat() as Product[];
  } catch (e) {
    console.error("Sitemap: failed to fetch products", e);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];

  // Category routes
  const categoryRoutes: MetadataRoute.Sitemap = categories.map(
    (category: Category) => ({
      url: `${BASE_URL}/category/${category.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })
  );

  // Subcategory routes
  const subcategoryRoutes: MetadataRoute.Sitemap = categories.flatMap(
    (category: Category) =>
      (category.subCategories || []).map((sub: SubCategory) => ({
        url: `${BASE_URL}/subcategory/${category.id}%2F${encodeURIComponent(sub.name)}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }))
  );

  // Product routes
  const productRoutes: MetadataRoute.Sitemap = products.map(
    (product: Product) => ({
      url: `${BASE_URL}/product/${product.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })
  );

  // Variant routes — each variant has its own product page
  const variantRoutes: MetadataRoute.Sitemap = products.flatMap(
    (product: Product) =>
      (product.variants || [])
        .filter((v) => !v.isDefault) // default variant covered by product route
        .map((variant) => ({
          url: `${BASE_URL}/product/${variant.id}`,
          lastModified: new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        }))
  );

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...subcategoryRoutes,
    ...productRoutes,
    ...variantRoutes,
  ];
}