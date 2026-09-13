// app/layout.tsx
import "./globals.css";
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
  title: "Treides - Shopping that comes to you",
  description: "Shop the latest in fashion, beauty, and more",
  verification: {
    google: "7jNi_sOZvDz9zyHHP1tMi3DF7ZEI46AQp2XFyPnlVvY",
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
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
      {/* extensions (ColorZilla, Grammarly, password managers) inject attributes
          onto <body> before React hydrates — suppress the resulting mismatch
          warning here rather than let it mask real hydration bugs deeper in the tree */}
      <body
        suppressHydrationWarning
        className={`${inter.className} bg-gray-50 min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <CartProvider>
            <Toaster />
            <main className="flex-grow">{children}</main>
          </CartProvider>
        </AuthProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}