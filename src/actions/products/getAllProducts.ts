"use server";

import { ProductsByCategory } from "@/types/product";

export async function getAllProductsAction(
  categoryId?: string | undefined
): Promise<ProductsByCategory> {
  try {
    const url = categoryId
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/product/get-all-product/?category=${categoryId}`
      : `${process.env.NEXT_PUBLIC_BACKEND_URL}/product/get-all-product/`;

    const response = await fetch(url, {
      next: {
        revalidate: 10800, // Cache for 3 hours (10800 seconds)
        tags: ["all-products"],
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch all products");
    }

    const data = await response.json();
    return typeof data === "object" ? data : {};
  } catch (error) {
    console.error("Error in getAllProductsAction:", error);
    throw error;
  }
}
