"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCartContext } from "../../context/CartContext";
import { useToast } from "@/hooks/toast/use-toast";
import { Product } from "@/types/product";
import { useEventTracking } from "@/hooks/analytics/useEventTracking";
import Cookies from "js-cookie";
import { useAuth } from "@/context/AuthContext";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { addProductToCart } = useCartContext();
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const { isAuthenticated } = useAuth();
  const { trackAddtoCart } = useEventTracking();

  const quantity = product.inventory?.quantity ?? 0;
  const isOutOfStock = quantity === 0;

  const salePrice = product.price ?? product.basePrice;
  const discountPercent = Math.floor(Math.random() * (40 - 10 + 1)) + 10;

  // Get all available images
  const allImages = [
    ...(product.defaultVariant?.images || []),
    ...(product.images || [])
  ].filter(Boolean);

  // Fallback to placeholder if no images
  const images = allImages.length > 0 ? allImages : ["/placeholder.png"];

  // Split the price into dollars and cents for formatting
  const [dollars, cents] = salePrice.toLocaleString().split(".");

  const deliveryText = "Free shipping on orders over $50";

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add items to your cart.",
        variant: "default",
        action: (
          <Button variant="orange" onClick={() => router.push("/user/login")}>
            Log In
          </Button>
        ),
      });
      return;
    }

    setIsAdding(true);
    try {
      await addProductToCart([
        {
          productId: product.id,
          quantity: 1,
          variantId: product.defaultVariant?.id || null,
        },
      ]);
      trackAddtoCart(product.id, 1, salePrice);

      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  // Dynamic image grid layout based on number of images
  const renderImageGrid = () => {
    const imageCount = Math.min(images.length, 5); // Max 5 images to display
    
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
    
    if (imageCount === 4) {
      return (
        <div className="grid grid-cols-2 gap-2 h-full">
          {/* Top row */}
          <div className="relative overflow-hidden bg-gray-50">
            <Image
              src={images[0]}
              alt={`${product.name} 1`}
              fill
              className="object-cover object-center hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="relative overflow-hidden bg-gray-50">
            <Image
              src={images[1]}
              alt={`${product.name} 2`}
              fill
              className="object-cover object-center hover:scale-105 transition-transform duration-300"
            />
          </div>
          {/* Bottom row */}
          <div className="relative overflow-hidden bg-gray-50">
            <Image
              src={images[2]}
              alt={`${product.name} 3`}
              fill
              className="object-cover object-center hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="relative overflow-hidden bg-gray-50">
            <Image
              src={images[3]}
              alt={`${product.name} 4`}
              fill
              className="object-cover object-center hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
      );
    }
    
    // 5 or more images - using a 3x2 grid with the first image taking 2 rows
    return (
      <div className="grid grid-cols-3 grid-rows-2 gap-2 h-full">
        <div className="relative row-span-2 col-span-2 overflow-hidden bg-gray-50">
          <Image
            src={images[0]}
            alt={`${product.name} 1`}
            fill
            className="object-cover object-center hover:scale-105 transition-transform duration-300"
          />
        </div>
        {images.slice(1, 5).map((image, index) => (
          <div 
            key={index} 
            className="relative overflow-hidden bg-gray-50"
            style={{ aspectRatio: '1/1' }}
          >
            <Image
              src={image}
              alt={`${product.name} ${index + 2}`}
              fill
              className="object-cover object-center hover:scale-105 transition-transform duration-300"
            />
            {index === 3 && images.length > 5 && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  +{images.length - 5} more
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Link href={`/product/${product.id}`} className="block group mb-4">
      <Card className="flex flex-col sm:flex-row bg-white hover:shadow-xl transition-all duration-300 h-full overflow-hidden border border-gray-200 shadow-md">
        {/* Dynamic Image Grid - Enhanced styling */}
        <div className="relative flex-shrink-0 h-80 sm:h-68 w-full sm:w-56 md:w-64 lg:w-72 p-3">
          {renderImageGrid()}
        </div>

        {/* Product Details - Same as before */}
        <div className="flex flex-col justify-between flex-1 p-4 sm:p-5">
          <div className="flex-1">
            {/* Title & Description */}
            <div className="mb-4">
              <h1 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
                {product.name}
              </h1>
              <h2 className="text-sm sm:text-sm text-gray-600 mt-2 line-clamp-3">
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
          <button
            onClick={handleAddToCart}
            disabled={isAdding || isOutOfStock}
            className={`w-full sm:w-48 h-9 sm:h-10 px-4 py-2 text-xs sm:text-sm font-medium rounded-full transition-all duration-200 ${
              isOutOfStock
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-yellow-400 text-black hover:bg-yellow-500 shadow-sm hover:shadow-md"
            }`}
          >
            {isOutOfStock
              ? "Out of Stock"
              : isAdding
              ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-3 w-3 sm:h-4 sm:w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </span>
                )
              : "Add to Cart"
            }
          </button>
        </div>
      </Card>
    </Link>
  );
}