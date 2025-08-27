import { useState, useEffect } from "react";
import axios from "axios";
import { Order } from "@/types/order/get_all_orders";

const useGetAllOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get<Order[]>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/order/get-all-orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setOrders(response.data);
      return response.data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch orders";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders when token changes
  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  // Function to manually refresh orders
  const refreshOrders = () => {
    return fetchOrders();
  };

  return {
    orders,
    loading,
    error,
    refreshOrders,
  };
};

export default useGetAllOrders;
