import { Product } from "@/types/product";
import { useEffect, useState } from "react";
import { getPopularProductsAction } from "@/actions/products/getPopularProducts";

export interface PopularProductSnapshot {
  id: string;
  categoryId: string;
  segmentId: number | null;
  productId: string;
  rank: number;
  unitsSold: number;
  product?: Product;
}

export default function usePopularProducts(
  categoryId?: string | null,
  customerId?: string | null,
  limit: number = 20,
  enabled: boolean = true
) {
  const [popularProducts, setPopularProducts] = useState<PopularProductSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const fetchPopularProducts = async () => {
      setLoading(true);
      try {
        const data = await getPopularProductsAction(categoryId, customerId, limit);
        setPopularProducts(data);
      } catch (err) {
        console.error("Error fetching popular products:", err);
        setError(true);
        setPopularProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularProducts();
  }, [categoryId, customerId, limit, enabled]);

  return { popularProducts, loading, error };
}
