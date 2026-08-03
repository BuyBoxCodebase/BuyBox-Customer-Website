import { Category } from "@/types/category";
import axios from "axios";

const getBackendUrl = (): string | undefined => process.env.NEXT_PUBLIC_BACKEND_URL?.trim();

export const getCategories = async (): Promise<Category[]> => {
  const backendUrl = getBackendUrl();

  if (!backendUrl) {
    console.warn("NEXT_PUBLIC_BACKEND_URL is not set. Skipping category fetch for sitemap.");
    return [];
  }

  try {
    const response = await axios.get(`${backendUrl}/category/get`, {
      timeout: 3000,
    });
    return response.data;
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Sitemap: failed to fetch categories; using empty category list.", err);
    }
    return [];
  }
};
