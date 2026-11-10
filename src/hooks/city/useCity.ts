"use client";

import { useSyncExternalStore } from "react";
import { CITY_CONFIG, CITY_COOKIE, DEFAULT_CITY, applyCityMarkup, toCity, type City } from "@/lib/city";

const listeners = new Set<() => void>();

const readCityCookie = (): City => {
  try {
    const match = document.cookie.split("; ").find((row) => row.startsWith(`${CITY_COOKIE}=`));
    return toCity(match ? decodeURIComponent(match.split("=")[1]) : null);
  } catch {
    return DEFAULT_CITY;
  }
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const setCity = (next: City) => {
  document.cookie = `${CITY_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
  listeners.forEach((listener) => listener());
};

export const useCity = () => {
  const city = useSyncExternalStore(subscribe, readCityCookie, () => DEFAULT_CITY);
  const { name, markup, shippingLabel } = CITY_CONFIG[city];

  return {
    city,
    cityName: name,
    markup,
    shippingLabel,
    setCity,
    priceFor: (basePrice: number) => applyCityMarkup(basePrice, city),
    lineTotal: (baseTotal: number, quantity: number) => Math.round((baseTotal + markup * quantity) * 100) / 100,
  };
};
