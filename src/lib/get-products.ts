
import type { Product } from "@/types/product";
import type { PopularProductSnapshot } from "@/hooks/products/usePopularProducts";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const PRODUCT_LIST_TAG = "subcategory-products";
export const ONE_DAY = 86400;
export const LISTING_PAGE_SIZE = 20;

export interface ProductPage {
  products: Product[];
  page: number;
  hasMore: boolean;
}

export function readPage(raw: string | string[] | undefined): number {
  const value = Number(Array.isArray(raw) ? raw[0] : raw);
  return Number.isInteger(value) && value >= 1 ? value : 1;
}

const cached = { next: { tags: [PRODUCT_LIST_TAG], revalidate: ONE_DAY } };

export async function getCategoryProductsPage(categoryId: string, page: number): Promise<ProductPage | null> {
  try {
    const query = new URLSearchParams({ categoryId, page: String(page), pageSize: String(LISTING_PAGE_SIZE) });
    const res = await fetch(`${BACKEND_URL}/product/get-by-category?${query}`, cached);
    if (!res.ok) {
      console.error("Failed to fetch category products", res.status);
      return null;
    }
    const data = await res.json();
    return { products: data.products ?? [], page: data.page ?? page, hasMore: !!data.hasMore };
  } catch (error) {
    console.error("Error fetching category products", error);
    return null;
  }
}

export async function getSubcategoryProductsPage(
  categoryId: string,
  subCategoryName: string,
  page: number
): Promise<ProductPage | null> {
  try {
    const query = new URLSearchParams({
      categoryId,
      subCategoryName,
      page: String(page),
      pageSize: String(LISTING_PAGE_SIZE),
    });
    const res = await fetch(`${BACKEND_URL}/product/get-by-subcategory?${query}`, cached);
    if (!res.ok) {
      console.error("Failed to fetch subcategory products", res.status);
      return null;
    }
    const data = await res.json();
    return { products: data.products ?? [], page: data.page ?? page, hasMore: !!data.hasMore };
  } catch (error) {
    console.error("Error fetching subcategory products", error);
    return null;
  }
}

export async function getPopularSnapshots(categoryId?: string | null, limit = 20): Promise<PopularProductSnapshot[]> {
  try {
    const query = new URLSearchParams({ limit: String(limit) });
    if (categoryId) query.set("categoryId", categoryId);
    const res = await fetch(`${BACKEND_URL}/product/popular?${query}`, {
      next: { tags: ["popular-products"], revalidate: 10800 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching popular products", error);
    return [];
  }
}

export interface ProductPageData {
  product: Product | null;
  isVariant: boolean;
}

export async function getProductForPage(id: string): Promise<ProductPageData | null> {
  const encoded = encodeURIComponent(id);

  try {
    const variantRes = await fetch(`${BACKEND_URL}/product/variant/${encoded}`, cached);
    if (variantRes.ok) {
      const data = await variantRes.json();
      if (data?.product) return { product: data.product, isVariant: true };
    } else if (variantRes.status !== 404 && variantRes.status !== 400) {
      return null;
    }

    const productRes = await fetch(`${BACKEND_URL}/product/get-product/${encoded}`, cached);
    if (productRes.ok) return { product: await productRes.json(), isVariant: false };
    if (productRes.status === 404 || productRes.status === 400) return { product: null, isVariant: false };
    return null;
  } catch (error) {
    console.error("Error fetching product", error);
    return null;
  }
}
