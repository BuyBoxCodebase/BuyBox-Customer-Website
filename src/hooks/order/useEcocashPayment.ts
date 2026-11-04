import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  ECOCASH_PENDING_STATUSES,
  type EcocashPayment,
  type InitiateEcocashPaymentRequest,
} from "@/types/order/ecocash_payment";

const POLL_INTERVAL_MS = 4000;

const GIVE_UP_AFTER_EXPIRY_MS = 2 * 60 * 1000;

const authHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
};

export const ecocashErrorMessage = (err: unknown, fallback: string) => {
  if (axios.isAxiosError(err)) {
    const message = err.response?.data?.message;
    if (typeof message === "string") return message;
    if (Array.isArray(message) && typeof message[0] === "string") return message[0];
  }
  return fallback;
};

const useEcocashPayment = () => {
  const [payment, setPayment] = useState<EcocashPayment | null>(null);
  const [starting, setStarting] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  const isPending = !!payment && ECOCASH_PENDING_STATUSES.includes(payment.status) && !timedOut;

  const start = useCallback(async (body: InitiateEcocashPaymentRequest) => {
    setStarting(true);
    setTimedOut(false);
    try {
      const res = await axios.post<EcocashPayment>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/payments/ecocash/initiate`,
        body,
        { headers: authHeaders() }
      );
      setPayment(res.data);
      return res.data;
    } finally {
      setStarting(false);
    }
  }, []);

  const reset = useCallback(() => {
    setPayment(null);
    setTimedOut(false);
  }, []);

  useEffect(() => {
    if (!payment || !isPending) return;

    const timer = setTimeout(async () => {
      if (Date.now() > new Date(payment.expiresAt).getTime() + GIVE_UP_AFTER_EXPIRY_MS) {
        setTimedOut(true);
        return;
      }
      try {
        const res = await axios.get<EcocashPayment>(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/payments/ecocash/${payment.id}/status`,
          { headers: authHeaders() }
        );
        setPayment(res.data);
      } catch {
        // Network blip: poll again with the same payment
        setPayment((prev) => (prev ? { ...prev } : prev));
      }
    }, POLL_INTERVAL_MS);

    return () => clearTimeout(timer);
  }, [payment, isPending]);

  return { payment, start, reset, starting, isPending, timedOut };
};

export default useEcocashPayment;
