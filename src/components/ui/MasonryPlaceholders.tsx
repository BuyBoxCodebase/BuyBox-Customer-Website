"use client";

import React from "react";
import Link from "next/link";

export function SearchPlaceholder() {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="w-full h-full min-h-[14rem] flex-1 bg-gray-50 hover:bg-gray-100 transition-colors rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center p-6 text-center cursor-pointer group break-inside-avoid"
    >
      <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:-translate-y-1 transition-transform">
        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </div>
      <h3 className="text-gray-800 font-medium text-sm sm:text-base">Didn't find it?</h3>
      <p className="text-gray-500 text-xs sm:text-sm mt-1">Scroll up to try searching</p>
    </button>
  );
}

export function ExplorePlaceholder() {
  return (
    <Link
      href="/#for-you"
      className="w-full h-full min-h-[14rem] flex-1 bg-gray-50 hover:bg-gray-100 transition-colors rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center p-6 text-center cursor-pointer group break-inside-avoid"
    >
      <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <h3 className="text-gray-800 font-medium text-sm sm:text-base">Explore More</h3>
      <p className="text-gray-500 text-xs sm:text-sm mt-1">Discover new arrivals</p>
    </Link>
  );
}
