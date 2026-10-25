import { ProductsByCategory } from "@/types/product";
import { useEffect, useState } from "react";
import { getAllProductsAction } from "@/actions/products/getAllProducts";

export default function useGetAllProducts(categoryId?: string | undefined) {
  // console.log(categoryId)
  const [products, setProducts] = useState<ProductsByCategory>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await getAllProductsAction(categoryId);
        setProducts(data);
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
