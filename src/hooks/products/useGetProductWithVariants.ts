import { useState, useEffect } from "react";
import axios from "axios";
import { Product } from "@/types/product";

const useGetProductWithVariants = (id: string | undefined) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVariant, setIsVariant] = useState(false);

  useEffect(() => {
    if (!id) {
      setError("ID is required");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        let response;

        try {
          response = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/product/variant/${id}`
          );

          if (response.data && response.data.product) {
            setIsVariant(true);
            const { selectedVariant, ...productData } = response.data.product;

            if (selectedVariant) {
              setProduct({
                ...productData,
                selectedVariant
              });
            } else {
              setProduct(productData);
            }
          }
        } catch (variantError) {
          setIsVariant(false);
          response = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/product/get-product/${id}`
          );

          setProduct(response.data);
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || "Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return { product, loading, error, isVariant };
};

export default useGetProductWithVariants;