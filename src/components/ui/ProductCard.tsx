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
  const {isAuthenticated} = useAuth();
  const { trackAddtoCart } = useEventTracking();

  const quantity = product.inventory?.quantity ?? 0;
  const isOutOfStock = quantity === 0;

  // const product.basePrice = product.basePrice * 1.5;
  const salePrice = product.price ?? product.basePrice;
  const discountPercent = Math.floor(Math.random() * (40 - 10 + 1)) + 10; // Random between 10-40%

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

  return (
    <Link href={`/product/${product.id}`} className="block">
      <Card className="flex flex-row bg-white rounded-lg hover:shadow-lg transition-shadow h-full">
        {/* Image - Responsive width but always on left */}
        <div className="relative flex-shrink-0 h-64 w-44">
          <Image
            src={
              product.defaultVariant?.images?.[0] ||
              product.images[0] ||
              "/placeholder.png"
            }
            alt={product.name}
            fill
            className="object-fill"
          />
        </div>

        {/* Details - Always to the right of image */}
        <div className="ml-4 justify-between items-center h-full py-2 pr-1">
          <div className="flex flex-col gap-2">
            {/* Title & Badge */}
            <div className="flex items-start">
              <h1 className="text-base sm:text-lg md:text-xl font-medium flex-1 line-clamp-2">
                {product.name}
              </h1>
            </div>
            <div>
              <h2 className="text-sm font-medium flex-1 line-clamp-3">
                {product.description}
              </h2>
            </div>
          </div>

          <div className="mt-1 sm:mt-2 md:mt-4">
            {/* Price & Discount - Modified to show dollars larger than cents */}
            <div className="flex flex-wrap items-baseline gap-1 sm:gap-2">
              <div className="inline-flex flex-wrap">
                <span className="text-xl sm:text-xl md:text-2xl font-semibold">
                  ${dollars}
                </span>
                <span className="text-xs font-semibold relative bottom-auto top-0 mt-1 ml-0.5">
                  {cents ? cents : "00"}
                </span>
              </div>
              {/* <span className="text-xs sm:text-sm md:text-base text-gray-500 line-through">
                ${product.basePrice.toLocaleString()}
              </span> */}
              {/* <span className="text-xs sm:text-sm md:text-base text-green-600">
                ({discountPercent}% off)
              </span> */}
            </div>

            {/* Delivery */}
            <p className="text-sm md:text-base text-green-900 mt-1 md:mt-2">
              {deliveryText}
            </p>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={isAdding || isOutOfStock}
            className={`w-full sm:w-48 md:w-56 h-10 self-end mt-2 sm:mt-3 md:mt-4 px-3 sm:px-4 md:px-6 py-1 sm:py-2 text-xs sm:text-sm md:text-base font-medium rounded-full ${
              isOutOfStock
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-yellow-400 text-black hover:bg-yellow-500"
            } transition-colors`}>
            {isOutOfStock
              ? "Out of Stock"
              : isAdding
              ? "Adding..."
              : "Add to Cart"}
          </button>
        </div>
      </Card>
    </Link>
  );
}
