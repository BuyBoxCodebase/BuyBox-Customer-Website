import { useEffect, useState } from "react";
import axios from "axios";
import { OrderPreference } from "@/types/order/create_order";

// The details saved from the customer's last checkout. null when they haven't ordered yet.
const useGetOrderPreference = () => {
  const [preference, setPreference] = useState<OrderPreference | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    axios
      .get<OrderPreference | "">(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/order/order-preference`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        // Nest sends an empty body when nothing is saved yet
        if (!cancelled && response.data) setPreference(response.data);
      })
      .catch((err) => {
        // Prefill is a convenience; the customer can still type everything in
        console.error("Error loading saved checkout details:", err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { preference, loading };
};

export default useGetOrderPreference;
