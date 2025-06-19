import { useState } from "react";
import axios from "axios";
import { CartResponse } from "@/types/cart/get-my-cart/cart-response";
import Cookies from "js-cookie";

const useGetMyCart = () => {
  const [cartItem, setCartItem] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get<CartResponse>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/cart/get-my-cart`,
        {
          withCredentials: true,
        }
      );
      setCartItem(response.data);
      return response.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { cartItem, loading, error, fetchCart };
};

export default useGetMyCart;
