"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search, ArrowRight } from "lucide-react";

export default function LandingClient({ subcategories }: { subcategories: any[] }) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/chat?q=${encodeURIComponent(query.trim())}`);
    }
  };

  // Map backend subcategories to display items with images
  const displayCategories = subcategories.slice(0, 8).map(sub => ({
    name: sub.name,
    path: `/subcategory/${sub.categoryId}%2F${sub.name}`,
    image: sub.imageUrl
  }));

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-white sys-dark:bg-[#0a0a0a] transition-colors duration-300">
      {/* Main Content */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center px-4 w-full gap-10 md:gap-14">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-medium text-black sys-dark:text-white tracking-tight">
            Treides
          </h1>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="w-full max-w-[459px] relative mx-auto">
          <div className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-gray-500 sys-dark:text-gray-400">
            <Search className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What shoes are you looking for?"
            className="w-full pl-12 md:pl-16 pr-14 md:pr-16 py-3.5 md:py-4 rounded-full border border-gray-300 sys-dark:border-[#333] bg-transparent text-base md:text-lg focus:outline-none focus:border-gray-500 sys-dark:focus:border-gray-500 placeholder:text-gray-500 sys-dark:placeholder:text-gray-400 text-black sys-dark:text-white"
          />
          <button
            type="submit"
            className="absolute right-2 md:right-2.5 top-1/2 -translate-y-1/2 bg-black sys-dark:bg-white text-white sys-dark:text-black p-2 md:p-2.5 rounded-full hover:opacity-80 transition-opacity"
          >
            <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </form>

        {/* Categories */}
        <div className="flex flex-row flex-wrap justify-center gap-6 min-[450px]:gap-8 md:gap-10 max-w-5xl">
          {displayCategories.map((cat) => (
            <Link
              key={cat.name}
              href={cat.path}
              className="flex flex-col items-center gap-2 md:gap-3 group"
            >
              <div className="w-16 h-16 min-[450px]:w-20 min-[450px]:h-20 rounded-full border border-gray-300 sys-dark:border-white/30 p-1 flex-shrink-0 transition-all group-hover:border-gray-400 sys-dark:group-hover:border-white/60">
                {cat.image ? (
                  <div className="w-full h-full rounded-full overflow-hidden relative">
                    <Image src={cat.image} alt={cat.name} fill className="object-cover group-hover:scale-110 transition-transform duration-300" />
                  </div>
                ) : (
                  <div className="w-full h-full rounded-full bg-gray-50 sys-dark:bg-white/5 flex items-center justify-center">
                    <span className="text-gray-400 sys-dark:text-gray-500 text-[10px] min-[450px]:text-xs">No img</span>
                  </div>
                )}
              </div>
              <span className="text-xs min-[450px]:text-sm text-black sys-dark:text-white whitespace-nowrap">{cat.name}</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
