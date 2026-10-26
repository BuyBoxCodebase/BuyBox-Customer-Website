"use client";

import { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FacetValue, refineSearch, SearchFilters, SearchResponse, SortOption } from "@/lib/search";

// Filter panel built from what is actually in stock for this search. Each option is a link,
// so the URL always describes the page.
export function SearchFacets({ result, sort }: { result: SearchResponse; sort?: SortOption }) {
  const { facets, filters } = result;
  const link = (change: Partial<SearchFilters>) => refineSearch(result, sort, change);

  return (
    <div className="flex flex-col gap-6 text-sm">
      {facets.brands.length > 1 || filters.brand ? (
        <FacetSection title="Brand">
          <OptionList
            values={facets.brands}
            selected={filters.brand}
            href={(value) => link({ brand: value === filters.brand ? undefined : value })}
          />
        </FacetSection>
      ) : null}

      {facets.sizes.length > 0 && (
        <FacetSection title="Size">
          <div className="grid grid-cols-4 gap-1.5">
            {facets.sizes.map(({ value, count }) => {
              const active = sameSize(value, filters.size);
              return (
                <Link
                  key={value}
                  href={link({ size: active ? undefined : value })}
                  title={`${count} ${count === 1 ? "product" : "products"}`}
                  className={`h-9 flex items-center justify-center rounded-md border text-xs ${
                    active ? "bg-black text-white border-black" : "bg-white border-gray-300 hover:border-black"
                  }`}
                >
                  {value}
                </Link>
              );
            })}
          </div>
        </FacetSection>
      )}

      {facets.colours.length > 0 && (
        <FacetSection title="Colour">
          <OptionList
            values={facets.colours}
            selected={filters.colour}
            capitalise
            href={(value) => link({ colour: value === filters.colour ? undefined : value })}
          />
        </FacetSection>
      )}

      {facets.price && facets.price.max > facets.price.min && (
        <FacetSection title="Price">
          <PriceRange result={result} sort={sort} />
        </FacetSection>
      )}
    </div>
  );
}

function FacetSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-semibold mb-2">{title}</h2>
      {children}
    </section>
  );
}

function OptionList({
  values,
  selected,
  href,
  capitalise = false,
}: {
  values: FacetValue[];
  selected?: string;
  href: (value: string) => string;
  capitalise?: boolean;
}) {
  return (
    <ul className="flex flex-col gap-1">
      {values.slice(0, 12).map(({ value, count }) => {
        const active = selected?.toLowerCase() === value.toLowerCase();
        return (
          <li key={value}>
            <Link
              href={href(value)}
              className={`flex justify-between rounded px-2 py-1 ${active ? "bg-black text-white" : "hover:bg-gray-100"}`}
            >
              <span className={capitalise ? "capitalize" : undefined}>{value}</span>
              <span className={active ? "text-white/70" : "text-gray-400"}>{count}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function PriceRange({ result, sort }: { result: SearchResponse; sort?: SortOption }) {
  const router = useRouter();
  const { filters, facets } = result;

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const read = (key: string) => {
      const value = String(data.get(key) ?? "").trim();
      return value !== "" && Number.isFinite(Number(value)) ? Number(value) : undefined;
    };
    router.push(refineSearch(result, sort, { minPrice: read("minPrice"), maxPrice: read("maxPrice") }));
  };

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2">
      <input
        name="minPrice"
        type="number"
        min={0}
        defaultValue={filters.minPrice}
        placeholder={`$${Math.floor(facets.price!.min)}`}
        aria-label="Minimum price"
        className="w-full h-9 rounded-md border border-gray-300 px-2"
      />
      <span className="text-gray-400">–</span>
      <input
        name="maxPrice"
        type="number"
        min={0}
        defaultValue={filters.maxPrice}
        placeholder={`$${Math.ceil(facets.price!.max)}`}
        aria-label="Maximum price"
        className="w-full h-9 rounded-md border border-gray-300 px-2"
      />
      <button type="submit" className="h-9 px-3 rounded-md bg-black text-white">Go</button>
    </form>
  );
}

// Facet sizes are shown as stored ("US 9"); the applied filter is normalised ("9").
function sameSize(value: string, selected?: string): boolean {
  if (!selected) return false;
  const normalise = (size: string) => {
    const text = size.toLowerCase().replace(/\b(us|uk|eu|size)\b/g, "").replace(/\s+/g, "");
    return Number.isNaN(Number(text)) ? text : String(Number(text));
  };
  return normalise(value) === normalise(selected);
}
