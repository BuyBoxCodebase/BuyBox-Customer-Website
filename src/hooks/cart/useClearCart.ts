import { useState } from "react";
import axios from "axios";

const useClearCart = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearCart = async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/cart/clear-cart/`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (data === true) {
        // console.log("Products removed from cart");
        return true;
      } else {
        setError("Failed to remove products from cart");
        return false;
      }
    } catch (err) {
      setError("An error occurred while removing the product from the cart");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { clearCart, loading, error };
};

export default useClearCart;
