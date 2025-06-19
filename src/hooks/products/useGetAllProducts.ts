import { ProductsByCategory } from "@/types/product";
import axios from "axios";
import { useEffect, useState } from "react";

export default function useGetAllProducts(categoryId?: string | undefined) {
  // console.log(categoryId)
  const [products, setProducts] = useState<ProductsByCategory>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const url = categoryId
          ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/product/get-all-product/?category=${categoryId}`
          : `${process.env.NEXT_PUBLIC_BACKEND_URL}/product/get-all-product/`;

        const response = await axios.get(url);
        //console.log(response.data)

        if (typeof response.data === "object") {
          setProducts(response.data);
        } else {
          setProducts({});
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(true);
        setProducts({});
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId]);

  return { products, loading, error };
}
