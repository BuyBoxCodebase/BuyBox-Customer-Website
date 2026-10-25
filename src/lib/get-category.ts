import { Category } from "@/types/category";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL 
export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/category/get`,
      {
        next: { 
          tags: ['categories'],
          revalidate: 10800 // 3 hours in seconds (fallback TTL)
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`);
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Sitemap: failed to fetch categories; using empty category list.", err);
    }
    return [];
  }
};
