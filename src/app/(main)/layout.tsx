// app/layout.tsx
import "./../globals.css";
import { Inter } from "next/font/google";
import type React from "react";
import Footer from "@/components/footer/Footer";
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/navbar/Navbar";
import { AuthProvider } from "@/context/AuthContext";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "BuyBox - Happiness, Delivered",
  description: "Shop the latest in fashion, beauty, and more",
  verification: {
    google: "7jNi_sOZvDz9zyHHP1tMi3DF7ZEI46AQp2XFyPnlVvY",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head />
      <body className={`${inter.className} bg-gray-50 min-h-screen flex flex-col`}>
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-grow pt-14 lg:pt-20">{children}</main>
          </CartProvider>
        </AuthProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}