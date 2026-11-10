export const CITIES = ["mutare", "harare", "bulawayo"] as const;
export type City = (typeof CITIES)[number];

export const DEFAULT_CITY: City = "harare";
export const CITY_COOKIE = "user_city";

type CityConfig = {
  name: string;
  markup: number;
  shippingLabel: string;
};

export const CITY_CONFIG: Record<City, CityConfig> = {
  mutare: { name: "Mutare", markup: 0, shippingLabel: "Free Mutare Pickup/Delivery" },
  harare: { name: "Harare", markup: 5, shippingLabel: "Free Express Delivery to Harare" },
  bulawayo: { name: "Bulawayo", markup: 10, shippingLabel: "Free Delivery to Bulawayo" },
};

export function isCity(value: unknown): value is City {
  return typeof value === "string" && (CITIES as readonly string[]).includes(value);
}

export function toCity(value: unknown): City {
  const normalised = typeof value === "string" ? value.trim().toLowerCase() : "";
  return isCity(normalised) ? normalised : DEFAULT_CITY;
}

export function applyCityMarkup(basePrice: number, city: City): number {
  return Math.round((basePrice + CITY_CONFIG[city].markup) * 100) / 100;
}
