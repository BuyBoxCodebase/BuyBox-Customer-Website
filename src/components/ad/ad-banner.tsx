import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState, useRef } from "react";

// Sample product data
const recommendedProducts = [
  {
    id: 1,
    title: "Keep shopping for",
    image: "/api/placeholder/120/120",
    alt: "Nivea Men Deodorant",
    category: "Personal Care",
  },
  {
    id: 2,
    title: "Recommended deal for you",
    image: "/api/placeholder/120/120",
    alt: "Nivea Men Products",
    category: "Skin Care",
  },
  {
    id: 3,
    title: "Deal for you",
    image: "/api/placeholder/120/120",
    alt: "Toy Figures",
    category: "Toys & Games",
  },
  {
    id: 4,
    title: "Based on your browsing",
    image: "/api/placeholder/120/120",
    alt: "Electronics",
    category: "Electronics",
  },
  {
    id: 5,
    title: "Top rated in",
    image: "/api/placeholder/120/120",
    alt: "Kitchen Appliances",
    category: "Home & Kitchen",
  },
  {
    id: 6,
    title: "New arrivals in",
    image: "/api/placeholder/120/120",
    alt: "Fashion Items",
    category: "Fashion",
  },
];

export default function AdBanner() {
  const scrollRef = useRef(null);

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Main Banner Container */}
      <div className="relative w-full rounded-lg overflow-hidden shadow-sm bg-gradient-to-b from-orange-50/70 to-orange-50/30 mb-2">
        <div className="flex flex-col md:flex-row items-center">
          {/* Left side content */}
          <div className="p-6 md:p-8 w-full md:w-3/5 text-gray-800 z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-1">Spring Sale</h2>
            <h3 className="text-xl md:text-2xl font-semibold mb-3">
              Up to 40% off
            </h3>
            <p className="text-base mb-5">
              Limited time offers on seasonal favorites
            </p>
            <button className="bg-gray-800 text-black font-semibold py-2 px-5 rounded-md flex items-center hover:bg-black transition-colors">
              Shop Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal scrolling products section */}
      <div className="relative">
        {/* Scrollable container */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto scrollbar-hide pb-4 pt-1 px-1 -mx-1 scroll-smooth gap-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {recommendedProducts.map((product) => (
            <div
              key={product.id}
              className="flex-none w-32 sm:w-40 mx-0.5 bg-white rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3">
                <p className="text-xs font-medium text-gray-700 mb-2 line-clamp-2 h-8">
                  {product.title}
                </p>
                <div className="aspect-square w-full bg-gray-100 rounded flex items-center justify-center">
                  <img
                    src={product.image}
                    alt={product.alt}
                    className="object-contain max-h-full max-w-full"
                  />
                </div>
                {/* <p className="text-xs mt-2 text-gray-500">{product.category}</p> */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
