import { getCategories } from "@/lib/get-category";
import type { MetadataRoute } from "next";

// To help search engine crawlers crawl your site more efficiently.

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const categories = await getCategories();
  const dynamicSubCategoryRoutes = categories.map((category) => ({
    url: `https://buybox1.co.za/subcategory/${category.id}`,
    lastModified: new Date(),
  }));
  // const dynamicProductRoutes = product.map((category) => ({
  //   url: `https://buybox1.co.za/subcategory/${category.id}`,
  //   lastModified: new Date(),
  // }));

  return [
    {
      url: "https://buybox1.co.za",
      lastModified: new Date(),
    },
    // {
    //   url: "https://buybox1.co.za/market",
    //   lastModified: new Date(),
    // },
    {
      url: "https://buybox1.co.za/search",
      lastModified: new Date(),
    },
    {
      url: "https://buybox1.co.za/cart",
      lastModified: new Date(),
    },
    // {
    //   url: "https://buybox1.co.za/deals",
    //   lastModified: new Date(),
    // },
    ...dynamicSubCategoryRoutes,
  ];
}
