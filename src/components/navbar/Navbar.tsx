"use client";

import { Menu, X, ArrowLeft, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { SearchBar } from "./components/SearchBar";
import { CartIcon } from "./components/CartIcon";
import { UserDropdown } from "./components/UserDropdown";
import { MobileMenu } from "./components/MobileMenu";
import { Button } from "../ui/button";
import { useAuth } from "../../context/AuthContext";
import { User } from "@/types/auth";
import { useEventTracking } from "@/hooks/analytics";
import { motion } from "framer-motion";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { trackClick } = useEventTracking();

  const pathname = usePathname();
  const router = useRouter();
  const showBackButton = pathname !== "/";

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
              BuyBox
            </motion.a>
            <div className="hidden lg:flex flex-1 max-w-xl items-center">
              <SearchBar />
            </div>

            <div className="hidden lg:flex items-center gap-4">
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

            {/* Mobile Nav Items */}
            <div className="flex lg:hidden flex-1 items-center gap-2 min-w-0">
              {/* Back button container with animation */}
              <div
                className="overflow-hidden flex-shrink-0 transition-all duration-300 ease-in-out"
                style={{ width: showBackButton ? "40px" : "0px" }}>
                <button
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

              {/* Search bar container with animation */}
              <div
                className="flex-1 min-w-0 transition-all duration-300 ease-in-out"
                style={{ marginLeft: showBackButton ? "0px" : "-40px" }}>
                {showBackButton ? (
                  <SearchBar />
                ) : (
                  <SearchBar className="pl-8" />
                )}
              </div>

              <div className="flex items-center gap-2">
                <CartIcon />

                {/* Mobile menu toggle button - uncommented */}
                {/* <button
                  className="p-2 hover:bg-gray-100 rounded-full flex-shrink-0"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </button> */}

                {/* Show user icon or sign in only on small mobile screens */}
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
            </div>
          </div>

          {/* {isMenuOpen && (
            <MobileMenu isLoggedIn={isAuthenticated} onLogout={logout} />
          )} */}
        </div>
      </nav>
    </>
  );
}
