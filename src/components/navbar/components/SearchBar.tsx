"use client";

import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchSuggestions, searchUrl, SuggestResponse } from "@/lib/search";
import { askLinoUrl } from "@/lib/lino";
import { AskButton } from "@/components/lino/AskButton";

interface SearchBarProps {
  className?: string;
}

const SUGGEST_DELAY_MS = 150;

export const SearchBar = ({ className = "" }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SuggestResponse | null>(null);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) {
      setSuggestions(null);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetchSuggestions(query, controller.signal)
        .then(setSuggestions)
        .catch(() => {}); // suggestions are optional; a failed or cancelled request just shows none
    }, SUGGEST_DELAY_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const go = (url: string) => {
    setOpen(false);
    router.push(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) go(searchUrl({ q: searchQuery.trim() }));
  };

  const handleAsk = () => go(askLinoUrl(searchQuery));

  const hasSuggestions =
    suggestions && (suggestions.brands.length + suggestions.categories.length + suggestions.products.length > 0);

  return (
    <form ref={containerRef} onSubmit={handleSubmit} action="." className={`relative w-full ${className}`}>
      <div className="relative flex items-center w-full">
        <input
          name="search"
          placeholder="Search or describe what you need..."
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          className="w-full h-10 px-4 rounded-md border border-gray-300 bg-white text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent pl-10 pr-20"
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <Search className="h-5 w-5 text-gray-800" />
        </div>
        <AskButton onClick={handleAsk} className="absolute right-1 top-1/2 -translate-y-1/2 h-8" />
      </div>

      {open && hasSuggestions && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-md border border-gray-200 bg-white shadow-lg py-2 text-sm text-black">
          {[...suggestions.brands.map((brand) => ({ label: brand, kind: "Brand", url: searchUrl({ q: "", brand }) })),
            ...suggestions.categories.map((category) => ({ label: category, kind: "Category", url: searchUrl({ q: "", category }) })),
          ].map(({ label, kind, url }) => (
            <button
              key={`${kind}-${label}`}
              type="button"
              onClick={() => go(url)}
              className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-100 text-left"
            >
              <span>{label}</span>
              <span className="text-xs text-gray-400">{kind}</span>
            </button>
          ))}

          {suggestions.products.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => go(`/product/${product.id}`)}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 text-left"
            >
              <div className="w-10 h-10 shrink-0 rounded bg-gray-100 overflow-hidden">
                {product.image && <img src={product.image} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate">{product.name}</div>
                {product.brand && <div className="text-xs text-gray-500">{product.brand}</div>}
              </div>
              <span className="font-medium">${product.price}</span>
            </button>
          ))}

          <button
            type="button"
            onClick={() => go(searchUrl({ q: searchQuery.trim() }))}
            className="w-full px-3 py-2 text-left text-gray-600 hover:bg-gray-100 border-t border-gray-100 mt-1"
          >
            Search for &ldquo;{searchQuery.trim()}&rdquo;
          </button>
        </div>
      )}
    </form>
  );
};
