"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Product } from "@/types/product";
import { AddToCartButton } from "@/components/ui/AddToCartButton";
import { TrackImpression } from "@/components/analytics/TrackImpression";
import { trackEvent } from "@/lib/analytics/core";
import { ProductEventType } from "@/lib/analytics/constants";

interface ProductCardProps {
  product: Product;
  /**
   * "grid" is the vertical tile: image on top, details under it. It is the
   * default because most callers (the rails, the 6-up category grids) give the
   * card a ~200px column, and the horizontal card needs roughly 500px before
   * its image column and its text stop fighting for the same space.
   * "list" is that horizontal card, for the full-width search and subcategory
   * results.
   */
  layout?: "grid" | "list";
}

export function ProductCard({ product }: ProductCardProps) {

  const quantity = product.inventory?.quantity ?? 0;
  const isOutOfStock = quantity === 0;

  const salePrice = product.price ?? product.basePrice;
  const discountPercent = Math.floor(Math.random() * (40 - 10 + 1)) + 10;

  // Get all available images
  const allImages = [
    ...(product.defaultVariant?.images || []),
    ...(product.images || [])
  ].filter(Boolean);

  // Fallback to placeholder if no images - LIMIT TO MAXIMUM 4 IMAGES
  const images = allImages.length > 0 ? allImages.slice(0, 4) : ["/placeholder.svg"];

  // Split the price into dollars and cents for formatting
  const [dollars, cents] = salePrice.toLocaleString().split(".");

  const deliveryText = "Free shipping on orders over $50";

  // Dynamic image grid layout based on number of images (MAX 4)
  const renderImageGrid = () => {
    const imageCount = Math.min(images.length, 4); // Max 4 images to display
    const totalImages = allImages.length; // Total images for "+more" indicator
    
    if (imageCount === 1) {
      return (
        <div className="relative w-full h-full overflow-hidden bg-gray-50" style={{ aspectRatio: '1/1' }}>
          <Image
            src={images[0]}
            alt={product.name}
            fill
            className="object-cover object-center hover:scale-105 transition-transform duration-300"
          />
        </div>
      );
    }
    
    if (imageCount === 2) {
      return (
        <div className="flex gap-2 h-full">
          {images.slice(0, 2).map((image, index) => (
            <div 
              key={index} 
              className="relative w-1/2 overflow-hidden bg-gray-50"
              style={{ aspectRatio: '1/1' }}
            >
              <Image
                src={image}
                alt={`${product.name} ${index + 1}`}
                fill
                className="object-cover object-center hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      );
    }
    
    if (imageCount === 3) {
      return (
        <div className="flex gap-2 h-full">
          {/* Left large square - takes 50% width */}
          <div className="relative w-1/2 overflow-hidden bg-gray-50">
            <Image
              src={images[0]}
              alt={`${product.name} 1`}
              fill
              className="object-cover object-center hover:scale-105 transition-transform duration-300"
            />
          </div>
          {/* Right column - two stacked squares - takes 50% width */}
          <div className="flex flex-col w-1/2 gap-2">
            <div className="relative h-1/2 overflow-hidden bg-gray-50">
              <Image
                src={images[1]}
                alt={`${product.name} 2`}
                fill
                className="object-cover object-center hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="relative h-1/2 overflow-hidden bg-gray-50">
              <Image
                src={images[2]}
                alt={`${product.name} 3`}
                fill
                className="object-cover object-center hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      );
    }
    
    // 4 images - 2x2 grid
    if (imageCount === 4) {
      return (
        <div className="grid grid-cols-2 gap-2 h-full">
          {images.slice(0, 4).map((image, index) => (
            <div 
              key={index} 
              className="relative overflow-hidden bg-gray-50"
            >
              <Image
                src={image}
                alt={`${product.name} ${index + 1}`}
                fill
                className="object-cover object-center hover:scale-105 transition-transform duration-300"
              />
              {/* Show "+more" indicator on the 4th image if there are more images */}
              {index === 3 && totalImages > 4 && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    +{totalImages - 4} more
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }
    
    // Fallback - should not reach here with max 4 images
    return null;
  };

  return (
    <TrackImpression productId={product.id} categoryId={product.categoryId || undefined}>
      <Link 
        href={`/product/${product.id}`} 
        className="block group h-full"
        onClick={() => {
          trackEvent({
            type: ProductEventType.PRODUCT_CLICK,
            productId: product.id,
            categoryId: product.categoryId || undefined
          });
        }}
      >
        <Card className="flex flex-col bg-white hover:shadow-xl transition-all duration-300 h-full overflow-hidden border border-gray-200 shadow-md">
        {/* Dynamic Image Grid - Enhanced styling */}
        <div className="relative w-full aspect-[4/4] p-3">
          {renderImageGrid()}
        </div>

        {/* Product Details - Same as before */}
        <div className="flex flex-col justify-between flex-1 min-w-0 p-4 sm:p-5">
          <div className="flex-1">
            {/* Title & Description */}
            <div className="mb-4">
              <h1 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight min-h-[2.5em]">
                {product.name}
              </h1>
              <h2 className="text-sm sm:text-sm text-gray-600 mt-2 line-clamp-3 min-h-[3.75rem]">
                {product.description}
              </h2>
            </div>

            {/* Price Section */}
            <div className="mb-4">
              <div className="flex flex-wrap items-baseline gap-2">
                <div className="inline-flex items-baseline">
                  <span className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                    ${dollars}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 ml-1">
                    {cents || "00"}
                  </span>
                </div>
              </div>

              {/* Delivery Info */}
              <p className="text-xs sm:text-sm text-green-700 font-medium mt-2 flex items-center">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                {deliveryText}
              </p>
            </div>
          </div>

          {/* Add to Cart Button */}
          <AddToCartButton 
            product={product} 
            className="w-full sm:w-48 h-9 sm:h-10 px-4 py-2 text-xs sm:text-sm font-medium rounded-full"
          />
        </div>
      </Card>
    </Link>
    </TrackImpression>
  );
}