import { useState } from "react";
import axios from "axios";
import {
  CreateOrderRequest,
  CreateOrderResponse,
} from "@/types/order/create_order";

const useCreateOrder = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<CreateOrderResponse | null>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const createOrder = async (orderDetails: CreateOrderRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post<CreateOrderResponse>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/order/create-order`,
        orderDetails,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setOrderData(response.data);
      return response.data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create order";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createOrder,
    loading,
    error,
    orderData,
  };
};

export default useCreateOrder;
