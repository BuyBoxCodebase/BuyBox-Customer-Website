"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product";
import useGetAllProducts from "@/hooks/products/useGetAllProducts";

export default function HomePagePopularProducts() {
  const { products, loading } = useGetAllProducts();

  // Flatten the dictionary of products into a single array and take the first 20
  const trendingProducts = Object.values(products).flat().slice(0, 20);

  if (loading) {
    return <MasonrySkeleton />;
  }

  if (!trendingProducts || trendingProducts.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto px-2 md:px-4 py-4">
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h2 className="w-full whitespace-normal break-words md:w-auto text-xl md:text-2xl lg:text-2xl font-bold pl-2 lg:pl-4 text-black">
          Trending Now
        </h2>
      </div>

      {/* Tailwind CSS Columns for Masonry Layout */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {trendingProducts.map((product) => (
          <MasonryProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

function MasonryProductCard({ product }: { product: Product }) {
  const salePrice = product.price ?? product.basePrice;
  const [dollars, cents] = salePrice.toLocaleString().split(".");
  
  // Use the first image or fallback
  const mainImage = product.images?.[0] || product.defaultVariant?.images?.[0] || "/placeholder.svg";
  
  // Generate a random aspect ratio for the placeholder to simulate masonry variation
  // Only used if image doesn't load or while loading
  const randomHeightClasses = ["h-48", "h-64", "h-72", "h-80"];
  const randomHeight = randomHeightClasses[Math.floor(Math.random() * randomHeightClasses.length)];

  return (
    <Link 
      href={`/product/${product.id}`} 
      className="block group break-inside-avoid rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300"
    >
      <div className="relative w-full overflow-hidden bg-gray-50">
        {/* We use Next.js Image with 'fill' and object-cover if it was fixed, 
            but for Masonry we want the image to dictate height. 
            So we use layout='responsive' or regular img with w-full h-auto */}
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Hot Seller Badge (Shein style) */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-1 flex items-center">
          <span className="italic mr-1">HOT</span> Seller
        </div>
      </div>

      <div className="p-3">
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        
        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
          {product.description}
        </p>
        
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-red-500 font-bold text-lg">
            ${dollars}
          </span>
          <span className="text-red-500 font-bold text-xs">
            {cents ? `.${cents}` : ".00"}
          </span>
        </div>
      </div>
    </Link>
  );
}

function MasonrySkeleton() {
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="flex flex-wrap justify-between items-center mb-4 pr-4">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse ml-2 lg:ml-4" />
      </div>

      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {[250, 300, 200, 350, 280, 220, 310, 270].map((height, i) => (
          <div key={i} className="break-inside-avoid rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm">
            <div 
              className="w-full bg-gray-200 animate-pulse" 
              style={{ height: `${height}px` }} 
            />
            <div className="p-3">
              <div className="h-4 w-full bg-gray-200 animate-pulse rounded mb-2" />
              <div className="h-3 w-3/4 bg-gray-200 animate-pulse rounded mb-3" />
              <div className="h-5 w-1/3 bg-gray-200 animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
