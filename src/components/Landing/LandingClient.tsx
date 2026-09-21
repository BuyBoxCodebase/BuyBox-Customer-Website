"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search, ArrowRight, User as UserIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CartIcon } from "@/components/navbar/components/CartIcon";
import { UserDropdown } from "@/components/navbar/components/UserDropdown";
import { Button } from "@/components/ui/button";
import { User } from "@/types/auth";

export default function LandingClient({ subcategories }: { subcategories: any[] }) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

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
    <div className="relative min-h-screen w-full flex flex-col bg-[#f5f4f0]">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/wall.jpg"
          alt="Clean Shopping Background Desktop"
          fill
          className="object-cover hidden md:block"
          priority
        />
        <Image
          src="/wall-mobile.jpg"
          alt="Clean Shopping Background Mobile"
          fill
          className="object-cover md:hidden"
          priority
        />
      </div>

      {/* Header */}
      <header className="relative z-50 w-full px-4 md:px-8 py-4 md:py-6 flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-bold tracking-widest text-gray-900 drop-shadow-sm">TREIDES</h1>
        
        <div className="flex items-center gap-2 md:gap-4 text-gray-900 bg-white/50 backdrop-blur-md px-3 md:px-4 py-2 rounded-full shadow-sm">
          <CartIcon />
          {isAuthenticated ? (
            <UserDropdown user={user as User} onLogout={logout} />
          ) : (
            <Link href="/user/login">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 px-2 h-8 hover:bg-white/60">
                <span className="text-sm font-medium hidden sm:inline">Sign in</span>
                <UserIcon className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center px-4 -mt-12 md:-mt-16 w-full">
        <div className="text-center mb-6 md:mb-10 mt-10 md:mt-0">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-medium text-gray-900 mb-3 md:mb-4 tracking-tight leading-tight">
            What are you<br />looking for?
          </h2>
          <p className="text-gray-600 text-base md:text-lg px-2">
            Tell us what you have in mind. We'll take it from there.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="w-full max-w-2xl relative mb-8 px-2 md:px-0">
          <div className="absolute left-6 md:left-6 top-1/2 -translate-y-1/2 text-gray-500">
            <Search className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. I need running shoes..."
            className="w-full pl-12 md:pl-14 pr-14 md:pr-16 py-4 md:py-5 rounded-full border-none shadow-lg text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-gray-300 placeholder:text-gray-400"
          />
          <button
            type="submit"
            className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 bg-black text-white p-2.5 md:p-3 rounded-full hover:bg-gray-800 transition-colors"
          >
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </form>

        <Link href="/shop" className="mb-10 md:mb-12">
          <Button variant="outline" className="rounded-full bg-white/80 backdrop-blur-sm px-6 md:px-8 py-2 text-sm md:text-base hover:bg-white text-gray-800 border-gray-300 shadow-sm transition-all hover:shadow-md">
            Browse For You
          </Button>
        </Link>

        {/* Divider */}
        {displayCategories.length > 0 && (
          <div className="flex items-center gap-3 md:gap-4 w-full max-w-2xl mb-6 md:mb-8 px-4">
            <div className="h-[1px] flex-grow bg-gray-300/60"></div>
            <span className="text-xs md:text-sm text-gray-500 whitespace-nowrap">or explore categories</span>
            <div className="h-[1px] flex-grow bg-gray-300/60"></div>
          </div>
        )}

        {/* Category Pills (now with images) */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 max-w-5xl px-2 pb-8">
          {displayCategories.map((cat) => (
            <Link
              key={cat.name}
              href={cat.path}
              className="flex items-center gap-2 md:gap-3 bg-white/90 backdrop-blur-sm pr-4 md:pr-6 pl-1.5 md:pl-2 py-1.5 md:py-2 rounded-full shadow-sm hover:shadow-md transition-all group"
            >
              {cat.image ? (
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden relative flex-shrink-0">
                  <Image src={cat.image} alt={cat.name} fill className="object-cover group-hover:scale-110 transition-transform" />
                </div>
              ) : (
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-400 text-[10px] md:text-xs">No img</span>
                </div>
              )}
              <span className="text-xs md:text-sm font-medium text-gray-800 whitespace-nowrap">{cat.name}</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
