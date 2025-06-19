"use client";
import React from "react";

const LandingPageSkeleton = () => {
  return (
    <div className="container mx-auto px-4 pt-8">
      {[...Array(3)].map((_, sectionIndex) => (
        <div key={sectionIndex}>
          {/* Section title skeleton */}
          <div className="flex flex-col sm:flex-row justify-between items-center p-4">
            <div className="h-8 bg-gray-200 rounded w-full sm:w-1/3 animate-pulse" />
          </div>
          {/* Grid skeleton: 1 col on mobile, 2 on small, 3 on medium, 4 on large */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array(4)
              .fill(0)
              .map((_, index) => (
                <div key={index} className="animate-pulse">
                  {/* Image placeholder */}
                  <div className="bg-gray-200 rounded-lg overflow-hidden aspect-square mb-2" />
                  {/* Text placeholders */}
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LandingPageSkeleton;