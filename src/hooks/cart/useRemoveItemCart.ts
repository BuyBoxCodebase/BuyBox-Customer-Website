// src/hooks/cart/useAddCart.ts
import { useState } from "react";
import axios from "axios";
import { AddCartResponse } from "@/types/cart/add-to-cart/cart-response";

interface Product {
  productId: string;
  variantId: string | null;
  quantity?: number;
}

const useRemoveItemCart = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const removeProductToCart = async (
    products: Product
  ): Promise<AddCartResponse> => {
    // console.log(products);
    setLoading(true);
    setError(null);

    try {
      const response = await axios.patch<AddCartResponse>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/cart/remove-item/`,
        products,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setLoading(false);
      return response.data;
    } catch (err) {
      setLoading(false);
      if (axios.isAxiosError(err)) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
      return { success: false, message: (err as any).message };
    }
  };

  return { removeProductToCart, loading, error };
};

export default useRemoveItemCart;
