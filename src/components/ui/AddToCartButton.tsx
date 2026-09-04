"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartContext } from "../../context/CartContext";
import { useToast } from "@/hooks/toast/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useEventTracking } from "@/hooks/analytics/useEventTracking";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/product";

import { ShoppingCart } from "lucide-react";

interface AddToCartButtonProps {
  product: Product;
  className?: string;
  iconOnly?: boolean;
}

export function AddToCartButton({ product, className = "", iconOnly = false }: AddToCartButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { addProductToCart } = useCartContext();
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const { isAuthenticated } = useAuth();
  const { trackAddtoCart } = useEventTracking();

  const salePrice = product.price ?? product.basePrice;
  const quantity = product.inventory?.quantity ?? 0;
  const isOutOfStock = quantity === 0;

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
    <button
      onClick={handleAddToCart}
      disabled={isAdding || isOutOfStock}
      className={`transition-all duration-200 ${
        isOutOfStock
          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
          : "bg-yellow-400 text-black hover:bg-yellow-500 shadow-sm hover:shadow-md"
      } ${className}`}
    >
      {isOutOfStock
        ? (iconOnly ? <ShoppingCart className="h-6 w-6 opacity-50" /> : "Out of Stock")
        : isAdding
        ? (
            <span className="flex items-center justify-center">
              <svg className={`animate-spin ${iconOnly ? '' : '-ml-1 mr-2'} h-3 w-3 sm:h-4 sm:w-4`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {!iconOnly && "Adding..."}
            </span>
          )
        : (iconOnly ? <ShoppingCart className="h-4 w-4" /> : "Add to Cart")
      }
    </button>
  );
}
