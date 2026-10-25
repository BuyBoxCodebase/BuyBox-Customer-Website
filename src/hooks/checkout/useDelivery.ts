import { useEffect, useState } from "react";
import axios from "axios";

export type FulfillmentType = "PICKUP" | "DELIVERY";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Hub {
  id: string;
  name: string;
  address: string;
  coordinates: Coordinates | null;
}

export interface DeliveryQuote {
  hubId: string;
  hubName: string;
  transferFee: number;
  handlingFee: number;
  deliveryFee: number;
  deliveryDistanceKm: number | null;
  totalFee: number;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// The hubs a customer can pick up from or have their order delivered from.
export const useHubs = () => {
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Bumped by retry() to fetch again
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    axios
      .get<Hub[]>(`${BACKEND_URL}/api/locations`)
      .then((response) => {
        if (!cancelled) setHubs(response.data);
      })
      .catch((err) => {
        console.error("Error loading hubs:", err);
        if (!cancelled) setError("Could not load hubs");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  return { hubs, loading, error, retry: () => setAttempt((n) => n + 1) };
};

// Fee breakdown from the server. The order recalculates it, so this is for display only.
export const useDeliveryQuote = (params: {
  productIds: string[];
  method: FulfillmentType;
  hubId: string | null;
  coordinates: Coordinates | null;
}) => {
  const [quote, setQuote] = useState<DeliveryQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { method, hubId, coordinates } = params;
  const productKey = [...new Set(params.productIds)].sort().join(",");
  const latitude = coordinates?.latitude;
  const longitude = coordinates?.longitude;

  useEffect(() => {
    setQuote(null);
    setError(null);

    const needsLocation = method === "DELIVERY" && (latitude === undefined || longitude === undefined);
    if (!productKey || !hubId || needsLocation) {
      return;
    }

    let cancelled = false;
    setLoading(true);
    axios
      .post<DeliveryQuote>(`${BACKEND_URL}/api/checkout/delivery-quote`, {
        productIds: productKey.split(","),
        method,
        hubId,
        customerCoordinates: method === "DELIVERY" ? { latitude, longitude } : undefined,
      })
      .then((response) => {
        if (!cancelled) setQuote(response.data);
      })
      .catch((err) => {
        if (!cancelled) setError(readErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [productKey, method, hubId, latitude, longitude]);

  return { quote, loading, error };
};

function readErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) return message.join(", ");
    if (typeof message === "string") return message;
  }
  return "Could not calculate delivery fees";
}
