"use server";

import { PopularProductSnapshot } from "@/hooks/products/usePopularProducts";

export async function getPopularProductsAction(
  categoryId?: string | null,
  customerId?: string | null,
  limit: number = 20
): Promise<PopularProductSnapshot[]> {
  try {
    let url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/product/popular?limit=${limit}`;
    if (categoryId) {
      url += `&categoryId=${categoryId}`;
    }
    if (customerId) {
      url += `&customerId=${customerId}`;
    }

    const response = await fetch(url, {
      next: {
        revalidate: 10800, // Cache for 3 hours (10800 seconds)
        tags: ["popular-products"],
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch popular products");
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error in getPopularProductsAction:", error);
    throw error;
  }
}
