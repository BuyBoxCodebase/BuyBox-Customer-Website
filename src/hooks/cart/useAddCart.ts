// src/hooks/cart/useAddCart.ts
import { useState } from "react";
import axios from "axios";
import { AddCartResponse } from "@/types/cart/add-to-cart/cart-response";
import Cookies from "js-cookie";

interface Product {
  productId: string;
  quantity: number;
  variantId: string | null;
}

const useAddCart = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addProductToCart = async (
    products: Product[]
  ): Promise<AddCartResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post<AddCartResponse>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/cart/add-cart/`,
        { products },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
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

  return { addProductToCart, loading, error };
};

export default useAddCart;
