import { useState, useEffect } from "react";
import axios from "axios";
import { OrderDetails } from "@/types/order/get_order_details";
import Cookies from "js-cookie";
import { useAuth } from "@/context/AuthContext";

const useGetOrderDetails = (orderId: string | undefined) => {
  // Initialize all hooks unconditionally at the top level
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchOrderDetails = async () => {
    if (!orderId || !isAuthenticated) return null;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get<OrderDetails>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/order/get-order-details/${orderId}`,
        {
          withCredentials: true,
        }
      );

      setOrderDetails(response.data);
      return response.data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch order details";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId && isAuthenticated) {
      fetchOrderDetails();
    }
  }, [orderId, isAuthenticated]); // Include fetchOrderDetails in dependencies if needed

  const refreshOrderDetails = () => {
    return fetchOrderDetails();
  };

  return {
    orderDetails,
    loading,
    error,
    refreshOrderDetails,
  };
};

export default useGetOrderDetails;
