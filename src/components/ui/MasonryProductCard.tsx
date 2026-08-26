"use client";

import React from "react";
import Link from "next/link";
import { Product } from "@/types/product";
import { AddToCartButton } from "@/components/ui/AddToCartButton";

export function MasonryProductCard({ product, hideBadge = false, showAddToCart = false }: { product: Product, hideBadge?: boolean, showAddToCart?: boolean }) {
  const salePrice = product.price ?? product.basePrice;
  const [dollars, cents] = salePrice.toLocaleString().split(".");
  const quantity = product.inventory?.quantity ?? 0;
  const isOutOfStock = quantity === 0;
  
  // Use the first image or fallback
  const mainImage = product.images?.[0] || product.defaultVariant?.images?.[0] || "/placeholder.svg";

  return (
    <Link 
      href={`/product/${product.id}`} 
      className="flex flex-col h-full group break-inside-avoid rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300"
    >
      <div className="relative w-full overflow-hidden bg-gray-50">
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        
        {!hideBadge && (
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-1 flex items-center">
            <span className="italic mr-1">HOT</span> Seller
          </div>
        )}
      </div>

      <div className={`flex flex-col justify-between flex-1 ${showAddToCart ? 'p-4' : 'p-3'}`}>
        <div>
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

        {showAddToCart && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <AddToCartButton 
              product={product} 
              className="w-full h-9 sm:h-10 px-4 py-2 text-xs sm:text-sm font-medium rounded-full" 
            />
          </div>
        )}
      </div>
    </Link>
  );
}
