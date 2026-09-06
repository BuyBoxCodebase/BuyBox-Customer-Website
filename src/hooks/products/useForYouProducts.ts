import { Product } from "@/types/product";
import axios from "axios";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function useForYouProducts(limit: number = 50) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    let cancelled = false;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          if (!cancelled) {
            setProducts([]);
            setLoading(false);
          }
          return;
        }

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/recommendation/for-you?limit=${limit}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!cancelled) {
          const list = Array.isArray(response.data?.products) ? response.data.products : [];
          setProducts(list.map(({ _score, _reasons, ...p }: any) => p));
        }
      } catch (err) {
        console.error("Error fetching for-you products:", err);
        if (!cancelled) {
          setError(true);
          setProducts([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (isAuthenticated) {
      fetchProducts();
    } else {
      setProducts([]);
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [limit, isAuthenticated]);

  return { products, loading, error };
}
