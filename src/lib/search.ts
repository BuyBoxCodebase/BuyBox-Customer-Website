// Client for the backend product search (GET /search, GET /search/suggest).
// The same search powers Lino, so results here and in chat agree.

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";


export const SORT_OPTIONS = [
  { value: "relevance", label: "Best match" },
  { value: "price_low_to_high", label: "Price: low to high" },
  { value: "price_high_to_low", label: "Price: high to low" },
  { value: "newest", label: "Newest" },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]["value"];

export interface SearchFilters {
  brand?: string;
  category?: string;
  gender?: "male" | "female" | "unisex";
  colour?: string;
  size?: string;
  minPrice?: number;
  maxPrice?: number;
}

export type FilterName = keyof SearchFilters;

export interface SearchProduct {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  categoryId: string | null;
  subCategoryId: string | null;
  image: string | null;
  price: number;
  priceRange: { min: number; max: number };
  availableSizes: string[];
  availableColours: string[];
  variantId: string;
  variantImages: string[];
  variantOptions: string[];
  stock: number;
  summary: string;
}

export interface FacetValue {
  value: string;
  count: number;
}

export interface SearchResponse {
  text: string;
  filters: SearchFilters;
  requestedFilters: SearchFilters;
  sort: SortOption;
  relaxed: { droppedFilters: FilterName[]; widenedPrice: { minPrice?: number; maxPrice?: number } | null } | null;
  products: SearchProduct[];
  facets: {
    brands: FacetValue[];
    colours: FacetValue[];
    sizes: FacetValue[];
    price: { min: number; max: number } | null;
  };
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  tookMs: number;
}

export interface SuggestResponse {
  brands: string[];
  categories: string[];
  products: { id: string; name: string; brand: string | null; image: string | null; price: number }[];
}

// What the /search page URL holds: the text plus the filters the customer chose.
export interface SearchParams extends SearchFilters {
  q: string;
  sort?: SortOption;
}

const FILTER_NAMES: FilterName[] = ["brand", "category", "gender", "colour", "size", "minPrice", "maxPrice"];
export const PAGE_SIZE = 24;

export function readSearchParams(params: Record<string, string | string[] | undefined>): SearchParams {
  const value = (key: string) => {
    const raw = params[key];
    return (Array.isArray(raw) ? raw[0] : raw)?.trim() || undefined;
  };
  const number = (key: string) => {
    const raw = value(key);
    return raw !== undefined && Number.isFinite(Number(raw)) ? Number(raw) : undefined;
  };
  const sort = value("sort");

  return {
    q: value("q") ?? "",
    brand: value("brand"),
    category: value("category"),
    gender: value("gender") as SearchFilters["gender"],
    colour: value("colour"),
    size: value("size"),
    minPrice: number("minPrice"),
    maxPrice: number("maxPrice"),
    sort: SORT_OPTIONS.some((option) => option.value === sort) ? (sort as SortOption) : undefined,
  };
}

function toQueryString(params: SearchParams, extra: Record<string, string | number> = {}): string {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  for (const name of FILTER_NAMES) {
    const filter = params[name];
    if (filter !== undefined && filter !== "") query.set(name, String(filter));
  }
  if (params.sort && params.sort !== "relevance") query.set("sort", params.sort);
  for (const [key, val] of Object.entries(extra)) query.set(key, String(val));
  return query.toString();
}

// The URL of the results page for these params.
export function searchUrl(params: SearchParams): string {
  const query = toQueryString(params);
  return query ? `/search?${query}` : "/search";
}

export async function searchProducts(params: SearchParams, page = 1): Promise<SearchResponse> {
  const response = await fetch(`${BACKEND_URL}/search?${toQueryString(params, { page, pageSize: PAGE_SIZE })}`, {
    cache: "no-store", // stock changes all the time; the backend caches what can be cached
  });
  if (!response.ok) throw new Error(`Search failed (${response.status})`);
  return response.json();
}

export async function fetchSuggestions(q: string, signal?: AbortSignal): Promise<SuggestResponse> {
  const response = await fetch(`${BACKEND_URL}/search/suggest?q=${encodeURIComponent(q)}`, { signal });
  if (!response.ok) throw new Error(`Suggest failed (${response.status})`);
  return response.json();
}

// After a search the backend has split the text into free text + filters. Changing one filter
// builds the next URL from that split, so removing the "Nike" chip doesn't re-read "nike" from the text.
export function refineSearch(result: SearchResponse, sort: SortOption | undefined, change: Partial<SearchFilters>): string {
  const filters: SearchFilters = { ...result.requestedFilters, ...change };
  for (const name of FILTER_NAMES) if (filters[name] === undefined) delete filters[name];
  return searchUrl({ q: result.text, ...filters, sort });
}

export const FILTER_LABELS: Record<FilterName, string> = {
  brand: "Brand",
  category: "Category",
  gender: "Gender",
  colour: "Colour",
  size: "Size",
  minPrice: "Min price",
  maxPrice: "Max price",
};

export function describeFilter(name: FilterName, value: string | number): string {
  if (name === "size") return `Size ${value}`;
  if (name === "minPrice") return `Over $${value}`;
  if (name === "maxPrice") return `Under $${value}`;
  if (name === "gender") return value === "male" ? "Men" : value === "female" ? "Women" : "Unisex";
  return String(value).charAt(0).toUpperCase() + String(value).slice(1);
}
