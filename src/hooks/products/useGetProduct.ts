import { useState, useEffect } from "react";
import axios from "axios";
import { Product } from "@/types/product";

const useGetProduct = (productId: string | undefined) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) {
      setError("Product ID is required");
      setLoading(false);
      return;
    }
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get<Product>(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/product/get-product/${productId}`
        );
        setProduct(response.data);
      } catch (err: any) {
        setError(err?.message || "Error fetching product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  return { product, loading, error };
};

export default useGetProduct;
