"use client";

import { Menu, X, ArrowLeft, Search, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { SearchBar } from "./components/SearchBar";
import { CartIcon } from "./components/CartIcon";
import { CitySwitcher } from "./components/CitySwitcher";
import { UserDropdown } from "./components/UserDropdown";
import { MobileMenu } from "./components/MobileMenu";
import { Button } from "../ui/button";
import { useAuth } from "../../context/AuthContext";
import { User } from "@/types/auth";
import { useEventTracking } from "@/hooks/analytics";
import { motion } from "framer-motion";

export default function Navbar() {

  const [searchOpen, setSearchOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { trackClick } = useEventTracking();

  const pathname = usePathname();
  const router = useRouter();
  const showBackButton = pathname !== "/";

  useEffect(() => {
    setSearchOpen(false);
  }, [pathname]);

  return (
    <>
      <Toaster />
      <nav className="fixed top-0 left-0 right-0 bg-white z-[999] border-b">
        <div className="container mx-auto px-4">
          <div className="h-16 flex items-center justify-between gap-4">
            {/* Desktop Nav Items */}
            <motion.a
              whileHover={{ y: -3, scale: 1.1 }}
              href="/"
              className="text-gray-800 text-2xl font-semibold hidden lg:flex">
              Treides
            </motion.a>
            <div className="hidden lg:flex flex-1 max-w-xl items-center">
              <SearchBar />
            </div>

            <div className="hidden lg:flex items-center gap-4 ml-auto">
              <CitySwitcher />
              <CartIcon />
              {isAuthenticated ? (
                <UserDropdown user={user as User} onLogout={logout} />
              ) : (
                <Link href="/user/login">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="flex items-center gap-1 px-2">
                    <span className="text-sm font-medium">Sign in</span>
                    <UserIcon className="w-6 h-6" />
                  </Button>
                </Link>
              )}
            </div>

            <div className="flex lg:hidden flex-1 items-center gap-2 min-w-0">
              <div
                className="overflow-hidden flex-shrink-0 transition-all duration-300 ease-in-out"
                style={{ width: showBackButton ? "40px" : "0px" }}>
                <button
                  aria-label="Go back"
                  onClick={() => router.back()}
                  className="p-2 hover:bg-gray-100 rounded-full transition-all duration-300 ease-in-out"
                  style={{
                    transform: showBackButton
                      ? "translateX(0)"
                      : "translateX(-40px)",
                    opacity: showBackButton ? 1 : 0,
                  }}>
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>

              {searchOpen ? (
                <>
                  <div className="flex-1 min-w-0">
                    <SearchBar autoFocus />
                  </div>
                  <button
                    aria-label="Close search"
                    onClick={() => setSearchOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <>
                  <CitySwitcher />
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      aria-label="Search"
                      onClick={() => setSearchOpen(true)}
                      className="p-2 hover:bg-gray-100 rounded-full">
                      <Search className="w-6 h-6" />
                    </button>
                    <CartIcon />
                    <div className="sm:hidden">
                      {isAuthenticated ? (
                        <Link
                          href={`/user/profile`}
                          className="text-sm font-medium hover:text-gray-800">
                          <UserIcon className="w-6 h-6" />
                        </Link>
                      ) : (
                        <Link href="/user/login">
                          <Button
                            variant="ghost"
                            size="lg"
                            className="flex items-center gap-1 px-2">
                            <span className="text-sm font-medium">Sign in</span>
                            <UserIcon className="w-6 h-6" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
