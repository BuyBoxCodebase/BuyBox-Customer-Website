import { Product } from "@/types/product";
import axios from "axios";
import { useEffect, useState } from "react";

export interface PopularProductSnapshot {
  id: string;
  categoryId: string;
  segmentId: number | null;
  productId: string;
  rank: number;
  unitsSold: number;
  product?: Product;
}

export default function usePopularProducts(categoryId: string, customerId?: string | null, limit: number = 20) {
  const [popularProducts, setPopularProducts] = useState<PopularProductSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPopularProducts = async () => {
      setLoading(true);
      try {
        let url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/product/popular?categoryId=${categoryId}&limit=${limit}`;
        if (customerId) {
          url += `&customerId=${customerId}`;
        }

        const response = await axios.get(url);

        if (Array.isArray(response.data)) {
          setPopularProducts(response.data);
        } else {
          setPopularProducts([]);
        }
      } catch (err) {
        console.error("Error fetching popular products:", err);
        setError(true);
        setPopularProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchPopularProducts();
    }
  }, [categoryId, customerId, limit]);

  return { popularProducts, loading, error };
}
